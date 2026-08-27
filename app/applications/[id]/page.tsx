"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ApplicationHeader } from "@/components/track/application-header";
import { FiledDialog } from "@/components/track/filed-dialog";
import { FilingGuide } from "@/components/track/filing-guide";
import { PayAndFile, type Receipt as ReceiptData } from "@/components/track/pay-and-file";
import { Button } from "@/components/ux4g/button";
import { updateApplication } from "@/lib/client/store";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/client/i18n";
import { useApplication, useHydrated } from "@/lib/client/use-applications";
import type { Applicant, Authority } from "@/lib/client/types";

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
        <div className="mt-16 space-y-16">
          <FilingGuide
            application={application}
            onApplicantChange={handleApplicantChange}
            onAuthorityChange={handleAuthorityChange}
          />

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
