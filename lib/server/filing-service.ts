import { getAuthorityById } from "./authorities";

/**
 * A simulated RTI submission portal.
 *
 * The hackathon brief asks for a complete citizen journey and says to mock
 * backend behaviour "where production access would be unsafe or unavailable".
 * Filing is exactly that: rtionline.gov.in has no public write API, and
 * touching a live government system is explicitly out of bounds. So this
 * reproduces what the portal does — validation, fee, registration number,
 * acknowledgement — without ever contacting it.
 *
 * Nothing here reaches a real public authority. Every caller surfaces that.
 *
 * The rules below mirror the real portal, because getting them wrong is what
 * costs citizens their fee and their thirty days:
 *  - s.3: the right belongs to citizens of India.
 *  - s.6(1): a request must be in writing, with contact details for a reply.
 *  - s.7(5): applicants below the poverty line pay no fee, on producing a
 *    certificate — without it the application is treated as unpaid.
 *  - The request field caps at 3,000 characters.
 *  - Central authorities only: a State application is returned unrefunded.
 */

export const PORTAL_CHAR_LIMIT = 3000;
export const FEE_RUPEES = 10;

export type FilingRequest = {
  authorityId: string;
  requestText: string;
  applicant: {
    fullName: string;
    address: string;
    state: string;
    pincode: string;
    email: string;
    phone?: string;
    isCitizen: boolean;
    isBpl: boolean;
    bplCertificateRef?: string;
  };
};

export type FilingRejection = { field: string; message: string };

export type FilingReceipt = {
  registrationNumber: string;
  filedAt: string;
  authorityName: string;
  ministry?: string;
  pioDesignation: string;
  feePaidRupees: number;
  feeBasis: "paid" | "bpl-exempt";
  /** When a reply is due, computed by the caller from the Act's clock. */
  responseDueBy: string;
  charCount: number;
};

/**
 * Validates exactly what the portal would reject, and says why in words a
 * citizen can act on. Returns every problem at once rather than one at a
 * time — a form that reveals its objections one reload apart is the thing
 * this product exists to replace.
 */
export function validateFiling(request: FilingRequest): FilingRejection[] {
  const problems: FilingRejection[] = [];
  const { applicant, requestText, authorityId } = request;

  const authority = getAuthorityById(authorityId);
  if (!authority) {
    problems.push({ field: "authorityId", message: "Unknown public authority." });
  } else if (authority.level !== "central") {
    // The trap the real portal springs only after payment.
    problems.push({
      field: "authorityId",
      message:
        "This is a State public authority. The central portal returns State applications without refunding the fee — file with the State instead.",
    });
  }

  if (!applicant.isCitizen) {
    problems.push({
      field: "isCitizen",
      message:
        "Under Section 3, the right to information belongs to citizens of India.",
    });
  }

  if (!applicant.fullName?.trim()) {
    problems.push({ field: "fullName", message: "Your full name is required." });
  }
  if (!applicant.address?.trim()) {
    problems.push({
      field: "address",
      message: "A postal address is required — the reply is sent to it.",
    });
  }
  if (!applicant.state?.trim()) {
    problems.push({ field: "state", message: "Your state is required." });
  }
  if (!/^\d{6}$/.test(applicant.pincode ?? "")) {
    problems.push({ field: "pincode", message: "Enter a six-digit PIN code." });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(applicant.email ?? "")) {
    problems.push({
      field: "email",
      message: "A valid email is required — your registration number is sent there.",
    });
  }
  if (applicant.phone && !/^(\+91[-\s]?)?[6-9]\d{9}$/.test(applicant.phone.replace(/\s/g, ""))) {
    problems.push({ field: "phone", message: "Enter a valid Indian mobile number." });
  }

  const text = requestText?.trim() ?? "";
  if (!text) {
    problems.push({ field: "requestText", message: "The request cannot be empty." });
  } else if (text.length > PORTAL_CHAR_LIMIT) {
    problems.push({
      field: "requestText",
      message: `The request field holds ${PORTAL_CHAR_LIMIT} characters. Yours is ${text.length}. Attach the rest as a supporting document.`,
    });
  }

  // s.7(5): the exemption depends on the certificate, not the claim.
  if (applicant.isBpl && !applicant.bplCertificateRef?.trim()) {
    problems.push({
      field: "bplCertificateRef",
      message:
        "Attach your BPL certificate. Without it the application is treated as unpaid and returned.",
    });
  }

  return problems;
}

/**
 * Registration numbers follow the portal's own shape — DOPPW/R/E/26/00142 —
 * because this is the only key the portal accepts later for status checks,
 * appeals and complaints. A citizen who learns the format here recognises it
 * on the real thing.
 *
 * The segments are: authority code / R for Request (A for Appeal) / E for
 * Electronic / two-digit year / sequence.
 */
export function generateRegistrationNumber(
  authorityCode: string,
  sequence: number,
  kind: "request" | "appeal" = "request",
  now: Date = new Date()
): string {
  const year = String(now.getFullYear()).slice(-2);
  const padded = String(sequence).padStart(5, "0");
  return `${authorityCode}/${kind === "appeal" ? "A" : "R"}/E/${year}/${padded}`;
}

/** Portal-style code for an authority, used in its registration numbers. */
export function authorityCode(authorityId: string): string {
  const authority = getAuthorityById(authorityId);
  if (!authority) return "DOPTR";
  const CODES: Record<string, string> = {
    "epfo-pension": "DOPPW",
    "epfo-provident-fund": "EPFOA",
    "passport-office": "MEAPO",
    "income-tax": "CBODT",
    "public-sector-bank": "DFSER",
    railways: "MORLY",
  };
  // DOPTR is the portal's own umbrella code, used when no specific one fits.
  return CODES[authorityId] ?? "DOPTR";
}
