/**
 * Verifies the 0.6 floor and the State-authority warning against the same ten
 * complaints, using OpenRouter directly so Gemini's 5 req/min free tier is not
 * the limiting factor.
 *
 * Test-harness only: production still routes through lib/server/ai.ts. This
 * replicates that module's prompt and schema to check UI-facing behaviour —
 * which cases flag low-confidence, and which surface the State warning.
 */
import "./env.mjs";
import { shortlistAuthorities, getAuthorityById } from "@/lib/server/authorities";
import { CONFIDENCE_FLOOR } from "@/lib/server/ai";

const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) throw new Error("OPENROUTER_API_KEY missing from .env.local");

const MODEL = process.env.OR_MODEL ?? "google/gemini-2.5-flash";

const SYSTEM = `You route Indian citizens' grievances to the correct RTI (Right to Information) Public Authority — the office that physically holds the records being asked about.

Score confidence honestly, using these anchors:
- 0.9-1.0: the grievance names this authority or its scheme explicitly.
- 0.6-0.9: the domain clearly belongs to this authority, but the specific office is inferred.
- 0.4-0.6: plausible but unverified — several authorities could hold these records.
- Below 0.4: guessing. If none of the candidates plausibly holds these records, return your best guess at this level rather than inflating the score.

Never inflate a score to appear helpful. Routing a citizen to the wrong authority triggers a Section 6(3) transfer that restarts their 30-day clock, so an honest low score is more useful to them than a confident wrong answer.

Reply ONLY with JSON: {"candidates":[{"authorityId":"...","confidence":0.0,"reason":"..."}]}  (max 3, ranked)`;

const CASES = [
  { name: "pension, uses 'pension'", text: "my father pension stopped since march, we went to office 3 times no answer", ok: true },
  { name: "pension, plain words", text: "papa retired from factory two years back, monthly money has not come since diwali", ok: true },
  { name: "PF withdrawal, Hinglish", text: "PF ka paisa nikalne ke liye claim dala tha 2 mahine pehle, abhi tak kuch nahi aaya", ok: true },
  { name: "passport delay", text: "applied for passport in january, police verification done, still showing under process", ok: true },
  { name: "ration card, plain", text: "they removed my name from ration list, shopkeeper says system me nahi hai", ok: true },
  { name: "road not built", text: "the road to our village was sanctioned two years ago but nothing has been built", ok: false },
  { name: "income tax refund", text: "my income tax refund for AY 2023-24 has not been credited even after 8 months", ok: true },
  { name: "misspelled authority", text: "epfo pention not recieved since last yr, ppo number is with me", ok: true },
  { name: "railway refund", text: "train was cancelled and refund not given, ticket booked on irctc", ok: true },
  { name: "vague", text: "i want to know about the money spent in my area last year", ok: false },
];

async function route(grievance: string) {
  const { authorities: shortlist, noKeywordMatch } = shortlistAuthorities(grievance);
  const prompt = `<grievance>\n${grievance}\n</grievance>\n\nCandidate authorities (choose only from this list, by id):\n${shortlist
    .map((a) => `- id: ${a.id} | ${a.authorityName} | domain: ${a.domain}`)
    .join("\n")}${noKeywordMatch ? "\n\nNote: nothing matched our keywords; the full directory is shown. The right authority may not be listed at all — score accordingly." : ""}\n\nRank up to 3 candidates by confidence.`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      max_tokens: 400,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 160)}`);
  const body = await res.json();
  const parsed = JSON.parse(body.choices[0].message.content);
  return { candidates: parsed.candidates ?? [], noKeywordMatch };
}

console.log(`\n  model: ${MODEL}   floor: ${CONFIDENCE_FLOOR}\n`);
console.log("  case                        top authority          conf  flags");
console.log("  " + "-".repeat(74));

let caught = 0, bad = 0, falseWarn = 0;

for (const c of CASES) {
  try {
    const r = await route(c.text);
    const top = r.candidates[0];
    const auth = top ? getAuthorityById(top.authorityId) : undefined;
    const conf = top?.confidence ?? 0;
    const low = conf < CONFIDENCE_FLOOR;
    const isState = auth?.level === "state";

    const flags = [low ? "LOW-CONF" : "", isState ? "STATE-WARN" : ""].filter(Boolean).join(" ");
    console.log(
      `  ${c.name.padEnd(26)} ${(auth?.id ?? "(none)").padEnd(21).slice(0, 21)} ${conf.toFixed(2)}  ${flags}`
    );

    if (!c.ok) { bad++; if (low || isState) caught++; }
    if (c.ok && low) falseWarn++;
  } catch (e) {
    console.log(`  ${c.name.padEnd(26)} ERROR: ${e instanceof Error ? e.message : e}`);
  }
}

console.log(`\n  ── results ──`);
console.log(`  bad routes warned about:  ${caught}/${bad}`);
console.log(`  false warnings on good:   ${falseWarn}/${CASES.filter((c) => c.ok).length}`);
console.log(`\n  Note: STATE-WARN renders at the authority step (authority-step.tsx:314),`);
console.log(`  before the draft — but only for the SELECTED candidate.\n`);
