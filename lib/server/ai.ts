import { generateObject, type LanguageModel } from "ai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { shortlistAuthorities, type Authority } from "./authorities";

const PRIMARY_MODEL: LanguageModel = google("gemini-3.6-flash");
const FALLBACK_MODEL: LanguageModel = groq("openai/gpt-oss-120b");

/**
 * Gemini free tier is the primary model; Groq is the fallback if Gemini's
 * free-tier rate limit is hit (both are no-credit-card, no-cost providers).
 */
async function withModelFallback<T>(run: (model: LanguageModel) => Promise<T>): Promise<T> {
  try {
    return await run(PRIMARY_MODEL);
  } catch (error) {
    console.warn("Primary model (Gemini) failed, falling back to Groq:", error);
    return await run(FALLBACK_MODEL);
  }
}

const routingSchema = z.object({
  candidates: z
    .array(
      z.object({
        authorityId: z.string().describe("id field from the candidate list"),
        confidence: z.number().min(0).max(1),
        reason: z.string().describe("one short sentence on why this authority fits"),
      })
    )
    .min(1)
    .max(3),
  extractedReferences: z
    .array(z.string())
    .describe("dates, PPO/case/FIR numbers, or other identifiers found verbatim in the grievance"),
});

export type RoutingResult = {
  candidates: { authority: Authority; confidence: number; reason: string }[];
  extractedReferences: string[];
};

export async function routeGrievance(grievance: string): Promise<RoutingResult> {
  const shortlist = shortlistAuthorities(grievance);

  const { object } = await withModelFallback((model) =>
    generateObject({
      model,
      schema: routingSchema,
      prompt: `You are routing an Indian citizen's grievance to the correct RTI (Right to Information) Public Authority.

Grievance: "${grievance}"

Candidate authorities (choose only from this list, by id):
${shortlist.map((a) => `- id: ${a.id} | ${a.authorityName} | domain: ${a.domain}`).join("\n")}

Rank up to 3 candidates by confidence (0 to 1) that they hold the records this grievance concerns. Also extract any dates, PPO numbers, FIR numbers, case numbers, or other reference identifiers mentioned verbatim in the grievance — do not paraphrase them.`,
    })
  );

  const candidates = object.candidates
    .map((c) => {
      const authority = shortlist.find((a) => a.id === c.authorityId);
      return authority ? { authority, confidence: c.confidence, reason: c.reason } : null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return { candidates, extractedReferences: object.extractedReferences };
}

const draftSchema = z.object({
  items: z
    .array(z.string())
    .describe("numbered, itemized requests for specific documents/records/file notings — no opinions or interrogatives"),
  lifeOrLibertyFlag: z
    .boolean()
    .describe("true only if the grievance concerns imminent risk to life or personal liberty (e.g. medical emergency, custody, urgent eviction, denial of urgent treatment) per RTI Act Section 7(1)"),
});

export type DraftResult = {
  items: string[];
  lifeOrLibertyFlag: boolean;
  portalText: string;
  portalCharCount: number;
  fullText: string;
  overPortalLimit: boolean;
};

const PORTAL_LIMIT = 3000;
const PORTAL_TARGET = 2500;

export async function draftApplication(
  grievance: string,
  authority: Authority,
  extractedReferences: string[]
): Promise<DraftResult> {
  const { object } = await withModelFallback((model) =>
    generateObject({
      model,
      schema: draftSchema,
      prompt: `Rewrite this citizen grievance into an RTI application under India's Right to Information Act, 2005.

Grievance: "${grievance}"
Addressed to: ${authority.authorityName} (${authority.pioDesignation})
Reference identifiers to preserve verbatim if relevant: ${extractedReferences.join(", ") || "none found"}

Rules:
- Output only itemized requests for specific documents, records, orders, or file notings. RTI compels disclosure of information, not explanations or opinions.
- Strip all interrogatives ("why", "how could") and emotional language.
- Preserve any dates/reference numbers exactly as given, never paraphrase them.
- Keep the total itemized text concise enough to fit in roughly ${PORTAL_TARGET} characters combined, since the RTI Online portal enforces a hard ${PORTAL_LIMIT}-character field limit.
- Flag lifeOrLibertyFlag true only if the grievance concerns imminent risk to life or personal liberty (Section 7(1) of the Act shortens the response window to 48 hours in that case).`,
    })
  );

  const fullText = object.items.map((item, i) => `${i + 1}. ${item}`).join("\n");
  const portalText = fullText.length > PORTAL_TARGET ? fullText.slice(0, PORTAL_TARGET - 1).trimEnd() + "…" : fullText;

  return {
    items: object.items,
    lifeOrLibertyFlag: object.lifeOrLibertyFlag,
    portalText,
    portalCharCount: portalText.length,
    fullText,
    overPortalLimit: fullText.length > PORTAL_LIMIT,
  };
}
