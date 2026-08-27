"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Gavel, Search } from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Marker, PageTitle } from "@/components/editorial";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { Section } from "@/components/section";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ux4g/alert";
import { Button } from "@/components/ux4g/button";
import { FieldError, FieldHint, Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { computeClock, formatDate } from "@/lib/client/deadlines";
import { deriveStatus } from "@/lib/client/store";
import { useI18n } from "@/lib/client/i18n";
import { useApplications, useHydrated } from "@/lib/client/use-applications";
import { cn } from "@/lib/utils";

/**
 * Submit First Appeal — a destination of its own, as it is on the real portal.
 *
 * There it is a top-level nav item beside Submit Request, because an appeal is
 * a separate act with its own thirty-day window, and someone coming back a
 * month later is not looking for the form they already filled in. Burying it
 * inside a tracking page meant it could only be reached by remembering which
 * application it belonged to.
 *
 * The real form asks for the registration number and the email on it, then
 * populates everything else. This one accepts the registration number the same
 * way, and also lists the applications it already knows are eligible — the
 * portal issued those numbers, so making someone retype one it can look up
 * would be theatre.
 */
export default function AppealPage() {
  const { t } = useI18n();
  const router = useRouter();
  const hydrated = useHydrated();
  const applications = useApplications();
  const [lookup, setLookup] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filed = applications.filter((application) => application.filedAt);

  /** Overdue, and inside the Section 19(1) window. */
  const eligible = filed.filter((application) => {
    if (application.appeal?.filedAt) return false;
    const clock = computeClock({
      filedAt: application.filedAt!,
      lifeOrLibertyFlag: application.lifeOrLibertyFlag,
      viaApio: application.viaApio,
      simulatedDaysElapsed: application.simulatedDaysElapsed,
    });
    return clock.isOverdue;
  });

  function handleLookup(event: React.FormEvent) {
    event.preventDefault();
    const query = lookup.trim().toUpperCase();
    const match = filed.find(
      (application) => application.registrationNumber?.toUpperCase() === query
    );
    if (!match) {
      setError(t("appealPage.notFound"));
      return;
    }
    router.push(`/applications/${match.id}/appeal`);
  }

  return (
    <div className={cn(PAGE_LAYOUT)}>
      <Breadcrumbs current={t("nav.appeal")} />

      <PageTitle
        marker={<Marker label={t("nav.appeal")} />}
        lead={t("appealPage.lead")}
      >
        {t("nav.appeal")}
      </PageTitle>

      <Section first label={t("appealPage.lookupSection")} icon={Search}>
        <form onSubmit={handleLookup} className="max-w-md space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="appeal-lookup">{t("appealPage.regNumber")}</Label>
            <Input
              id="appeal-lookup"
              value={lookup}
              onChange={(event) => {
                setLookup(event.target.value);
                setError(null);
              }}
              placeholder="DOPPW/R/E/26/00000"
              aria-invalid={error ? true : undefined}
              aria-describedby="appeal-lookup-hint"
              className="font-mono"
            />
            <FieldHint id="appeal-lookup-hint">{t("appealPage.regNumberHelp")}</FieldHint>
            {error && <FieldError>{error}</FieldError>}
          </div>
          <Button type="submit" size="xl" variant="cta">
            {t("appealPage.find")}
            <ArrowRight aria-hidden="true" />
          </Button>
        </form>
      </Section>

      <Section label={t("appealPage.eligibleSection")} icon={Gavel}>
        {!hydrated ? (
          <p className="opacity-75">{t("common.loading")}</p>
        ) : eligible.length === 0 ? (
          <Alert>
            <Gavel aria-hidden="true" />
            <AlertTitle>{t("appealPage.noneTitle")}</AlertTitle>
            <AlertDescription>
              {filed.length === 0
                ? t("appealPage.noneFiled")
                : t("appealPage.noneEligible")}
            </AlertDescription>
          </Alert>
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {eligible.map((application) => {
              const clock = computeClock({
                filedAt: application.filedAt!,
                lifeOrLibertyFlag: application.lifeOrLibertyFlag,
                viaApio: application.viaApio,
                simulatedDaysElapsed: application.simulatedDaysElapsed,
              });
              return (
                <li key={application.id} className="py-6">
                  <Link
                    href={`/applications/${application.id}/appeal`}
                    className="group block underline-offset-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="text-base font-semibold group-hover:underline">
                        {application.authority.authorityName}
                      </p>
                      <StatusBadge status={deriveStatus(application)} />
                    </div>
                    {application.registrationNumber && (
                      <p className="mt-1.5 font-mono text-sm opacity-75">
                        {application.registrationNumber}
                      </p>
                    )}
                    <p className="mt-2 text-sm leading-relaxed opacity-75">
                      {t("appealPage.dueSince", {
                        date: formatDate(clock.responseDeadline),
                        days: Math.max(
                          0,
                          Math.ceil(
                            (clock.appealDeadline.getTime() -
                              clock.effectiveNow.getTime()) /
                              (24 * 60 * 60 * 1000)
                          )
                        ),
                      })}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section label={t("appealPage.aboutSection")} icon={Gavel}>
        <div className="prose-measure space-y-6 leading-relaxed opacity-75">
          <p>{t("appealPage.about1")}</p>
          <p>{t("appealPage.about2")}</p>
        </div>
      </Section>
    </div>
  );
}
