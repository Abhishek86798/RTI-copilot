"use client";

import { useId, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ExternalLink,
  Gavel,
  Info,
  Loader2,
  MapPin,
  Tag,
} from "lucide-react";

import { InfoNotice } from "@/components/notices";
import { Button } from "@/components/ux4g/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ux4g/alert";
import { Marker, PageTitle, Rule } from "@/components/editorial";
import { confidenceBucket } from "@/lib/client/confidence";
import { resolveChannel } from "@/lib/client/filing";
import { useI18n } from "@/lib/client/i18n";
import type { Candidate, RoutingResponse } from "@/lib/client/types";
import { cn } from "@/lib/utils";

/*
 * Opaque backgrounds, not a translucent tint of the status colour.
 *
 * A `bg-success/12` chip composites over whatever is behind it, and these
 * chips sit inside alert cards that are themselves tinted — which measured at
 * 3.96:1 against the card, under the 4.5:1 AA needs. An opaque card
 * background makes the contrast independent of what the chip is placed on,
 * and the coloured ring keeps the status readable at a glance.
 */
const TONE_CLASSES = {
  strong: "bg-card text-success ring-1 ring-success/35",
  likely: "bg-card text-info ring-1 ring-info/35",
  possible: "bg-card text-warning ring-1 ring-warning/40",
  uncertain: "bg-card text-destructive ring-1 ring-destructive/35",
} as const;

/**
 * Step 2. The screen this whole product exists for.
 *
 * Everything here is arranged around one decision: is this the office that
 * holds your records? Confidence is shown as a word rather than a percentage,
 * the alternatives stay visible and selectable instead of being hidden behind
 * a "show more", and the official page to verify against is linked directly.
 *
 * The product will never auto-advance past this step, however confident the
 * model is. A silent wrong match costs a citizen a Section 6(3) transfer and
 * restarts their thirty days, which is exactly the harm we are here to stop.
 */
export function AuthorityStep({
  routing,
  selectedId,
  onSelect,
  onBack,
  onSubmit,
  loading,
}: {
  routing: RoutingResponse;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const { t } = useI18n();
  const groupId = useId();
  const [showConfidenceHelp, setShowConfidenceHelp] = useState(false);

  const selected = routing.candidates.find((c) => c.authority.id === selectedId);
  const [top, ...alternatives] = routing.candidates;

  return (
    <div>
      <PageTitle
        marker={<Marker index={2} total={5} label={t("steps.authority")} />}
        lead={t("confirm.help")}
      >
        {t("confirm.title")}
      </PageTitle>

      <div className="mt-8 space-y-6">
        {routing.lowConfidence && (
          <Alert className="border-destructive/30 bg-destructive/6">
            <Info aria-hidden="true" className="text-destructive" />
            <AlertTitle>{t("confirm.lowTitle")}</AlertTitle>
            <AlertDescription>{t("confirm.lowBody")}</AlertDescription>
          </Alert>
        )}

        {/*
          A real radiogroup rather than a row of buttons: arrow keys move
          between options, the selected one is announced as selected, and the
          whole set is announced as a set of N.
        */}
        <fieldset>
          <legend className="sr-only">{t("confirm.title")}</legend>
          <div role="radiogroup" aria-labelledby={groupId} className="space-y-3">
            <span id={groupId} className="sr-only">
              {t("confirm.title")}
            </span>

            <CandidateOption
              candidate={top}
              checked={selectedId === top.authority.id}
              onSelect={onSelect}
              name={groupId}
            />

            {alternatives.length > 0 && (
              <>
                <div className="pt-4">
                  <Marker label={t("confirm.otherOptions")} />
                </div>
                {alternatives.map((candidate) => (
                  <CandidateOption
                    key={candidate.authority.id}
                    candidate={candidate}
                    checked={selectedId === candidate.authority.id}
                    onSelect={onSelect}
                    name={groupId}
                  />
                ))}
              </>
            )}
          </div>
        </fieldset>

        <div>
          <button
            type="button"
            onClick={() => setShowConfidenceHelp((open) => !open)}
            aria-expanded={showConfidenceHelp}
            className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("confidence.explain")}
          </button>
          {showConfidenceHelp && (
            <p className="animate-rise max-w-[58ch] border-l-2 border-border pl-4 text-sm leading-relaxed opacity-75">
              {t("confidence.explainBody")}
            </p>
          )}
        </div>
      </div>

      {selected && <AuthorityDetails candidate={selected} />}

      {routing.extractedReferences.length > 0 && (
        <div className="mt-6">
          <InfoNotice title={t("confirm.references")}>
            <ul className="mt-1 flex flex-wrap gap-2">
              {routing.extractedReferences.map((reference) => (
                <li
                  key={reference}
                  className="inline-flex items-center gap-1.5 rounded-md bg-card px-2 py-1 font-mono text-sm text-foreground ring-1 ring-border"
                >
                  <Tag aria-hidden="true" className="size-3.5 opacity-75" />
                  {reference}
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Reference numbers are copied into the application exactly as you
              typed them. An authority cannot locate the right file without them.
            </p>
          </InfoNotice>
        </div>
      )}

      <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row-reverse">
        <Button
          type="button"
          size="xl"
          variant={routing.lowConfidence ? "outline" : "cta"}
          onClick={onSubmit}
          disabled={loading || !selectedId}
        >
          {loading ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              {t("confirm.working")}
            </>
          ) : (
            <>
              {routing.lowConfidence ? t("confirm.submitUnsure") : t("confirm.submit")}
              <ArrowRight aria-hidden="true" />
            </>
          )}
        </Button>
        <Button type="button" size="xl" variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft aria-hidden="true" />
          {t("common.back")}
        </Button>
      </div>
    </div>
  );
}

function CandidateOption({
  candidate,
  checked,
  onSelect,
  name,
}: {
  candidate: Candidate;
  checked: boolean;
  onSelect: (id: string) => void;
  name: string;
}) {
  const { t } = useI18n();
  const bucket = confidenceBucket(candidate.confidence);
  const inputId = `${name}-${candidate.authority.id}`;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex cursor-pointer gap-4 border p-5 transition-colors",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
        checked
          ? "border-foreground bg-card"
          : "border-border hover:bg-card"
      )}
    >
      <input
        type="radio"
        id={inputId}
        name={name}
        value={candidate.authority.id}
        checked={checked}
        onChange={() => onSelect(candidate.authority.id)}
        className="mt-1 size-5 shrink-0 cursor-pointer accent-[var(--foreground)]"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-start justify-between gap-3">
          <span className="max-w-[34ch] text-base leading-snug font-semibold">
            {candidate.authority.authorityName}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[0.68rem] tracking-[0.12em] uppercase",
              TONE_CLASSES[bucket.tone]
            )}
          >
            {t(bucket.key)}
          </span>
        </span>
        <span className="mt-2 block max-w-[58ch] text-sm leading-relaxed opacity-75">
          {candidate.reason}
        </span>
        <span className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 font-mono text-[0.68rem] tracking-[0.12em] uppercase ring-1",
              candidate.authority.level === "central"
                ? "bg-card text-info ring-info/30"
                : "bg-card text-warning ring-warning/35"
            )}
          >
            {candidate.authority.level === "central"
              ? "Central Government"
              : "State Government"}
          </span>
        </span>
      </span>
    </label>
  );
}

