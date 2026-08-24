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
import { Alert, AlertDescription, AlertTitle } from "@/components/ux4g/alert";
import { Marker, PageTitle, Rule } from "@/components/editorial";
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
 *
 * The comparison is set as two columns divided by a hairline rather than two
 * tinted boxes. Their words and ours carry the same visual weight, because the
 * point of the panel is that the citizen judges the rewrite — not that the
 * rewrite is presented as the improved version.
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

      <div className="mt-8 space-y-2">
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
        <p className="max-w-[58ch] text-sm leading-relaxed opacity-75">
          {t("draft.portalHelp")}
        </p>
        {overLimit && (
          <Alert variant="destructive" className="border-destructive/30">
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>{t("draft.overLimit")}</AlertTitle>
          </Alert>
        )}
        <div className="pt-2">
          <CopyButton value={portalText} label={t("file.copyText")} />
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Audit trail: what you wrote vs what we are asking for             */}
      {/* ---------------------------------------------------------------- */}
      <section className="mt-12">
        <Rule />
        <button
          type="button"
          onClick={() => setShowCompare((open) => !open)}
          aria-expanded={showCompare}
          className="flex w-full cursor-pointer items-center justify-between gap-3 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Marker label={t("draft.compare")} dim={false} />
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-5 shrink-0 opacity-75 transition-transform duration-200",
              showCompare && "rotate-180"
            )}
          />
        </button>

        {showCompare && (
          <div className="animate-rise">
            <div className="grid grid-cols-1 border-t border-border md:grid-cols-2">
              <div className="border-b border-border py-6 md:border-b-0 md:border-r md:pr-8">
                <Marker label={t("draft.yourWords")} />
                <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {grievance}
                </p>
              </div>
              <div className="py-6 md:pl-8">
                <Marker label={t("draft.ourDraft")} />
                <ol className="mt-4 space-y-3 text-sm leading-relaxed">
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
            </div>
            <div className="border-t border-border py-6">
              <p className="text-sm font-semibold">{t("draft.whyChanged")}</p>
              <p className="mt-2 max-w-[58ch] text-sm leading-relaxed opacity-75">
                {t("draft.whyChangedBody")}
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row-reverse">
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
