import type { StringKey } from "./i18n";

/**
 * The model emits a number like 0.94. That is a generated token, not a
 * calibrated probability, so rendering it as "94% match" claims a precision we
 * do not have — and on a screen whose entire job is to make someone check our
 * work, false precision is the worst possible failure.
 *
 * Buckets carry the same actionable signal (how hard should I verify this?)
 * without the false precision. The floor matches CONFIDENCE_FLOOR in
 * `lib/server/ai.ts`; below it the API also sets `lowConfidence`.
 */

export type ConfidenceBucket = {
  key: StringKey;
  tone: "strong" | "likely" | "possible" | "uncertain";
};

export function confidenceBucket(confidence: number): ConfidenceBucket {
  if (confidence >= 0.9) return { key: "confidence.strong", tone: "strong" };
  if (confidence >= 0.6) return { key: "confidence.likely", tone: "likely" };
  if (confidence >= 0.5) return { key: "confidence.possible", tone: "possible" };
  return { key: "confidence.uncertain", tone: "uncertain" };
}