function AuthorityDetails({ candidate }: { candidate: Candidate }) {
  const { t } = useI18n();
  const { authority } = candidate;
  const isState = resolveChannel(authority) === "state-portal";

  return (
    <section className="mt-10">
      <Rule />
      <div className="pt-8">
        <Marker label={t("confirm.office")} />
      </div>

      {/*
        A definition list on hairlines rather than a card. These are the facts
        a citizen checks against the authority's own page, so they should read
        as a record, not as a panel.
      */}
      <dl className="mt-5 grid grid-cols-[auto_1fr] border-y border-border">
        <DetailRow icon={Building2} label={t("confirm.pio")} first>
          {authority.pioDesignation}
        </DetailRow>
        <DetailRow icon={MapPin} label={t("confirm.address")}>
          {authority.filingAddress}
        </DetailRow>
        <DetailRow icon={Gavel} label={t("confirm.appellate")}>
          {authority.appellateAuthority}
        </DetailRow>
      </dl>

      {authority.notes && (
        <p className="mt-5 max-w-[58ch] border-l-2 border-border pl-4 text-sm leading-relaxed">
          <span className="font-semibold">{t("confirm.worthKnowing")}: </span>
          <span className="opacity-75">{authority.notes}</span>
        </p>
      )}

      {/*
        Surfaced here rather than at the filing step because it can change
        which authority the citizen picks — and because rtionline.gov.in
        keeps the fee of a state application it returns.
      */}
      {isState && (
        <Alert className="mt-5 border-warning/40 bg-warning/8">
          <Info aria-hidden="true" className="text-warning" />
          <AlertTitle>This one cannot be filed on the central portal</AlertTitle>
          <AlertDescription>
            rtionline.gov.in covers Central Government authorities only. A State
            application submitted there is returned without a refund of the fee.
            We will show you the right channel at the filing step.
          </AlertDescription>
        </Alert>
      )}

      {authority.verifyAt && (
        <p className="mt-5 text-sm opacity-75">
          {t("confirm.verify")}{" "}
          {authority.verifyAt.startsWith("http") ? (
            <a
              href={authority.verifyAt}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
            >
              {authority.verifyAt.replace(/^https?:\/\//, "")}
              <ExternalLink aria-hidden="true" className="size-3.5" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : (
            <span className="font-medium text-foreground">{authority.verifyAt}</span>
          )}
        </p>
      )}
    </section>
  );
}

/**
 * One labelled fact.
 *
 * `dt` and `dd` are direct children of the `dl` — a wrapping div between them
 * breaks the list semantics, which is how a screen reader stops announcing
 * these as term-and-definition pairs at all. The row is laid out with grid
 * rather than a flex wrapper so the icon column can exist without one.
 */
function DetailRow({
  icon: Icon,
  label,
  children,
  first = false,
}: {
  icon: typeof Building2;
  label: string;
  children: React.ReactNode;
  /** Suppresses the divider above the first row, since the `dl` is bordered. */
  first?: boolean;
}) {
  const divider = first ? "" : "border-t border-border";
  return (
    <>
      <dt
        className={cn(
          "col-start-1 flex items-start gap-4 pt-4 font-mono text-[0.68rem] tracking-[0.14em] whitespace-nowrap uppercase opacity-75",
          divider
        )}
      >
        <Icon aria-hidden="true" className="mt-px size-4 shrink-0" />
        {label}
      </dt>
      <dd className={cn("col-start-2 min-w-0 pt-4 pb-4 pl-4 text-base leading-relaxed", divider)}>
        {children}
      </dd>
    </>
  );
}
