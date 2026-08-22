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

export type FilingPlan = {
  channel: FilingChannel;
  /** Heading for the filing step. */
  title: string;
  /** One line on why this channel and not another. */
  rationale: string;
  /** Link to open, when the channel has one. */
  url?: string;
  /** Fee payable, already accounting for a BPL exemption. */
  feeRupees: number;
  feeNote: string;
  /** Ordered steps. First entry is what to do first, literally. */
  steps: string[];
  /** Things to have ready before starting. */
  attachments: string[];
  /** Shown as a warning callout when present. */
  warning?: string;
};

export function resolveChannel(authority: Authority): FilingChannel {
  return authority.level === "central" ? "rti-online-central" : "state-portal";
}

export function buildFilingPlan(
  authority: Authority,
  options: { isBpl: boolean; overPortalLimit: boolean }
): FilingPlan {
  const feeRupees = options.isBpl ? 0 : RTI_FEE_RUPEES;
  const feeNote = options.isBpl
    ? "No fee. Section 7(5) exempts applicants below the poverty line — but you must attach a copy of your BPL certificate, or the application will be treated as unpaid and returned."
    : `₹${RTI_FEE_RUPEES}, payable by UPI, net banking, or a Master/Visa/RuPay card. Keep the payment receipt.`;

  const attachments = [
    options.isBpl
      ? "A copy of your BPL certificate issued by the appropriate government (mandatory for the fee exemption)."
      : "Proof of fee payment — the portal receipt, or the Indian Postal Order if filing by post.",
  ];

  if (options.overPortalLimit) {
    attachments.push(
      "Your full itemized request as a PDF, attached under “Supporting Document”. The portal caps the request box at 3,000 characters and expects longer requests as an attachment."
    );
  }

  if (resolveChannel(authority) === "rti-online-central") {
    return {
      channel: "rti-online-central",
      title: "File on the central RTI Online portal",
      rationale: `${authority.authorityName} is a Central Government public authority, so rtionline.gov.in accepts it.`,
      url: CENTRAL_PORTAL_URL,
      feeRupees,
      feeNote,
      steps: [
        "Open rtionline.gov.in and choose “Submit Request”.",
        "Tick the guidelines checkbox and fill in your name, address, and contact details exactly as written below.",
        "Select the Ministry or Department, then the public authority named below.",
        "Paste the portal-ready text into the “Text for RTI Request Application” box.",
        `Pay the ₹${RTI_FEE_RUPEES} fee and submit.`,
        "Save the registration number the portal shows you. Enter it on the next screen so we can track your 30-day deadline.",
      ],
      attachments,
    };
  }

  return {
    channel: "state-portal",
    title: "File with the State authority — not on the central portal",
    rationale: `${authority.authorityName} is a State public authority. It is handled by your state government, not by the Centre.`,
    url: authority.verifyAt?.startsWith("http") ? authority.verifyAt : undefined,
    feeRupees,
    feeNote: options.isBpl
      ? feeNote
      : `₹${RTI_FEE_RUPEES}. States differ in how they take it — a state RTI portal, an Indian Postal Order made out to the Accounts Officer, a demand draft, or a court fee stamp. Check your state's rules before paying.`,
    steps: [
      "Check whether your state runs its own RTI portal. Many do; several still take applications only on paper.",
      "If it does, file there using the portal-ready text below.",
      "If it does not, print the application, sign it, and send it by registered post to the address shown below — keep the posting receipt, it is your proof of the filing date.",
      `Pay the ₹${RTI_FEE_RUPEES} fee in the manner your state prescribes.`,
      "Come back and record the filing date so we can track your 30-day deadline.",
    ],
    attachments,
    warning:
      "Do not file this on rtionline.gov.in. That portal covers Central Government authorities only, and a State application submitted there is returned to you without a refund of the fee.",
  };
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
