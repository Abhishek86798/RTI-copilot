"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
        className="inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t(backLabelKey)}
      </Link>

      {/*
        Identity in three lines: what stage this is, whose office it is going
        to, and the reference if there is one.

        There used to be a "view the application text" disclosure opposite it,
        which is why this was a two-column band. The text is written and read
        on the drafting step — offering it again on every screen afterwards was
        a second copy of something nobody had lost.
      */}
      <div className="mt-1.5 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-2xs tracking-[0.14em] text-muted-foreground uppercase">
            {t(stageKey)}
          </p>
          <StatusBadge status={status} />
        </div>

        <h1 className="mt-1.5 text-base font-semibold tracking-[-0.015em] text-balance sm:text-lg">
          {application.authority.authorityName}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {application.authority.pioDesignation}
          {application.registrationNumber && (
            <>
              <span aria-hidden="true"> · </span>
              <span className="font-mono">{application.registrationNumber}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
