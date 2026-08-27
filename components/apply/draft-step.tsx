"use client";

import { useId } from "react";
import { AlertTriangle, ArrowRight, Siren } from "lucide-react";

import { StepActions } from "@/components/apply/step-actions";
import { Button } from "@/components/ux4g/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ux4g/alert";
import { Marker, PageTitle } from "@/components/editorial";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PORTAL_CHAR_LIMIT } from "@/lib/client/filing";
import { useI18n } from "@/lib/client/i18n";
import { cn } from "@/lib/utils";

/**
 * Step 3. The draft, with the citizen's own words beside it.
 *
 * Two things make this screen trustworthy rather than magical. Every line is
 * editable — the citizen signs this, so the citizen has the last word on it.
 * And the text they originally wrote sits alongside the rewrite, so it can be
 * checked rather than taken on faith. A tool that quietly replaces someone's
 * words with its own, on a legal document, has to show its working.
 *
 * The comparison used to be a collapsed panel at the foot of the page, which
 * meant the check only happened if you already suspected you needed it. It is
 * now a column of its own, visible without scrolling or expanding anything,
 * because the whole point is that the rewrite gets looked at.
 *
 * Their words and ours are given the same visual weight — a hairline between
 * two plain columns, not a tinted "before" box next to a highlighted "after".
 * The citizen is judging the rewrite, not being sold it.
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

  const charCount = portalText.length;
  const overLimit = charCount > PORTAL_CHAR_LIMIT;
  // Warn before the limit, not at it. Finding out you are 400 characters over
  // at the moment of filing is how a request gets truncated.
  const nearLimit = !overLimit && charCount > PORTAL_CHAR_LIMIT * 0.9;

  return (
    <div>
      <PageTitle
        marker={<Marker index={3} total={5} label={t("steps.draft")} />}
        lead={t("draft.help")}
      >
        {t("draft.title")}
      </PageTitle>

      {lifeOrLibertyFlag && (
        <Alert className="mt-8 border-destructive/40 bg-destructive/6">
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

      {/*
        Two columns from lg up: the editable draft, and the original beside it.
        Below that the panel falls under the editor, where it is still visible
        without being hidden behind a disclosure.
      */}
      <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Label htmlFor={textId}>{t("draft.portalLabel")}</Label>
            <p
              id={countId}
              aria-live="polite"
              className={cn(
                "font-mono text-[0.68rem] tracking-[0.14em] uppercase tabular-nums",
                overLimit
                  ? "font-semibold text-destructive"
                  : nearLimit
                    ? "font-medium text-warning"
                    : "opacity-75"
              )}
            >
              {charCount.toLocaleString("en-IN")} /{" "}
              {PORTAL_CHAR_LIMIT.toLocaleString("en-IN")} {t("draft.chars")}
            </p>
          </div>
          <Textarea
            id={textId}
            value={portalText}
            onChange={(event) => onPortalTextChange(event.target.value)}
            rows={16}
            aria-describedby={countId}
            aria-invalid={overLimit || undefined}
            className="min-h-96 font-mono text-sm leading-relaxed"
          />
          <p className="max-w-[58ch] text-sm leading-relaxed opacity-75">
            {t("draft.portalHelp")}
          </p>
          {overLimit && (
            <Alert variant="destructive" className="border-destructive/30">
              <AlertTriangle aria-hidden="true" />
              <AlertTitle>{t("draft.overLimit")}</AlertTitle>
            </Alert>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Audit trail: what you wrote, and why it reads differently now     */}
        {/* ---------------------------------------------------------------- */}
        <aside
          aria-label={t("draft.compare")}
          className="border-t border-border pt-6 lg:sticky lg:top-24 lg:self-start lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10"
        >
          <Marker label={t("draft.compare")} dim={false} />

          <div className="mt-6">
            <Marker label={t("draft.yourWords")} />
            {/*
              Capped and scrollable. A long grievance would otherwise push the
              explanation below the fold and undo the point of the panel.

              tabIndex makes the scroll box reachable by keyboard: a region
              that scrolls but cannot be focused is content a keyboard user
              simply cannot read past the first screenful.
            */}
            <p
              tabIndex={0}
              role="group"
              aria-label={t("draft.yourWords")}
              className="mt-3 max-h-56 overflow-y-auto pr-2 text-sm leading-relaxed whitespace-pre-wrap opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {grievance}
            </p>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <Marker label={t("draft.ourDraft")} />
            <ol
              tabIndex={0}
              aria-label={t("draft.ourDraft")}
              className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-2 text-sm leading-relaxed opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {items.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="font-mono text-[0.68rem] tracking-[0.14em] tabular-nums opacity-75"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm font-semibold">{t("draft.whyChanged")}</p>
            <p className="mt-2 text-sm leading-relaxed opacity-75">
              {t("draft.whyChangedBody")}
            </p>
          </div>
        </aside>
      </div>

      <StepActions onBack={onBack}>
        <Button type="button" size="xl" variant="cta" onClick={onSubmit}>
          {t("draft.submit")}
          <ArrowRight aria-hidden="true" />
        </Button>
      </StepActions>
    </div>
  );
}
