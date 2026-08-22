import type { StringKey } from "./i18n";
import type { Authority, DraftResponse, RoutingResponse } from "./types";

/**
 * Seeded demo cases.
 *
 * Two jobs. They give a first-time visitor something to click instead of a
 * blank textarea — the intake box is the hardest part of this product to face
 * cold. And they carry pre-computed routing/draft responses so the journey
 * still runs end to end when the LLM is unreachable or rate-limited, which on
 * a free tier during a live demo is a when, not an if.
 *
 * The fixture path is never silent. `source: "demo-fixture"` flows all the way
 * to a visible banner on the draft screen, because a reviewer being unable to
 * tell generated output from canned output is worse than the outage.
 *
 * Every authority record below is copied verbatim from `data/authorities.json`
 * so a fixture can never disagree with what live routing would return.
 */

const EPFO_PENSION: Authority = {
  id: "epfo-pension",
  domain: "pension",
  authorityName: "Employees' Provident Fund Organisation (EPFO)",
  pioDesignation: "Central Public Information Officer, EPFO Regional Office",
  appellateAuthority:
    "First Appellate Authority, EPFO Regional Office (Regional Provident Fund Commissioner)",
  filingAddress:
    "EPFO Regional Office holding the PF account — per applicant's jurisdiction",
  verifyAt: "https://www.epfindia.gov.in",
  level: "central",
  notes:
    "For pension sanction, family pension, and pension stoppage. PF withdrawal/transfer claims go to epfo-provident-fund instead.",
};

const RATION_PDS: Authority = {
  id: "ration-pds",
  domain: "ration",
  authorityName: "Department of Food, Civil Supplies and Consumer Affairs",
  pioDesignation: "Public Information Officer, Food & Civil Supplies Department",
  appellateAuthority: "First Appellate Authority, District Food & Civil Supplies Office",
  filingAddress: "District Food & Civil Supplies Office — per applicant's district",
  verifyAt: "State food and civil supplies department portal",
  level: "state",
};

const GOVERNMENT_HOSPITAL: Authority = {
  id: "government-hospital",
  domain: "health",
  authorityName: "District Health Office / Government Hospital",
  pioDesignation:
    "Public Information Officer, Office of the Chief Medical Officer / Medical Superintendent",
  appellateAuthority:
    "First Appellate Authority, Office of the Chief Medical Officer / Medical Superintendent",
  filingAddress:
    "Chief Medical Officer, District Health Office, or the Medical Superintendent of the hospital concerned",
  verifyAt: "State health department website",
  level: "state",
  notes:
    "Covers government facilities and scheme entitlements. A patient's own records are disclosable; third-party medical records may be refused under Section 8(1)(j).",
};

export type DemoCase = {
  id: string;
  /** i18n key for the card label on the intake screen. */
  labelKey: StringKey;
  /** i18n key for what this case demonstrates, shown under the label. */
  teachesKey: StringKey;
  grievance: string;
  routing: RoutingResponse;
  draft: DraftResponse;
};

function buildDraft(
  items: string[],
  lifeOrLibertyFlag = false,
  lifeOrLibertyReason = ""
): DraftResponse {
  const fullText = items.map((item, i) => `${i + 1}. ${item}`).join("\n");
  return {
    items,
    lifeOrLibertyFlag,
    lifeOrLibertyReason,
    portalText: fullText,
    portalCharCount: fullText.length,
    fullText,
    overPortalLimit: false,
  };
}

