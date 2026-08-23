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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ux4g/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ux4g/alert";
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle as="h1" className="text-xl">{t("confirm.title")}</CardTitle>
          <CardDescription className="text-base">{t("confirm.help")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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
                  <p className="pt-2 text-sm font-medium text-muted-foreground">
                    {t("confirm.otherOptions")}
                  </p>
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
              className="cursor-pointer text-sm font-medium text-info underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {t("confidence.explain")}
            </button>
            {showConfidenceHelp && (
              <p className="animate-rise mt-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                {t("confidence.explainBody")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selected && <AuthorityDetails candidate={selected} />}

      {routing.extractedReferences.length > 0 && (
        <InfoNotice title={t("confirm.references")}>
          <ul className="mt-1 flex flex-wrap gap-2">
            {routing.extractedReferences.map((reference) => (
              <li
                key={reference}
                className="inline-flex items-center gap-1.5 rounded-md bg-card px-2 py-1 font-mono text-sm text-foreground ring-1 ring-border"
              >
                <Tag aria-hidden="true" className="size-3.5 text-muted-foreground" />
                {reference}
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Reference numbers are copied into the application exactly as you
            typed them. An authority cannot locate the right file without them.
          </p>
        </InfoNotice>
      )}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
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
        "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
        checked
          ? "border-info bg-accent ring-1 ring-info"
          : "border-border bg-card hover:border-info/50 hover:bg-muted"
      )}
    >
      <input
        type="radio"
        id={inputId}
        name={name}
        value={candidate.authority.id}
        checked={checked}
        onChange={() => onSelect(candidate.authority.id)}
        className="mt-1 size-5 shrink-0 cursor-pointer accent-[var(--info)]"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-start justify-between gap-2">
          <span className="text-base font-semibold">
            {candidate.authority.authorityName}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
              TONE_CLASSES[bucket.tone]
            )}
          >
            {t(bucket.key)}
          </span>
        </span>
        <span className="mt-1.5 block text-sm text-muted-foreground">
          {candidate.reason}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 font-medium ring-1",
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
    <Card>
      <CardContent className="space-y-4 pt-2">
        <DetailRow icon={Building2} label={t("confirm.pio")}>
          {authority.pioDesignation}
        </DetailRow>
        <DetailRow icon={MapPin} label={t("confirm.address")}>
          {authority.filingAddress}
        </DetailRow>
        <DetailRow icon={Gavel} label={t("confirm.appellate")}>
          {authority.appellateAuthority}
        </DetailRow>

        {authority.notes && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <span className="font-semibold">{t("confirm.worthKnowing")}: </span>
            <span className="text-muted-foreground">{authority.notes}</span>
          </div>
        )}

        {/*
          Surfaced here rather than at the filing step because it can change
          which authority the citizen picks — and because rtionline.gov.in
          keeps the fee of a state application it returns.
        */}
        {isState && (
          <Alert className="border-warning/40 bg-warning/8">
            <Info aria-hidden="true" className="text-warning" />
            <AlertTitle>This one cannot be filed on the central portal</AlertTitle>
            <AlertDescription>
              rtionline.gov.in covers Central Government authorities only. A
              State application submitted there is returned without a refund of
              the fee. We will show you the right channel at the filing step.
            </AlertDescription>
          </Alert>
        )}

        {authority.verifyAt && (
          <p className="text-sm text-muted-foreground">
            {t("confirm.verify")}{" "}
            {authority.verifyAt.startsWith("http") ? (
              <a
                href={authority.verifyAt}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-info underline underline-offset-4"
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
      </CardContent>
    </Card>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Building2;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base">{children}</p>
      </div>
    </div>
  );
}
