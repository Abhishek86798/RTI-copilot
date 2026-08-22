"use client";

import { AlertTriangle, FlaskConical, Info, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ApiError } from "@/lib/client/api";
import { useI18n } from "@/lib/client/i18n";
import { cn } from "@/lib/utils";

/**
 * Failure shown as something the citizen can act on.
 *
 * Two rules. The message says whose problem it is — a 15-word minimum is
 * theirs to fix, a 500 is ours to apologise for — because a first-time filer
 * hit with a generic error assumes they did something wrong and leaves. And
 * "Try again" only appears when trying again could actually help.
 */
export function ErrorNotice({
  error,
  onRetry,
  className,
}: {
  error: ApiError;
  onRetry?: () => void;
  className?: string;
}) {
  const { t } = useI18n();

  return (
    <Alert
      variant="destructive"
      className={cn("border-destructive/30", className)}
    >
      <AlertTriangle aria-hidden="true" />
      <AlertTitle>{t("error.title")}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{error.userMessage}</p>
        {error.retryable && onRetry && (
          <Button type="button" variant="outline" size="lg" onClick={onRetry}>
            <RotateCcw aria-hidden="true" />
            {t("common.tryAgain")}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Shown whenever a screen is displaying a saved fixture instead of a live
 * model response.
 *
 * This banner is not decoration. A reviewer has to be able to tell, without
 * asking, which parts of what they are looking at were generated just now and
 * which were prepared earlier — and the honest answer is more useful than a
 * demo that appears to work perfectly.
 */
export function FixtureNotice({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <Alert className={cn("border-warning/40 bg-warning/8", className)}>
      <FlaskConical aria-hidden="true" className="text-warning" />
      <AlertTitle>Showing a saved response</AlertTitle>
      <AlertDescription>{t("disclosure.fixture")}</AlertDescription>
    </Alert>
  );
}

/** Neutral informational callout, for statutory notes and caveats. */
export function InfoNotice({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Alert className={cn("border-info/30 bg-info/6", className)}>
      <Info aria-hidden="true" className="text-info" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
