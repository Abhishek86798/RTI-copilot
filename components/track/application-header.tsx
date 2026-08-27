"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { Marker, PageTitle } from "@/components/editorial";
import { StatusBadge } from "@/components/status-badge";
import { StepIndicator } from "@/components/step-indicator";
import { deriveStatus, type Application } from "@/lib/client/store";
import { useI18n } from "@/lib/client/i18n";
import type { StringKey } from "@/lib/client/i18n";

/**
 * The context every screen about one application shares.
 *
 * Filing, tracking and appealing are three separate pages, each reachable on
 * its own URL — but they are all the same application, so the identity of it
 * has to be stated the same way on each. Otherwise moving between them feels
 * like moving between unrelated screens.
 *
 * The step rail is optional, and only filing passes one. Filing is the last
 * step of Initiate Requisition; tracking and appealing are separate errands
 * begun from the Applicant Dashboard weeks later, and drawing a wizard rail
 * across them implied they were part of a form still being filled in.
 */
export function ApplicationHeader({
  application,
  step,
  stageKey,
  backHref,
  backLabelKey,
  compact = false,
}: {
  application: Application;
  /** Index into the journey rule. Omit on screens outside the journey. */
  step?: number;
  /** Names the stage under the rule: File, Track, Appeal. */
  stageKey: StringKey;
  backHref: string;
  backLabelKey: StringKey;
  /**
   * The filing screen's version: identity on one line rather than a display
   * title, and no status badge.
   *
   * Measured on the full version, the first form field sat about 750px down —
   * a whole viewport of chrome before anything to fill in, on a screen whose
   * only job is filling things in. Tracking and appealing are read-first
   * screens where the display title is doing real work, so they keep it.
   */
  compact?: boolean;
}) {
  const { t } = useI18n();
  const status = deriveStatus(application);

  if (compact) {
    return (
      <div data-print="hide">
        {step !== undefined && <StepIndicator current={step} className="mb-5" />}

        {/*
          Back, identity and the request text on one band. The two halves sit
          side by side from `sm` because the authority name is long and the
          controls are short — stacking them wastes the width the name needs.
        */}
        <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="min-w-0">
            <Link
              href={backHref}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium underline-offset-4 opacity-75 hover:underline hover:opacity-100"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t(backLabelKey)}
            </Link>
            <h1 className="mt-1 text-lg leading-tight font-bold tracking-[-0.02em] text-balance sm:text-xl">
              {application.authority.authorityName}
            </h1>
            <p className="mt-1 text-sm leading-snug opacity-75">
              {application.authority.pioDesignation}
            </p>
            {application.registrationNumber && (
              <p className="mt-2 text-sm">
                <span className="opacity-75">{t("receipt.regNumber")}: </span>
                <span className="font-mono">{application.registrationNumber}</span>
              </p>
            )}
          </div>

          <details className="group shrink-0 sm:max-w-[22rem]">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">
              <FileText aria-hidden="true" className="size-4" />
              {t("track.viewText")}
            </summary>
            <pre className="mt-3 max-h-64 overflow-y-auto border-l-2 border-border py-2 pl-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {application.portalText}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div data-print="hide">
      {step !== undefined && <StepIndicator current={step} className="mb-8" />}

      <div className="mb-8">
        <Link
          href={backHref}
          className="inline-flex min-h-12 items-center gap-1.5 text-sm font-medium underline-offset-4 opacity-75 hover:underline hover:opacity-100"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t(backLabelKey)}
        </Link>
      </div>

      <PageTitle
        marker={
          <div className="flex flex-wrap items-center gap-3">
            {/* The step rule above already carries the position, so the marker
                names the stage without repeating "04 / 04". */}
            <Marker label={t(stageKey)} />
            <StatusBadge status={status} />
          </div>
        }
        lead={application.authority.pioDesignation}
      >
        {application.authority.authorityName}
      </PageTitle>

      {application.registrationNumber && (
        <p className="mt-6 text-sm">
          <span className="opacity-75">{t("receipt.regNumber")}: </span>
          <span className="font-mono">{application.registrationNumber}</span>
        </p>
      )}

      <details className="group mt-8">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 text-base font-medium underline-offset-4 hover:underline">
          <FileText aria-hidden="true" className="size-5" />
          {t("track.viewText")}
        </summary>
        <pre className="mt-5 border-l-2 border-border py-2 pl-6 font-mono text-base leading-relaxed whitespace-pre-wrap">
          {application.portalText}
        </pre>
      </details>
    </div>
  );
}
