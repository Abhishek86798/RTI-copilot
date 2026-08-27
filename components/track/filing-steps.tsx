"use client";

import { Check } from "lucide-react";

import { useI18n, type StringKey } from "@/lib/client/i18n";
import type { FilingStepId } from "@/lib/client/filing-steps";
import { cn } from "@/lib/utils";

/**
 * The sub-steps inside filing.
 *
 * A separate device from `StepIndicator`, deliberately. That one draws the
 * four stages of the whole journey and filing is the fourth of them; this
 * draws the parts of that fourth stage. Reusing the same rail for both would
 * say the citizen is on step 2 of 5 when they are on step 4 of 4, part 2.
 *
 * So it is quieter: small chips in a row rather than a numbered rule, sitting
 * under the stage heading rather than above it.
 *
 * A completed step stays clickable, because going back to correct a typo is
 * the single most common thing anyone does in a long form. A step ahead is
 * disabled until the ones before it are complete — the alternative is letting
 * someone reach the fee and be sent back four screens by the server.
 */

export const FILING_STEP_LABELS: Record<FilingStepId, StringKey> = {
  authority: "submit.section.authority",
  applicant: "submit.section.applicant",
  declaration: "submit.section.declaration",
  request: "submit.section.request",
  pay: "pay.title",
};

export function FilingStepNav({
  steps,
  current,
  isComplete,
  onSelect,
  className,
}: {
  steps: FilingStepId[];
  current: FilingStepId;
  /** Whether a step's own fields are filled in. */
  isComplete: (step: FilingStepId) => boolean;
  onSelect: (step: FilingStepId) => void;
  className?: string;
}) {
  const { t } = useI18n();
  const currentIndex = steps.indexOf(current);

  return (
    <nav aria-label={t("submit.stepsNav")} className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {steps.map((step, index) => {
          const active = step === current;
          const done = isComplete(step) && index < currentIndex;
          /*
           * Reachable means every step before it is complete. Computed from
           * the caller's `isComplete` rather than from `canReach` directly so
           * this component stays presentational.
           */
          const reachable =
            index <= currentIndex ||
            steps.slice(0, index).every((earlier) => isComplete(earlier));

          return (
            <li key={step} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelect(step)}
                disabled={!reachable}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  "disabled:cursor-not-allowed disabled:opacity-45",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : done
                      ? "border-border bg-card text-foreground hover:bg-muted"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                {done ? (
                  <Check aria-hidden="true" className="size-3.5" />
                ) : (
                  <span aria-hidden="true" className="font-mono text-xs tabular-nums">
                    {index + 1}
                  </span>
                )}
                {t(FILING_STEP_LABELS[step])}
                {/*
                  State in text, not colour alone — the chips differ by fill,
                  which is invisible to a screen reader and to anyone who
                  cannot separate the two greys.
                */}
                {done && <span className="sr-only">{t("common.stepDone")}</span>}
                {active && <span className="sr-only">{t("common.stepCurrent")}</span>}
              </button>

              {index < steps.length - 1 && (
                <span aria-hidden="true" className="h-px w-3 bg-border sm:w-5" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
