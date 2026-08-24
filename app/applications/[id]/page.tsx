"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { StepIndicator } from "@/components/step-indicator";
import { AppealCard } from "@/components/track/appeal-card";
import { ApplicationSheet, AppealSheet } from "@/components/track/application-sheet";
import { DeadlineTracker } from "@/components/track/deadline-tracker";
import { FilingGuide } from "@/components/track/filing-guide";
import { PayAndFile, type Receipt as ReceiptData } from "@/components/track/pay-and-file";
import { Receipt } from "@/components/track/receipt";
import { Button } from "@/components/ux4g/button";
import { computeClock, formatDate, parseDateInput } from "@/lib/client/deadlines";
import { buildFirstAppeal } from "@/lib/client/filing";
import { deriveStatus, updateApplication } from "@/lib/client/store";
import { Marker, PAGE_LAYOUT, PageTitle } from "@/components/editorial";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/client/i18n";
import { useApplication, useHydrated } from "@/lib/client/use-applications";
import type { Applicant } from "@/lib/client/types";

type PrintTarget = "application" | "appeal" | null;

/**
 * Steps 4 and 5 live here, on a durable URL.
 *
 * Filing and tracking are separated from the drafting wizard on purpose: the
 * citizen leaves at this point to go and file on a government portal, and has
 * to be able to come back — today to record the registration number, and again
 * in thirty days when the deadline lapses. A wizard step held in component
 * state cannot be returned to; a URL can be bookmarked.
 */
