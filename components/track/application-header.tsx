"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
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
 * One layout, not two. There used to be a tall version for the read-first
 * screens and a compact one for filing, and the tall one spent about 750px —
 * a whole viewport — restating the authority name before the page said
 * anything. Identity is a heading and two lines; it does not need display
 * size on any of these screens.
 *
 * There is no progress rail here. Filing draws its own five chips, and a
 * second rule above them numbering the stages of the whole journey was two
 * indicators on one screen disagreeing about what step you were on.
 */
export function ApplicationHeader({
  application,
  stageKey,
  backHref,
  backLabelKey,
}: {
  application: Application;
  /** Names the stage: File, Track, Appeal. */
  stageKey: StringKey;
  backHref: string;
  backLabelKey: StringKey;
}) {
  const { t } = useI18n();
  const status = deriveStatus(application);

  return (
    <div data-print="hide">
      <Link
        href={backHref}
        className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t(backLabelKey)}
      </Link>

      {/*
        Identity on the left, the things you might want to open on the right.
        Side by side from `sm` because the authority name is long and the
        controls are short — stacking them wastes the width the name needs.
      */}
      <div className="mt-1.5 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="font-mono text-[0.75rem] tracking-[0.14em] text-muted-foreground uppercase">
              {t(stageKey)}
            </p>
            <StatusBadge status={status} />
          </div>

          <h1 className="mt-1.5 text-lg leading-tight font-semibold tracking-[-0.015em] text-balance sm:text-xl">
            {application.authority.authorityName}
          </h1>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">
            {application.authority.pioDesignation}
          </p>
          {application.registrationNumber && (
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">{t("receipt.regNumber")}: </span>
              <span className="font-mono">{application.registrationNumber}</span>
            </p>
          )}
        </div>

        <details className="group shrink-0 sm:max-w-[22rem]">
          <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">
            <FileText aria-hidden="true" className="size-4" />
            {t("track.viewText")}
          </summary>
          <pre className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {application.portalText}
          </pre>
        </details>
      </div>
    </div>
  );
}
