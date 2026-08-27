"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ux4g/alert";
import { ApplicationHeader } from "@/components/track/application-header";
import { ApplicationSheet } from "@/components/track/application-sheet";
import { FiledDialog } from "@/components/track/filed-dialog";
import { FilingGuide, type FilingSectionId } from "@/components/track/filing-guide";
import { FilingStepNav } from "@/components/track/filing-steps";
import { PayAndFile, type Receipt as ReceiptData } from "@/components/track/pay-and-file";
import { Button } from "@/components/ux4g/button";
import { updateApplication } from "@/lib/client/store";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/client/i18n";
import { useApplication, useHydrated } from "@/lib/client/use-applications";
import {
  FILING_STEPS,
  stepProblems,
  type FilingStepId,
} from "@/lib/client/filing-steps";
import type { Applicant, Authority } from "@/lib/client/types";

/**
 * Which of the form's sections belong to each step.
 *
 * "Supporting documents" rides with the request rather than standing alone:
 * it is two fields about the same thing, and a step of its own would be a
 * screen someone clicks past without reading.
 */
const SECTIONS_FOR_STEP: Record<Exclude<FilingStepId, "pay">, FilingSectionId[]> = {
  authority: ["authority"],
  applicant: ["applicant"],
  declaration: ["declaration"],
  request: ["request", "supporting"],
};

/**
 * Step 4 — Submit RTI Request. The last step of Initiate Requisition.
 *
 * The journey ends here, at "pay ₹10 and file". Everything that happens
 * afterwards — the wait, the reminder, the appeal — starts from the Applicant
 * Dashboard, so this page hands over rather than continuing: the
 * acknowledgement arrives as a dialog and points at the dashboard, and there
 * is no tracking on the screen at all.
 *
 * Back goes to the draft, not to the dashboard. This is step 4 of a form; the
 * thing behind it is step 3.
 */
export default function SubmitApplicationPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const application = useApplication(params.id);

  const [step, setStep] = useState<FilingStepId>("authority");
  const [printing, setPrinting] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const filed = Boolean(application?.filedAt);

  /*
   * Render the print sheet first, then print. Calling window.print() in the
   * same tick would capture the DOM before React has committed the sheet.
   */
  useEffect(() => {
    if (!printing) return;
    const frame = requestAnimationFrame(() => {
      window.print();
      setPrinting(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [printing]);

  const handleApplicantChange = useCallback(
    (applicant: Applicant) => {
      if (application) updateApplication(application.id, { applicant });
    },
    [application]
  );

  const handleAuthorityChange = useCallback(
    (authority: Authority) => {
      if (application) updateApplication(application.id, { authority });
    },
    [application]
  );

  if (!hydrated) {
    return (
      <div className={cn(PAGE_LAYOUT)}>
        <p className="opacity-75">{t("common.loading")}</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className={cn(PAGE_LAYOUT, "text-center")}>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">{t("track.missingTitle")}</h1>
        <p className="mx-auto mt-3 max-w-[52ch] leading-relaxed opacity-75">
          {t("track.missingBody")}
        </p>
        <Button
          size="xl"
          variant="cta"
          className="mt-6"
          nativeButton={false}
          render={<Link href="/apply">{t("list.emptyCta")}</Link>}
        />
      </div>
    );
  }

  const stepIndex = FILING_STEPS.indexOf(step);
  const blocked = stepProblems(step, application, application.portalText);

  /*
   * Move the heading into view and focus on a step change. Without it the
   * viewport stays where it was, which on the longer steps leaves someone
   * looking at the middle of a form they have not seen the top of — and a
   * screen reader user gets no announcement that anything happened at all.
   */
  function goTo(next: FilingStepId) {
    setStep(next);
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>("[data-filing-step] h2");
      heading?.scrollIntoView({ block: "start" });
      heading?.focus();
    });
  }

  function goNext() {
    if (blocked.length > 0) return;
    const next = FILING_STEPS[stepIndex + 1];
    if (next) goTo(next);
  }

  function goPrevious() {
    const previous = FILING_STEPS[stepIndex - 1];
    if (previous) goTo(previous);
  }

  return (
    <div className={cn(PAGE_LAYOUT)}>
      <ApplicationHeader
        application={application}
        step={3}
        stageKey="steps.file"
        /*
         * Once it is filed there is no previous step to return to — the form
         * is spent, and the only useful way out is the list.
         */
        backHref={filed ? "/applications" : `/apply?draft=${application.id}`}
        backLabelKey={filed ? "nav.mine" : "common.backStep"}
        compact={!filed}
      />

      {/* Already filed: say so, and hand over. Re-showing the form here is how
          an application gets filed twice. */}
      {filed && (
        <div className="mt-16 border-t border-border pt-8">
          <p className="max-w-[58ch] leading-relaxed opacity-75">
            {t("track.alreadyFiled")}
          </p>
          <Button
            size="xl"
            variant="cta"
            className="mt-6"
            nativeButton={false}
            render={<Link href="/applications">{t("receipt.dashboard")}</Link>}
          />
        </div>
      )}

      {!filed && (
        <div className="mt-6" data-filing-step>
          {/*
            Sticky under the site header, which is 4rem tall. The chips are
            the only wayfinding once the form is five screens deep, and on the
            applicant step they would otherwise scroll away before the fields
            they belong to.
          */}
          <div className="sticky top-16 z-30 -mx-6 mb-8 border-b border-border bg-background px-6 py-2.5 sm:-mx-12 sm:px-12 lg:-mx-16 lg:px-16">
            <FilingStepNav
              steps={FILING_STEPS}
              current={step}
              isComplete={(candidate) =>
                stepProblems(candidate, application, application.portalText).length === 0
              }
              onSelect={goTo}
            />
          </div>

          {step === "pay" ? (
            <PayAndFile
              application={application}
              onFiled={(issued) => {
                updateApplication(application.id, {
                  status: "filed",
                  filedAt: issued.filedAt,
                  registrationNumber: issued.registrationNumber,
                  viaApio: false,
                });
                setReceipt(issued);
                setShowReceipt(true);
              }}
            />
          ) : (
            <FilingGuide
              application={application}
              only={SECTIONS_FOR_STEP[step]}
              onApplicantChange={handleApplicantChange}
              onAuthorityChange={handleAuthorityChange}
            />
          )}

          {/*
            The fee step carries its own submit button, so it gets no "Next" —
            two primary actions on one screen is how someone pays twice.
          */}
          {step !== "pay" && (
            <div className="mt-12 border-t border-border pt-8">
              {blocked.length > 0 && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle aria-hidden="true" />
                  <AlertDescription>{t("submit.incomplete")}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button size="xl" variant="cta" onClick={goNext} disabled={blocked.length > 0}>
                  {t("submit.next")}
                  <ArrowRight aria-hidden="true" />
                </Button>
                {stepIndex > 0 && (
                  <Button size="xl" variant="ghost" onClick={goPrevious}>
                    <ArrowLeft aria-hidden="true" />
                    {t("submit.previous")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {receipt && (
        <FiledDialog
          open={showReceipt}
          receipt={receipt}
          onClose={() => setShowReceipt(false)}
          onPrint={() => setPrinting(true)}
        />
      )}

      {printing && <ApplicationSheet application={application} />}
    </div>
  );
}
