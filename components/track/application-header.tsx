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
 * Filing, tracking and appealing are three separate pages now, each reachable
 * on its own URL — but they are all the same application, so the identity of
 * it has to be stated the same way on each. Otherwise moving between them
 * feels like moving between unrelated screens.
 */
export function ApplicationHeader({
  application,
  step,
  stageKey,
}: {
  application: Application;
  /** Index into the five-step rule. */
  step: number;
  /** Names the stage under the rule: File, Track, Appeal. */
  stageKey: StringKey;
}) {
  const { t } = useI18n();
  const status = deriveStatus(application);

  return (
    <div data-print="hide">
      <StepIndicator current={step} className="mb-12" />

      <div className="mb-12">
        <Link
          href="/applications"
          className="inline-flex min-h-12 items-center gap-1.5 text-sm font-medium underline-offset-4 opacity-75 hover:underline hover:opacity-100"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t("nav.mine")}
        </Link>
      </div>

      <PageTitle
        marker={
          <div className="flex flex-wrap items-center gap-3">
            {/* The step rule above already carries the position, so the marker
                names the stage without repeating "05 / 05". */}
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
