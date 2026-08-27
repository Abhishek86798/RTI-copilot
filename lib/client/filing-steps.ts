import type { Applicant } from "./types";
import type { Application } from "./guest-storage";

/**
 * Which parts of the filing form are complete.
 *
 * The server is still the authority: `validateFiling` in
 * `lib/server/filing-service.ts` runs on submit and its rejections are what
 * actually stop a filing. This mirrors the subset of those rules that can be
 * checked while typing, so a step can refuse to advance rather than letting
 * someone reach the fee and get sent back four screens.
 *
 * Deliberately a mirror and not a shared module: the server's copy has to keep
 * working for a request that never touched this UI, and the two are allowed to
 * drift in strictness — this one is only ever the looser of the pair, because
 * a false "complete" here is caught on submit, while a false "incomplete"
 * would trap someone on a step with no way forward.
 */

export type FilingStepId = "authority" | "applicant" | "declaration" | "request" | "pay";

export const FILING_STEPS: FilingStepId[] = [
  "authority",
  "applicant",
  "declaration",
  "request",
  "pay",
];

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PIN = /^\d{6}$/;
const INDIAN_MOBILE = /^(\+91[-\s]?)?[6-9]\d{9}$/;

/** Field names that belong to each step, for scrolling to the first problem. */
export const STEP_FIELDS: Record<FilingStepId, string[]> = {
  authority: ["authorityId"],
  applicant: ["fullName", "address", "state", "pincode", "email", "phone"],
  declaration: ["isCitizen", "bplCertificateRef"],
  request: ["requestText"],
  pay: [],
};

function applicantProblems(applicant: Partial<Applicant> | undefined): string[] {
  const problems: string[] = [];
  if (!applicant?.fullName?.trim()) problems.push("fullName");
  if (!applicant?.address?.trim()) problems.push("address");
  if (!applicant?.state?.trim()) problems.push("state");
  if (!PIN.test(applicant?.pincode ?? "")) problems.push("pincode");
  if (!EMAIL.test(applicant?.email ?? "")) problems.push("email");
  /* Phone is optional, but a wrong one should not reach the fee step. */
  if (applicant?.phone && !INDIAN_MOBILE.test(applicant.phone.replace(/\s/g, ""))) {
    problems.push("phone");
  }
  return problems;
}

/**
 * The fields a step still needs, empty when it is ready to advance.
 *
 * `pay` is always ready: it has nothing of its own to fill in, and the steps
 * before it have already been gated.
 */
export function stepProblems(
  step: FilingStepId,
  application: Application,
  requestText: string
): string[] {
  const applicant = application.applicant;

  switch (step) {
    case "authority":
      return application.authority?.id ? [] : ["authorityId"];

    case "applicant":
      return applicantProblems(applicant);

    case "declaration": {
      const problems: string[] = [];
      if (!applicant?.isCitizen) problems.push("isCitizen");
      // s.7(5): the exemption depends on the certificate, not the claim.
      if (applicant?.isBpl && !applicant.bplCertificateRef?.trim()) {
        problems.push("bplCertificateRef");
      }
      return problems;
    }

    case "request":
      return requestText.trim() ? [] : ["requestText"];

    case "pay":
      return [];
  }
}

/** True when every step before `step` is complete. */
export function canReach(
  step: FilingStepId,
  application: Application,
  requestText: string
): boolean {
  const target = FILING_STEPS.indexOf(step);
  return FILING_STEPS.slice(0, target).every(
    (earlier) => stepProblems(earlier, application, requestText).length === 0
  );
}
