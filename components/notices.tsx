"use client";

import { AlertTriangle, BookOpen, Info, RotateCcw } from "lucide-react";

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
    <div className={cn("text-destructive", className)}>
      <div className="flex items-start gap-2.5">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="text-sm font-medium">{t("error.title")}</p>
          <p className="mt-0.5 max-w-[62ch] text-sm text-destructive/90">
            {error.userMessage}
          </p>
        </div>
      </div>

      {error.retryable && onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-3 ml-[1.625rem]"
        >
          <RotateCcw aria-hidden="true" />
          {t("common.tryAgain")}
        </Button>
      )}
    </div>
  );
}

/**
 * Shown on every screen of a worked example.
 *
 * The demo and the real thing are the same five screens, so without this the
 * only difference a citizen can see is that the boxes came pre-filled — which
 * reads as the tool having guessed their name. It says whose case this is,
 * that nothing will be filed, and where their own application starts.
 *
 * `role="status"`, like the fixture banner: worth announcing once, not worth
 * interrupting someone mid-sentence.
 */
export function DemoNotice({
  bodyKey = "demo.body",
  className,
}: {
  bodyKey?: "demo.body" | "demo.bodyFiling";
  className?: string;
}) {
  const { t } = useI18n();

  return (
    <Alert role="status" variant="info" className={className}>
      <BookOpen aria-hidden="true" />
      <AlertTitle>{t("demo.title")}</AlertTitle>
      <AlertDescription>{t(bodyKey)}</AlertDescription>
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
    /*
       Not a live region at all. This carries static explanatory content that
       is present when the page renders, and role="alert" made a screen reader
       announce it out of document order on every load.
    */
    <Alert role="note" variant="info" className={className}>
      <Info aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
