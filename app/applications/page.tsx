"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, Plus } from "lucide-react";

import { MigratePrompt } from "@/components/migrate-prompt";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ux4g/button";
import { computeClock, describeRemaining, formatDate } from "@/lib/client/deadlines";
import { listApplications as listGuestApplications } from "@/lib/client/guest-storage";
import { deriveStatus, getStoreMode, type Application } from "@/lib/client/store";
import { Marker, PAGE_LAYOUT, PageTitle } from "@/components/editorial";
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

      <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
        <p className="max-w-[46ch] text-base opacity-75">{t("list.stored")}</p>
        <Button
          size="xl"
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
        <div className="mt-14 border-t border-border py-24 text-center">
          <p className="text-lg opacity-75">{t("list.empty")}</p>
          <Button
            size="xl"
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
        <ul className="mt-14 border-b border-border">
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
    <Link
      href={`/applications/${application.id}`}
      className="group block py-7 transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-4">
            <StatusBadge status={status} />
            {application.isDemo && (
              <span className="rounded-md bg-card px-2 py-0.5 font-mono text-[0.68rem] tracking-[0.14em] text-warning uppercase ring-1 ring-warning/35">
                {t("list.example")}
              </span>
            )}
          </div>

          <p className="mt-5 max-w-[34ch] text-xl leading-snug font-semibold tracking-[-0.01em]">
            {application.authority.authorityName}
          </p>
          <p className="mt-4 line-clamp-2 max-w-[58ch] text-base leading-loose opacity-75">
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
                  "text-[1.6rem] leading-[1] font-bold tracking-[-0.03em] tabular-nums",
                  clock.isOverdue && "text-destructive"
                )}
              >
                {remainingLabel(describeRemaining(clock))}
              </p>
              <p className="mt-2 flex items-center gap-1.5 font-mono text-[0.68rem] tracking-[0.14em] uppercase opacity-75 sm:justify-end">
                {clock.isOverdue ? (
                  <AlertTriangle aria-hidden="true" className="size-3.5" />
                ) : (
                  <Clock aria-hidden="true" className="size-3.5" />
                )}
                {formatDate(clock.responseDeadline)}
              </p>
            </>
          ) : (
            <p className="font-mono text-[0.68rem] tracking-[0.14em] uppercase opacity-75">
              {t("list.started", { date: formatDate(application.createdAt) })}
            </p>
          )}
          <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 group-hover:underline">
            {t("list.open")}
            <ArrowRight aria-hidden="true" className="size-4" />
          </p>
        </div>
      </div>
    </Link>
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
