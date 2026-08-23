"use client";

import { useId, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Siren,
} from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ux4g/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ux4g/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ux4g/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PORTAL_CHAR_LIMIT } from "@/lib/client/filing";
import { useI18n } from "@/lib/client/i18n";
import { cn } from "@/lib/utils";

/**
 * Step 3. The draft, with the original kept one click away.
 *
 * Two things make this screen trustworthy rather than magical. Every line is
 * editable — the citizen signs this, so the citizen has the last word on it.
 * And the text they originally wrote stays available for comparison, so the
 * rewrite can be checked rather than taken on faith. A tool that quietly
 * replaces someone's words with its own, on a legal document, has to show its
 * working.
 */
export function DraftStep({
  grievance,
  items,
  portalText,
  onPortalTextChange,
  lifeOrLibertyFlag,
  lifeOrLibertyReason,
  onToggleUrgency,
  onBack,
  onSubmit,
}: {
  grievance: string;
  items: string[];
  portalText: string;
  onPortalTextChange: (value: string) => void;
  lifeOrLibertyFlag: boolean;
  lifeOrLibertyReason: string;
  onToggleUrgency: (next: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const { t } = useI18n();
  const textId = useId();
  const countId = `${textId}-count`;
  const [showCompare, setShowCompare] = useState(false);

  const charCount = portalText.length;
  const overLimit = charCount > PORTAL_CHAR_LIMIT;
  // Warn before the limit, not at it. Discovering you are 400 characters over
  // while already pasted into the portal is how a filing gets truncated.
  const nearLimit = !overLimit && charCount > PORTAL_CHAR_LIMIT * 0.9;

  return (
    <div className="space-y-6">
      {lifeOrLibertyFlag && (
        <Alert className="border-destructive/40 bg-destructive/6">
          <Siren aria-hidden="true" className="text-destructive" />
          <AlertTitle>{t("draft.urgentTitle")}</AlertTitle>
          <AlertDescription className="space-y-3">
            {lifeOrLibertyReason && (
              <p className="font-medium text-foreground">{lifeOrLibertyReason}</p>
            )}
            <p>{t("draft.urgentBody")}</p>
            {/*
              The citizen can withdraw the claim. The 48-hour proviso is
              applied narrowly by the Information Commission, and a wrongly
              claimed urgency invites the PIO to argue about the framing
              instead of answering — which costs more time than it saves.
            */}
            <Button type="button" variant="outline" size="lg" onClick={() => onToggleUrgency(false)}>
              {t("draft.urgentRemove")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle as="h1" className="text-xl">{t("draft.title")}</CardTitle>
          <CardDescription className="text-base">{t("draft.help")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Label htmlFor={textId}>{t("draft.portalLabel")}</Label>
              <p
                id={countId}
                aria-live="polite"
                className={cn(
                  "text-sm tabular-nums",
                  overLimit
                    ? "font-semibold text-destructive"
                    : nearLimit
                      ? "font-medium text-warning"
                      : "text-muted-foreground"
                )}
              >
                {charCount.toLocaleString("en-IN")} / {PORTAL_CHAR_LIMIT.toLocaleString("en-IN")}{" "}
                {t("draft.chars")}
              </p>
            </div>
            <Textarea
              id={textId}
              value={portalText}
              onChange={(event) => onPortalTextChange(event.target.value)}
              rows={14}
              aria-describedby={countId}
              aria-invalid={overLimit || undefined}
              className="min-h-72 font-mono text-sm leading-relaxed"
            />
            <p className="text-sm text-muted-foreground">{t("draft.portalHelp")}</p>
            {overLimit && (
              <Alert variant="destructive" className="border-destructive/30">
                <AlertTriangle aria-hidden="true" />
                <AlertTitle>{t("draft.overLimit")}</AlertTitle>
              </Alert>
            )}
            <CopyButton value={portalText} label={t("file.copyText")} />
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Audit trail: what you wrote vs what we are asking for             */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <CardContent className="pt-2">
          <button
            type="button"
            onClick={() => setShowCompare((open) => !open)}
            aria-expanded={showCompare}
            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="text-base font-semibold">{t("draft.compare")}</span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
                showCompare && "rotate-180"
              )}
            />
          </button>

          {showCompare && (
            <div className="animate-rise mt-3 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-muted p-4">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {t("draft.yourWords")}
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{grievance}</p>
                </div>
                <div className="rounded-lg bg-success/6 p-4 ring-1 ring-success/20">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-success uppercase">
                    {t("draft.ourDraft")}
                  </p>
                  <ol className="space-y-2 text-sm leading-relaxed">
                    {items.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <span aria-hidden="true" className="font-semibold text-muted-foreground">
                          {index + 1}.
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-semibold">{t("draft.whyChanged")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("draft.whyChangedBody")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button type="button" size="xl" variant="cta" onClick={onSubmit}>
          {t("draft.submit")}
          <ArrowRight aria-hidden="true" />
        </Button>
        <Button type="button" size="xl" variant="outline" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          {t("common.back")}
        </Button>
      </div>
    </div>
  );
}
