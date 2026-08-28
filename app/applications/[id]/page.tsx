"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ArrowRight } from "lucide-react";

import { StepActions } from "@/components/apply/step-actions";
import { ApplicationHeader } from "@/components/track/application-header";
import { FiledDialog } from "@/components/track/filed-dialog";
import { FilingGuide, type FilingSectionId } from "@/components/track/filing-guide";
import { FilingStepNav } from "@/components/track/filing-steps";
import { PayAndFile, type Receipt as ReceiptData } from "@/components/track/pay-and-file";
import { Button, buttonVariants } from "@/components/ui/button";
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
  const router = useRouter();
  const hydrated = useHydrated();
  const application = useApplication(params.id);

  const [step, setStep] = useState<FilingStepId>("authority");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const filed = Boolean(application?.filedAt);

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
        <p className="mx-auto mt-3 max-w-[52ch] opacity-75">
          {t("track.missingBody")}
        </p>
        <Link href="/apply"
            className={cn(buttonVariants({ variant: "cta", size: "lg" }), "mt-6")}
          >{t("list.emptyCta")}</Link>
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
    if (previous) {
      goTo(previous);
      return;
    }
    /* First sub-step: the step before this one is the draft. */
    router.push(`/apply?draft=${params.id}`);
  }

  return (
    <div className={cn(PAGE_LAYOUT)}>
      <ApplicationHeader
        application={application}
        stageKey="steps.file"
        /*
         * Only once it is filed. While the form is live, Back lives in the
         * actions row at the foot of the step with everything else; a second
         * one above the title was the same act described twice.
         */
        backHref={filed ? "/applications" : undefined}
        backLabelKey={filed ? "nav.mine" : undefined}
      />

      {/* Already filed: say so, and hand over. Re-showing the form here is how
          an application gets filed twice. */}
      {filed && (
        <div className="mt-10 border-t border-border pt-8">
          <p className="max-w-[58ch] opacity-75">
            {t("track.alreadyFiled")}
          </p>
          <Link href="/applications"
            className={cn(buttonVariants({ variant: "cta", size: "lg" }), "mt-6")}
          >{t("receipt.dashboard")}</Link>
        </div>
      )}

      {!filed && (
        <div className="mt-3" data-filing-step>
          {/*
            Sticky under the site header, which is 3.5rem tall. The chips are
            the only wayfinding once the form is five screens deep, and on the
            applicant step they would otherwise scroll away before the fields
            they belong to.
          */}
          <div className="sticky top-14 z-30 -mx-5 mb-4 bg-background px-5 pt-1 pb-3 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
            <FilingStepNav
              steps={FILING_STEPS}
              current={step}
              isComplete={(candidate) =>
                stepProblems(candidate, application, application.portalText).length === 0
              }
              onSelect={goTo}
            />
          </div>

          {/* Says what the asterisk means, once, before any field carries it. */}
          {step !== "pay" && (
            <p className="mb-3 text-xs text-destructive">{t("submit.mandatory")}</p>
          )}

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
            The same actions row as steps 1 to 3 of the journey, so Back is one
            control in one place from the first screen to the last. The filing
            screen used to have two: a "Back to the previous step" link above
            the title and a "Previous" button below the form, which are the
            same act described two ways.
          */}
          <StepActions
            onBack={goPrevious}
            /* Announced, not boxed: a red line under the form is what a
               government form does, and an alert panel for one sentence made
               the failure look larger than the fix. */
            className="items-start"
          >
            {step === "pay" ? undefined : (
              <Button size="lg" variant="cta" onClick={goNext} disabled={blocked.length > 0}>
                {t("submit.next")}
                <ArrowRight aria-hidden="true" />
              </Button>
            )}
          </StepActions>

          {blocked.length > 0 && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {t("submit.incomplete")}
            </p>
          )}
        </div>
      )}

      {receipt && (
        <FiledDialog
          open={showReceipt}
          receipt={receipt}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
