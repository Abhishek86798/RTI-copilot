"use client";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/client/i18n";
import { cn } from "@/lib/utils";

/**
 * The footer row of a wizard step: go back on the left, go on to the right.
 *
 * It exists because the two steps had drifted apart. One used
 * `justify-between`, the other `flex-row-reverse`, which pushed both controls
 * into the right corner — so "Back" moved between screens depending on which
 * step you were looking at. On a five-step form that is the kind of small
 * inconsistency that makes people stop trusting where they are.
 *
 * Back sits on the left because that is where every browser, every operating
 * system and every other government form puts it. The forward action sits on
 * the right, in the corner the eye finishes on.
 *
 * On a phone the order inverts under the hood: the primary action renders
 * first so it sits under the thumb, while the DOM order still puts Back first
 * for a screen reader and for tab order.
 */
export function StepActions({
  onBack,
  backDisabled,
  children,
  className,
}: {
  onBack: () => void;
  backDisabled?: boolean;
  /** The forward action. Rendered on the right. */
  children: React.ReactNode;
  className?: string;
}) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "mt-10 flex flex-col gap-3 border-t border-border pt-8",
        "sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <Button
        type="button"
        size="lg"
        variant="outline"
        onClick={onBack}
        disabled={backDisabled}
        className="order-2 sm:order-1"
      >
        <ArrowLeft aria-hidden="true" />
        {t("common.back")}
      </Button>

      <div className="order-1 sm:order-2">{children}</div>
    </div>
  );
}
