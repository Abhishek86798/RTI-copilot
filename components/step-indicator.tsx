"use client";

import { Check } from "lucide-react";

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
 * On mobile the labels drop away and the dots stay, so the shape of the
 * journey survives at 360px without wrapping into two lines.
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
      <ol className="flex items-center gap-1.5">
        {JOURNEY_STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-1.5">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-1 w-full rounded-full transition-colors duration-300",
                    done && "bg-success",
                    active && "bg-info",
                    !done && !active && "bg-border"
                  )}
                />
                <span
                  className={cn(
                    "flex items-center gap-1 truncate text-xs font-medium",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {done && (
                    <Check aria-hidden="true" className="size-3 shrink-0 text-success" />
                  )}
                  <span className="hidden truncate sm:inline">{t(step.labelKey)}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      {/* The one line that always reads, at every width, in every reader. */}
      <p className="mt-1 text-xs text-muted-foreground sm:hidden">
        {t("common.step")} {current + 1} {t("common.of")} {total} —{" "}
        {t(JOURNEY_STEPS[current].labelKey)}
      </p>
    </nav>
  );
}