export const DEMO_CASES: DemoCase[] = [
  {
    id: "pension",
    labelKey: "demo.pension.label",
    teachesKey: "demo.pension.teaches",
    grievance:
      "My father's EPFO pension under PPO number MH/BAN/00123456 was stopped from April 2026 without any notice being sent to us. He is 74 and this was his only income. We visited the regional office three times in May and June 2026 and nobody would explain what happened or show us any order. Why was it stopped and who is responsible for this?",
    routing: {
      candidates: [
        {
          authority: EPFO_PENSION,
          confidence: 0.96,
          reason:
            "The grievance names an EPFO PPO number and a pension stoppage, which the EPFO Regional Office holds on record.",
        },
      ],
      extractedReferences: ["MH/BAN/00123456", "April 2026", "May and June 2026"],
      lowConfidence: false,
    },
    draft: buildDraft([
      "A certified copy of the order, sanction, or noting under which pension against PPO No. MH/BAN/00123456 was discontinued with effect from April 2026.",
      "Copies of all file notings, correspondence, and internal communications relating to the said discontinuation, for the period 1 January 2026 to the date of this application.",
      "The name and designation of the officer who approved the discontinuation, and the date on which that approval was recorded.",
      "A copy of the notice or intimation issued to the pensioner regarding the discontinuation, together with proof of its despatch and the address to which it was sent.",
      "The provision of the Employees' Pension Scheme, 1995, or the rule or circular relied upon as the basis for the discontinuation.",
      "The procedure and timeline prescribed for restoration of a pension discontinued on this ground, as recorded in the departmental manual or circulars in force.",
    ]),
  },
  {
    id: "ration",
    labelKey: "demo.ration.label",
    teachesKey: "demo.ration.teaches",
    grievance:
      "I applied for a new NFSA ration card for my family in November 2025 with application number RC-2025-887431 at the taluka food supply office. It has been more than eight months and the status still shows under process. The fair price shop will not give us our grain quota without the card and we have been buying at market rate all this time. Nobody at the office gives a straight answer about the delay.",
    routing: {
      candidates: [
        {
          authority: RATION_PDS,
          confidence: 0.94,
          reason:
            "A ration card application under NFSA is processed and held by the state Food and Civil Supplies Department.",
        },
      ],
      extractedReferences: ["RC-2025-887431", "November 2025"],
      lowConfidence: false,
    },
    draft: buildDraft([
      "The current status of ration card application No. RC-2025-887431 submitted in November 2025, as recorded in the departmental register or online system.",
      "A copy of all file notings and movement records for the said application, showing the date it was received at each desk and the date it left that desk.",
      "The name and designation of the officer with whom the application is presently pending, and the date on which it reached that officer.",
      "The prescribed timeline for disposal of a new ration card application under the National Food Security Act, 2013, and the rules or citizen's charter in force in this department.",
      "The number of new ration card applications received, disposed of, and pending in this taluka between 1 November 2025 and the date of this application.",
      "A copy of any deficiency memo, objection, or query raised on this application, together with proof of it having been communicated to the applicant.",
    ]),
  },
  {
    id: "urgent",
    labelKey: "demo.urgent.label",
    teachesKey: "demo.urgent.teaches",
    grievance:
      "My mother is admitted at the district government hospital and needs dialysis three times a week. Since 12 August 2026 the hospital has refused to continue it under the state health scheme, saying her eligibility is under review, and we cannot afford the private rate. She has missed two sessions already and the doctor has warned this is dangerous. They will not show us any written order refusing the treatment or the rule they are applying.",
    routing: {
      candidates: [
        {
          authority: GOVERNMENT_HOSPITAL,
          confidence: 0.91,
          reason:
            "Scheme eligibility decisions and treatment refusals at a district government hospital are held by the Chief Medical Officer's office.",
        },
      ],
      extractedReferences: ["12 August 2026"],
      lowConfidence: false,
    },
    draft: buildDraft(
      [
        "A certified copy of the written order, noting, or decision by which continuation of dialysis under the state health scheme was refused or suspended with effect from 12 August 2026.",
        "The name and designation of the officer who recorded that decision, and the date on which it was recorded.",
        "A copy of the eligibility criteria, circular, or government resolution being applied to the patient's case, as in force on 12 August 2026.",
        "A copy of the eligibility review file relating to the patient, including all notings and the present stage of that review.",
        "The prescribed timeline for completing such an eligibility review, and the instructions in force on continuation of ongoing treatment while a review is pending.",
        "A copy of the grievance redressal procedure available to a patient whose scheme benefit is suspended pending review.",
      ],
      true,
      "The patient is currently admitted and has already missed two scheduled dialysis sessions; the order and eligibility rules being sought are what determine whether treatment resumes."
    ),
  },
];

export function getDemoCase(id: string): DemoCase | undefined {
  return DEMO_CASES.find((c) => c.id === id);
}

/**
 * Matches free text back to a demo case so the fixture fallback only fires for
 * text we actually have a canned answer for. A citizen's own grievance must
 * never be answered from a fixture — it would be a fabricated legal document.
 */
export function matchDemoCase(grievance: string): DemoCase | undefined {
  const normalised = grievance.trim().toLowerCase();
  return DEMO_CASES.find((c) => c.grievance.trim().toLowerCase() === normalised);
}
