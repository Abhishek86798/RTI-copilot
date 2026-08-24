"use client";

import { useI18n, type StringKey } from "@/lib/client/i18n";
import { cn } from "@/lib/utils";

export const JOURNEY_STEPS: { id: string; labelKey: StringKey }[] = [
  { id: "describe", labelKey: "steps.describe" },
  { id: "authority", labelKey: "steps.authority" },
  { id: "draft", labelKey: "steps.draft" },
  { id: "file", labelKey: "steps.file" },
  { id: "track", labelKey: "steps.track" },
];

/**
 * Five steps, always all five visible.
 *
 * Showing the whole path — including the parts that come after filing — is the
 * point. The official portal gives no sense of how much is left or that
 * anything happens after you press submit, and "how much more of this is
 * there?" is the question that decides whether someone finishes.
 *
 * Set as a hairline rule with numbered mono markers beneath, which is the same
 * device the landing page uses to number its argument. The rule is the
 * structure and the numeral is the position, so the shape of the journey
 * survives at 360px without labels wrapping into two lines.
 *
 * The rule segments are aria-hidden and the state of each step is carried in
 * real text — "done", "current" — rather than in colour alone, so the sequence
 * reads the same to a screen reader and to anyone who cannot separate the
 * success and info hues.
 */
export function StepIndicator({
  current,
  className,
}: {
  /** Index into `JOURNEY_STEPS`. */
  current: number;
  className?: string;
}) {
  const { t } = useI18n();
  const total = JOURNEY_STEPS.length;

  return (
    <nav
      aria-label={`${t("common.step")} ${current + 1} ${t("common.of")} ${total}`}
      className={cn("w-full", className)}
      data-print="hide"
    >
      <ol className="grid grid-cols-5 gap-x-2">
        {JOURNEY_STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step.id} className="flex min-w-0 flex-col gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "h-px w-full transition-colors duration-300",
                  done && "bg-success",
                  active && "bg-foreground",
                  !done && !active && "bg-border"
                )}
              />
              <span
                className={cn(
                  "flex items-baseline gap-1.5 font-mono text-[0.68rem] tracking-[0.14em] uppercase",
                  active ? "text-foreground" : "opacity-72"
                )}
              >
                <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                <span className="hidden truncate sm:inline">{t(step.labelKey)}</span>
                {/* State in text, not in colour alone. */}
                <span className="sr-only">
                  {done ? t("common.stepDone") : active ? t("common.stepCurrent") : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      {/* The one line that always reads, at every width, in every reader. */}
      <p className="mt-3 font-mono text-[0.68rem] tracking-[0.14em] uppercase opacity-75 sm:hidden">
        {t("common.step")} {current + 1} {t("common.of")} {total} —{" "}
        {t(JOURNEY_STEPS[current].labelKey)}
      </p>
    </nav>
  );
}
