"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, Plus } from "lucide-react";

import { MigratePrompt } from "@/components/migrate-prompt";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ux4g/button";
import { Card, CardContent } from "@/components/ux4g/card";
import { computeClock, describeRemaining, formatDate } from "@/lib/client/deadlines";
import { listApplications as listGuestApplications } from "@/lib/client/guest-storage";
import { deriveStatus, getStoreMode, type Application } from "@/lib/client/store";
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
 */
export default function ApplicationsPage() {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const applications = useApplications();

  const sorted = [...applications].sort(byUrgency);

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      {getStoreMode() === "account" && (
        <MigratePrompt count={listGuestApplications().length} />
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("list.title")}
        </h1>
        <Button size="xl" variant="cta" nativeButton={false} render={
          <Link href="/apply">
            <Plus aria-hidden="true" />
            {t("nav.new")}
          </Link>
        } />
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t("list.empty")}</p>
            <Button
              size="xl"
              variant="cta"
              className="mt-5"
              nativeButton={false}
              render={<Link href="/apply">{t("list.emptyCta")}</Link>}
            />
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {sorted.map((application) => (
            <li key={application.id}>
              <ApplicationRow application={application} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-sm text-muted-foreground">{t("list.stored")}</p>
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
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-info hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-base font-semibold">
          {application.authority.authorityName}
        </p>
        <StatusBadge status={status} />
      </div>

      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {application.grievance}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {clock ? (
          <span
            className={
              clock.isOverdue
                ? "inline-flex items-center gap-1.5 font-semibold text-destructive"
                : "inline-flex items-center gap-1.5 text-muted-foreground"
            }
          >
            {clock.isOverdue ? (
              <AlertTriangle aria-hidden="true" className="size-4" />
            ) : (
              <Clock aria-hidden="true" className="size-4" />
            )}
            {remainingLabel(describeRemaining(clock))}
          </span>
        ) : (
          <span className="text-muted-foreground">
            {t("list.started", { date: formatDate(application.createdAt) })}
          </span>
        )}
        {application.isDemo && (
          <span className="rounded-md bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
            {t("list.example")}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 font-medium text-info">
          {t("list.open")}
          <ArrowRight aria-hidden="true" className="size-4" />
        </span>
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