export default function ApplicationPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const application = useApplication(params.id);

  const [printTarget, setPrintTarget] = useState<PrintTarget>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const status = application ? deriveStatus(application) : "drafting";
  const filed = Boolean(application?.filedAt);

  const clock =
    application?.filedAt
      ? computeClock({
          filedAt: application.filedAt,
          lifeOrLibertyFlag: application.lifeOrLibertyFlag,
          viaApio: application.viaApio,
          simulatedDaysElapsed: application.simulatedDaysElapsed,
        })
      : null;

  /*
   * The appeal drafts itself the moment the deadline lapses (FR-9) rather than
   * waiting to be asked. By then the citizen has been ignored for a month; the
   * document being already written is the whole point of the feature.
   *
   * The draft is written to the store, not into local state — the store is the
   * external system this effect synchronises, and the textarea below reads the
   * saved text straight back out. Keeping a second copy in component state
   * would let an edit and a refresh disagree about what the appeal says.
   */
  useEffect(() => {
    if (!application || !clock?.isOverdue || application.appeal) return;

    updateApplication(application.id, {
      appeal: {
        draftedAt: new Date().toISOString(),
        grounds: "deemed-refusal",
        text: buildFirstAppeal({
          applicantName: application.applicant.fullName,
          applicantAddress: application.applicant.address,
          authority: application.authority,
          registrationNumber: application.registrationNumber,
          filedAtLabel: formatDate(clock.filedAt),
          responseDeadlineLabel: formatDate(clock.responseDeadline),
          items: application.items,
          grounds: "deemed-refusal",
        }),
      },
    });
  }, [application, clock?.isOverdue, clock?.filedAt, clock?.responseDeadline]);

  const appealText = application?.appeal?.text ?? "";

  /*
   * Render the print sheet first, then print. Calling window.print() in the
   * same tick would capture the DOM before React has committed the sheet.
   */
  useEffect(() => {
    if (!printTarget) return;
    const frame = requestAnimationFrame(() => {
      window.print();
      setPrintTarget(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [printTarget]);

  const handleApplicantChange = useCallback(
    (applicant: Applicant) => {
      if (application) updateApplication(application.id, { applicant });
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
        <h1 className="text-2xl font-bold tracking-[-0.02em]">
          This application is not on this device
        </h1>
        <p className="mx-auto mt-3 max-w-[52ch] leading-relaxed opacity-75">
          Guest applications are stored in the browser that created them. If you
          cleared your browser data, or opened this link on another device, it
          will not be here.
        </p>
        <Button
          size="xl"
          variant="cta"
          className="mt-6"
          nativeButton={false}
          render={<Link href="/apply">Start a new application</Link>}
        />
      </div>
    );
  }

  return (
    <div className={cn(PAGE_LAYOUT)}>
      <StepIndicator current={filed ? 4 : 3} className="mb-8" />

      <div data-print="hide" className="mb-8">
        <Link
          href="/applications"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium underline-offset-4 opacity-75 hover:opacity-100 hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t("nav.mine")}
        </Link>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Summary — always visible, so context never scrolls away          */}
      {/* ---------------------------------------------------------------- */}
      <div data-print="hide">
        <PageTitle
          marker={
            <div className="flex flex-wrap items-center gap-3">
              {/* The step rule above already carries the position, so the
                  marker names the stage without repeating "05 / 05". */}
              <Marker label={t(filed ? "steps.track" : "steps.file")} />
              <StatusBadge status={status} />
            </div>
          }
          lead={application.authority.pioDesignation}
        >
          {application.authority.authorityName}
        </PageTitle>

        <details className="group mt-6">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">
            <FileText aria-hidden="true" className="size-4" />
            View the application text
          </summary>
          <pre className="mt-3 border-l-2 border-border py-1 pl-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {application.portalText}
          </pre>
        </details>
      </div>

      {/* Each section below draws its own leading hairline, so this level
          must not add one of its own — two rules with nothing between them
          read as a mistake rather than a division. */}

      {/* ---------------------------------------------------------------- */}
      {/* Not filed yet -> how to file                                      */}
      {/* ---------------------------------------------------------------- */}
      {!filed && (
        <div className="mt-10 space-y-10">
          <FilingGuide
            application={application}
            onApplicantChange={handleApplicantChange}
            onMarkFiled={({ filedAt, registrationNumber, viaApio }) => {
              updateApplication(application.id, {
                status: "filed",
                filedAt: parseDateInput(filedAt).toISOString(),
                registrationNumber: registrationNumber || undefined,
                viaApio,
              });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onPrint={() => setPrintTarget("application")}
          />

          {/*
            Filing in-app is offered only for Central authorities, because the
            portal this simulates serves only those. A State application would
            be returned with the fee kept, so that path stays outward — the
            filing guide already says where it actually goes.
          */}
          {application.authority.level === "central" && (
            <PayAndFile
              application={application}
              onFiled={(receipt) => {
                updateApplication(application.id, {
                  status: "filed",
                  filedAt: receipt.filedAt,
                  registrationNumber: receipt.registrationNumber,
                  viaApio: false,
                });
                setReceipt(receipt);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </div>
      )}

      {receipt && (
        <Receipt
          receipt={receipt}
          onPrint={() => setPrintTarget("application")}
          onTrack={() => setReceipt(null)}
        />
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Filed -> countdown, then appeal                                   */}
      {/* ---------------------------------------------------------------- */}
      {filed && (
        <div className="mt-10 space-y-10">
          <DeadlineTracker
            application={application}
            onSimulate={() =>
              updateApplication(application.id, { simulatedDaysElapsed: 31 })
            }
            onResetSimulation={() =>
              updateApplication(application.id, {
                simulatedDaysElapsed: undefined,
                appeal: undefined,
              })
            }
            onLogResponse={() =>
              updateApplication(application.id, {
                status: "resolved",
                responseLoggedAt: new Date().toISOString(),
              })
            }
          />

          {clock?.isOverdue && (
            <AppealCard
              appealText={appealText}
              onAppealTextChange={(value) => {
                if (application.appeal) {
                  updateApplication(application.id, {
                    appeal: { ...application.appeal, text: value },
                  });
                }
              }}
              appeal={application.appeal}
              onMarkAppealFiled={({ filedAt, registrationNumber }) => {
                if (!application.appeal) return;
                updateApplication(application.id, {
                  status: "appealed",
                  appeal: {
                    ...application.appeal,
                    filedAt,
                    registrationNumber: registrationNumber || undefined,
                  },
                });
              }}
              onPrint={() => setPrintTarget("appeal")}
            />
          )}
        </div>
      )}

      {/* Print-only sheets, mounted on demand. */}
      {printTarget === "application" && <ApplicationSheet application={application} />}
      {printTarget === "appeal" && <AppealSheet text={appealText} />}
    </div>
  );
}
