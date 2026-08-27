"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, Plus } from "lucide-react";

import { DownloadButton } from "@/components/track/download-button";
import { MigratePrompt } from "@/components/migrate-prompt";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ux4g/button";
import { computeClock, describeRemaining, formatDate } from "@/lib/client/deadlines";
import { listApplications as listGuestApplications } from "@/lib/client/guest-storage";
import { deriveStatus, getStoreMode, type Application } from "@/lib/client/store";
import { Marker, PageTitle } from "@/components/editorial";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/client/i18n";
import { useRemainingLabel } from "@/lib/client/use-remaining-label";
import { useApplications, useHydrated } from "@/lib/client/use-applications";

/**
 * The dashboard (FR-10).
 *
 * Sorted so that anything demanding action floats up: overdue first, then
 * whatever is closest to its deadline. An RTI filer typically has one or two
 * live applications, months apart — the useful question this list answers is
 * "is anything about to run out?", not "what did I file recently?".
 *
 * Set as an index rather than a stack of cards. Rows are separated by a
 * hairline and the remaining time is the largest thing in each one, because
 * scanning for what is about to lapse is the only reason to open this page.
 */
export default function ApplicationsPage() {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const applications = useApplications();

  const sorted = [...applications].sort(byUrgency);

  if (!hydrated) {
    return (
      <div className={cn(PAGE_LAYOUT)}>
        <p className="opacity-75">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className={cn(PAGE_LAYOUT)}>
      {getStoreMode() === "account" && (
        <MigratePrompt count={listGuestApplications().length} />
      )}

      <PageTitle
        marker={
          <Marker
            label={t("list.title")}
            total={sorted.length > 0 ? sorted.length : undefined}
          />
        }
      >
        {t("list.title")}
      </PageTitle>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
        <p className="max-w-[46ch] text-base opacity-75">{t("list.stored")}</p>
        <Button
          size="lg"
          variant="cta"
          nativeButton={false}
          render={
            <Link href="/apply">
              <Plus aria-hidden="true" />
              {t("nav.new")}
            </Link>
          }
        />
      </div>

      {sorted.length === 0 ? (
        <div className="mt-8 border-t border-border py-16 text-center">
          <p className="text-lg opacity-75">{t("list.empty")}</p>
          <Button
            size="lg"
            variant="cta"
            className="mt-6"
            nativeButton={false}
            render={<Link href="/apply">{t("list.emptyCta")}</Link>}
          />
        </div>
      ) : (
        // Dividers are borders on the list items, not `hr` elements between
        // them: an `hr` is not permitted content inside a `ul`, and inserting
        // one silently breaks the list semantics a screen reader relies on to
        // announce "list, N items".
        <ul className="mt-8 border-b border-border">
          {sorted.map((application) => (
            <li key={application.id} className="border-t border-border">
              <ApplicationRow application={application} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ApplicationRow({ application }: { application: Application }) {
  const { t } = useI18n();
  const remainingLabel = useRemainingLabel();
  const status = deriveStatus(application);
  const clock = application.filedAt
    ? computeClock({
        filedAt: application.filedAt,
        lifeOrLibertyFlag: application.lifeOrLibertyFlag,
        viaApio: application.viaApio,
        simulatedDaysElapsed: application.simulatedDaysElapsed,
      })
    : null;

  return (
    /*
      One link per row, stretched over the whole row by a pseudo-element, so
      the row is still a single target while the download stays a real button
      beside it. Nesting a button inside an anchor would be invalid markup and
      would give the row two conflicting activation behaviours.
    */
    <div className="group relative py-5 transition-colors hover:bg-card">
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-4">
            <StatusBadge status={status} />
            {application.isDemo && (
              <span className="rounded-md bg-card px-2 py-0.5 font-mono text-[0.75rem] tracking-[0.14em] text-warning uppercase ring-1 ring-warning/35">
                {t("list.example")}
              </span>
            )}
          </div>

          <p className="mt-3 max-w-[40ch] text-base leading-snug font-semibold tracking-[-0.01em]">
            <Link
              /*
                 Filing and tracking are separate pages, so a row has to point
                 at the one that matches the application's stage — sending a
                 filed request back to the submission form is how you file it
                 twice.
              */
              href={
                application.filedAt
                  ? `/applications/${application.id}/track`
                  : `/applications/${application.id}`
              }
              className="underline-offset-4 after:absolute after:inset-0 group-hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {application.authority.authorityName}
            </Link>
          </p>
          <p className="mt-2 line-clamp-2 max-w-[70ch] text-sm leading-[1.7] opacity-75">
            {application.grievance}
          </p>
        </div>

        {/*
          The countdown is the largest numeral in the row. It is the one thing
          on this page that changes on its own, and the only reason the list is
          sorted the way it is.
        */}
        <div className="shrink-0 sm:text-right">
          {clock ? (
            <>
              <p
                className={cn(
                  "text-[1.35rem] leading-[1] font-bold tracking-[-0.03em] tabular-nums",
                  clock.isOverdue && "text-destructive"
                )}
              >
                {remainingLabel(describeRemaining(clock))}
              </p>
              <p className="mt-2 flex items-center gap-1.5 font-mono text-[0.75rem] tracking-[0.14em] uppercase opacity-75 sm:justify-end">
                {clock.isOverdue ? (
                  <AlertTriangle aria-hidden="true" className="size-3.5" />
                ) : (
                  <Clock aria-hidden="true" className="size-3.5" />
                )}
                {formatDate(clock.responseDeadline)}
              </p>
            </>
          ) : (
            <p className="font-mono text-[0.75rem] tracking-[0.14em] uppercase opacity-75">
              {t("list.started", { date: formatDate(application.createdAt) })}
            </p>
          )}
          <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium opacity-75">
            {t("list.open")}
            <ArrowRight aria-hidden="true" className="size-4" />
          </p>
        </div>
      </div>

      {/* Raised above the stretched link so it stays clickable in its own
          right. This is where the PDF lives now — the filing confirmation
          hands over rather than carrying it. */}
      <div className="relative z-10 mt-4">
        <DownloadButton application={application} />
      </div>
    </div>
  );
}

/** Overdue first, then soonest deadline, then unfiled drafts by recency. */
function byUrgency(a: Application, b: Application): number {
  const clockA = a.filedAt
    ? computeClock({
        filedAt: a.filedAt,
        lifeOrLibertyFlag: a.lifeOrLibertyFlag,
        viaApio: a.viaApio,
        simulatedDaysElapsed: a.simulatedDaysElapsed,
      })
    : null;
  const clockB = b.filedAt
    ? computeClock({
        filedAt: b.filedAt,
        lifeOrLibertyFlag: b.lifeOrLibertyFlag,
        viaApio: b.viaApio,
        simulatedDaysElapsed: b.simulatedDaysElapsed,
      })
    : null;

  if (clockA && clockB) return clockA.msRemaining - clockB.msRemaining;
  if (clockA) return -1;
  if (clockB) return 1;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
