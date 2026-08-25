import type { StringKey } from "./i18n";

/**
 * The model emits a number like 0.94. That is a generated token, not a
 * calibrated probability, so rendering it as "94% match" claims a precision we
 * do not have — and on a screen whose entire job is to make someone check our
 * work, false precision is the worst possible failure.
 *
 * Buckets carry the same actionable signal (how hard should I verify this?)
 * without the false precision.
 *
 * The "possible" band sits entirely below CONFIDENCE_FLOOR in
 * `lib/server/ai.ts`, so anything landing in it is also flagged
 * `lowConfidence` by the API. That is deliberate: the band still reads
 * differently from "uncertain" on screen, but it is no longer a silent pass —
 * a 0.55 match now carries the same "verify this" warning as a 0.2 one.
 */

export type ConfidenceBucket = {
  key: StringKey;
  tone: "strong" | "likely" | "possible" | "uncertain";
};

export function confidenceBucket(confidence: number): ConfidenceBucket {
  if (confidence >= 0.9) return { key: "confidence.strong", tone: "strong" };
  if (confidence >= 0.6) return { key: "confidence.likely", tone: "likely" }; // = CONFIDENCE_FLOOR
  if (confidence >= 0.4) return { key: "confidence.possible", tone: "possible" };
  return { key: "confidence.uncertain", tone: "uncertain" };
}
