import type { Authority, FilingChannel } from "./types";

/**
 * Which channel this application can actually be lodged through, and what it
 * costs.
 *
 * This exists because of a trap the official portal does not warn anyone about
 * until after they have paid. rtionline.gov.in serves Central Government
 * public authorities only; its own FAQ states that an application filed there
 * for a State authority "would be returned, without any refund of fee". Since
 * more than half our directory is state-level, sending a citizen to the
 * central portal on the strength of it being the well-known one would burn
 * their ten rupees and roughly a month.
 *
 * The citizen is never asked which channel applies. Knowing that a Tehsildar
 * is a State authority and EPFO is a Central one is precisely the knowledge
 * they do not have — it is the reason they are here.
 */

export const RTI_FEE_RUPEES = 10;
export const PORTAL_CHAR_LIMIT = 3000;
export const CENTRAL_PORTAL_URL = "https://rtionline.gov.in";

/**
 * Central or State.
 *
 * The submission form uses this to say which authorities this portal actually
 * serves, the way the real one does — rtionline.gov.in covers Central
 * Government public authorities, and most States run their own portal.
 *
 * The step-by-step "how to file it somewhere else" plan that used to live
 * beside this is gone: this platform takes the submission itself, so
 * instructions for carrying the text to another site described a product we
 * are not.
 */
export function resolveChannel(authority: Authority): FilingChannel {
  return authority.level === "central" ? "rti-online-central" : "state-portal";
}

/**
 * A First Appeal under Section 19(1).
 *
 * Generated from a template rather than an LLM, deliberately. A First Appeal
 * is a formulaic document — the appellant's details, the original application's
 * particulars, the ground of appeal, and the relief sought — and every one of
 * those fields is already known by the time it is needed. A template is exact,
 * instant, free, and works with no network, which matters most at the moment
 * this document is generated: thirty days after filing, when the citizen has
 * been ignored and is least inclined to wait on a spinner.
 */
export function buildFirstAppeal(params: {
  applicantName: string;
  applicantAddress: string;
  authority: Authority;
  registrationNumber?: string;
  filedAtLabel: string;
  responseDeadlineLabel: string;
  items: string[];
  grounds: "deemed-refusal" | "unsatisfactory-response";
}): string {
  const {
    applicantName,
    applicantAddress,
    authority,
    registrationNumber,
    filedAtLabel,
    responseDeadlineLabel,
    items,
    grounds,
  } = params;

  const reference = registrationNumber
    ? `Registration No. ${registrationNumber}, dated ${filedAtLabel}`
    : `RTI application dated ${filedAtLabel}`;

  const groundText =
    grounds === "deemed-refusal"
      ? `No decision was communicated to me within the period prescribed by Section 7(1) of the Act, which expired on ${responseDeadlineLabel}. Under Section 7(2), the Central/State Public Information Officer is deemed to have refused the request. This appeal is preferred against that deemed refusal.`
      : `A response was received but it does not address the information sought, and no ground of exemption under Sections 8 or 9 of the Act has been stated in respect of the items not furnished. This appeal is preferred against that incomplete reply.`;

  return `To,
${authority.appellateAuthority}
${authority.filingAddress}

Subject: First Appeal under Section 19(1) of the Right to Information Act, 2005

Reference: ${reference}

Sir/Madam,

1. I, ${applicantName || "[your full name]"}, resident of ${applicantAddress || "[your address]"}, filed an application under Section 6(1) of the Right to Information Act, 2005 with the ${authority.pioDesignation} on ${filedAtLabel}${registrationNumber ? ` (${registrationNumber})` : ""}.

2. ${groundText}

3. The information sought in the said application was:
${items.map((item, i) => `   ${i + 1}. ${item}`).join("\n")}

4. I therefore request that you may be pleased to:
   a. Direct the Public Information Officer to furnish the information sought, free of further charge, under Section 7(6) of the Act, the prescribed period having lapsed.
   b. Record the reasons for the delay in disposal of the said application.
   c. Initiate action under Section 20 of the Act if the delay is found to be without reasonable cause.

5. I have not been furnished the information sought and no fee is payable on a first appeal.

Yours faithfully,

${applicantName || "[your full name]"}
${applicantAddress || "[your address]"}

Date: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
Place: ______________________
`;
}

/**
 * Inverse of the `1. item\n2. item` join used to build the draft text.
 *
 * The citizen edits one textarea, but the printed application (FR-6) renders a
 * numbered list from `items` while the portal box (FR-4a) takes the flat text.
 * Without this, an edit reached the screen and the clipboard but not the PDF.
 *
 * Continuation lines belong to the item above them, so a wrapped or
 * deliberately multi-line entry survives the round trip instead of being split
 * into two requests.
 */
export function splitDraftItems(text: string): string[] {
  const items: string[] = [];
  for (const line of text.split("\n")) {
    const numbered = line.match(/^\s*\d+[.)]\s*(.*)$/);
    if (numbered) {
      items.push(numbered[1].trim());
    } else if (line.trim() && items.length) {
      items[items.length - 1] += " " + line.trim();
    } else if (line.trim()) {
      // Text before any number — an unnumbered draft is still one request.
      items.push(line.trim());
    }
  }
  return items.filter(Boolean);
}
