/**
 * Input bounds for the two routes that cost a model call.
 *
 * Both sit behind unauthenticated POSTs. Without an upper bound, one request
 * can burn a large share of a daily free-tier quota — and when that quota is
 * gone every citizen gets a 500, which is exactly what happened to us in
 * testing. A cap is the cheapest thing that closes it.
 */

/**
 * Generous next to the portal's own 3,000-character request field, so a
 * genuinely long grievance is never refused, while a megabyte of pasted text
 * is.
 */
export const MAX_GRIEVANCE_CHARS = 4000;

export const MIN_GRIEVANCE_WORDS = 15;

export type InputRejection = { error: string; status: 400 };

export function checkGrievance(value: unknown): InputRejection | null {
  if (typeof value !== "string" || !value.trim()) {
    return { error: "Please describe what happened.", status: 400 };
  }
  const grievance = value.trim();

  if (grievance.length > MAX_GRIEVANCE_CHARS) {
    return {
      error: `That is longer than we can process at once (${grievance.length.toLocaleString("en-IN")} characters, limit ${MAX_GRIEVANCE_CHARS.toLocaleString("en-IN")}). Describe the single problem you want records about — the RTI request field itself only holds 3,000 characters.`,
      status: 400,
    };
  }

  if (grievance.split(/\s+/).filter(Boolean).length < MIN_GRIEVANCE_WORDS) {
    return {
      error: `Please describe your grievance in at least ${MIN_GRIEVANCE_WORDS} words so we can route it accurately.`,
      status: 400,
    };
  }

  return null;
}
