"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ApplicationHeader } from "@/components/track/application-header";
import { ApplicationSheet } from "@/components/track/application-sheet";
import { FilingGuide } from "@/components/track/filing-guide";
import { PayAndFile, type Receipt as ReceiptData } from "@/components/track/pay-and-file";
import { Receipt } from "@/components/track/receipt";
import { Button } from "@/components/ux4g/button";
import { updateApplication } from "@/lib/client/store";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/client/i18n";
import { useApplication, useHydrated } from "@/lib/client/use-applications";
import type { Applicant, Authority } from "@/lib/client/types";

/**
 * Step 4 — Submit RTI Request.
 *
 * This page ends at the acknowledgement. It used to keep going: the receipt
 * appeared and the whole tracking panel unrolled beneath it on the same
 * screen, so the moment of "your application has been filed" was immediately
 * buried under a countdown, a demo control and an appeal draft.
 *
 * Filing and tracking are separate acts, minutes and then a month apart, so
 * they are separate pages. The acknowledgement's own "Track this application"
 * button is the way across.
 */
export default function SubmitApplicationPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydrated();
  const application = useApplication(params.id);

  const [printing, setPrinting] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

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

  return (
    <div className={cn(PAGE_LAYOUT)}>
      <ApplicationHeader application={application} step={3} stageKey="steps.file" />

      {/* Just filed: the acknowledgement, and nothing under it. */}
      {receipt && (
        <div className="mt-16">
          <Receipt
            receipt={receipt}
            onPrint={() => setPrinting(true)}
            onTrack={() => router.push(`/applications/${application.id}/track`)}
          />
        </div>
      )}

      {/* Already filed, arriving fresh: point at tracking rather than at a
          form that would file it a second time. */}
      {!receipt && filed && (
        <div className="mt-16 border-t border-border pt-8">
          <p className="max-w-[58ch] leading-relaxed opacity-75">
            {t("track.alreadyFiled")}
          </p>
          <Button
            size="xl"
            variant="cta"
            className="mt-6"
            nativeButton={false}
            render={
              <Link href={`/applications/${application.id}/track`}>
                {t("receipt.track")}
              </Link>
            }
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
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      {printing && <ApplicationSheet application={application} />}
    </div>
  );
}
