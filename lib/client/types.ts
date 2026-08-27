/**
 * Client-side mirrors of the shapes the API returns.
 *
 * These are deliberately hand-written rather than imported from `lib/server`.
 * Importing server types into client components drags the server module graph
 * (and its provider SDKs) into the browser bundle. Keeping a mirror here means
 * the boundary between frontend and backend is a JSON contract, which is the
 * thing we actually have to agree on.
 *
 * If the backend changes a field, the mismatch shows up in `lib/client/api.ts`
 * where responses are parsed, not scattered through the UI.
 */

/** Mirror of `Authority` in `lib/server/authorities.ts`. */
export type Authority = {
  id: string;
  domain: string;
  authorityName: string;
  pioDesignation: string;
  /** Officer a First Appeal goes to under Section 19(1). */
  appellateAuthority: string;
  filingAddress: string;
  verifyAt?: string;
  /**
   * Decides which portal the citizen may actually use. rtionline.gov.in is
   * Central Government only — a state application filed there is returned
   * without a fee refund, so this field drives the filing-channel guidance.
   */
  level: "central" | "state";
  notes?: string;
};

export type Candidate = {
  authority: Authority;
  /**
   * A generated token, not a calibrated probability. Never render this as a
   * percentage — bucket it via `confidenceLabel()` in `lib/client/confidence.ts`.
   */
  confidence: number;
  reason: string;
};

/** Response body of `POST /api/route-authority`. */
export type RoutingResponse = {
  candidates: Candidate[];
  extractedReferences: string[];
  lowConfidence: boolean;
};

/** Response body of `POST /api/draft`. */
export type DraftResponse = {
  items: string[];
  lifeOrLibertyFlag: boolean;
  lifeOrLibertyReason: string;
  portalText: string;
  portalCharCount: number;
  fullText: string;
  overPortalLimit: boolean;
};

/**
 * Where the citizen will actually lodge this application. Derived from the
 * authority's `level`, not asked of the user — knowing which portal accepts
 * which authority is exactly the knowledge they do not have.
 */
export type FilingChannel = "rti-online-central" | "state-portal" | "post";

/** Applicant details required on the application by RTI Rules, 2012. */
export type Applicant = {
  fullName: string;
  address: string;
  /** The portal asks for state and PIN separately from the street address. */
  state: string;
  pincode: string;
  phone: string;
  email: string;
  /** Section 7(5): BPL applicants pay no fee, but must attach the certificate. */
  isBpl: boolean;
  /**
   * Section 6(1) confines the right to citizens, and the real Submit Request
   * form makes you assert it before it will accept the request. A declaration,
   * not a verification — nobody checks it, here or there.
   */
  isCitizen: boolean;
  /**
   * Reference for the attached BPL certificate. Section 7(5) makes the
   * exemption depend on producing it, not on claiming it — without one the
   * application is treated as unpaid and returned.
   */
  bplCertificateRef?: string;
};

export const EMPTY_APPLICANT: Applicant = {
  fullName: "",
  address: "",
  state: "",
  pincode: "",
  phone: "",
  email: "",
  isBpl: false,
  isCitizen: false,
};

export type ApplicationStatus =
  | "drafting"
  | "filed"
  | "awaiting-response"
  | "overdue"
  | "appealed"
  | "resolved";
