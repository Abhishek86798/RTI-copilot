"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Gavel } from "lucide-react";

import { ApplicationHeader } from "@/components/track/application-header";
import { DeadlineTracker } from "@/components/track/deadline-tracker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { computeClock, formatDate } from "@/lib/client/deadlines";
import { updateApplication } from "@/lib/client/store";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/client/i18n";
import { useApplication, useHydrated } from "@/lib/client/use-applications";

/**
 * Step 5 — View Status.
 *
 * The real portal keeps this behind its own nav item, and for the same reason
 * it deserves one here: an applicant checking on a request filed a month ago
 * is not the same person as one filling in a form, and should not have to
 * scroll past a completed form to find out where it got to.
 *
 * When the deadline lapses this page does not draft anything. It says the
 * window has opened and links to the appeal, which has a process of its own —
 * a legal document that appears unbidden underneath a countdown is easy to
 * submit without reading.
 */
export default function TrackApplicationPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const application = useApplication(params.id);

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
        <Link href="/applications"
            className={cn(buttonVariants({ variant: "cta", size: "lg" }), "mt-6")}
          >{t("nav.mine")}</Link>
      </div>
    );
  }

  /* Not filed yet: there is nothing to track, so send them to file it. */
  if (!application.filedAt) {
    return (
      <div className={cn(PAGE_LAYOUT)}>
        <ApplicationHeader
          application={application}
          stageKey="steps.track"
          backHref="/applications"
          backLabelKey="nav.mine"
        />
        <div className="mt-10 border-t border-border pt-8">
          <p className="max-w-[58ch] leading-relaxed opacity-75">
            {t("track.notFiledYet")}
          </p>
          <Link href={`/applications/${application.id}`}
            className={cn(buttonVariants({ variant: "cta", size: "lg" }), "mt-6")}
          >{t("track.goFile")}</Link>
        </div>
      </div>
    );
  }

  const clock = computeClock({
    filedAt: application.filedAt,
    lifeOrLibertyFlag: application.lifeOrLibertyFlag,
    viaApio: application.viaApio,
    simulatedDaysElapsed: application.simulatedDaysElapsed,
  });

  const appealFiled = Boolean(application.appeal?.filedAt);

  return (
    <div className={cn(PAGE_LAYOUT)}>
      <ApplicationHeader
        application={application}
        stageKey="steps.track"
        backHref="/applications"
        backLabelKey="nav.mine"
      />

      <div className="mt-10 space-y-10">
        <DeadlineTracker
          application={application}
          onSimulate={() =>
            updateApplication(application.id, { simulatedDaysElapsed: 31 })
          }
          onResetSimulation={() =>
            updateApplication(application.id, {
              simulatedDaysElapsed: undefined,
              // Resetting the clock has to withdraw the appeal too, or the
              // application sits at "appealed" against a deadline that has
              // not passed.
              appeal: undefined,
              status: "filed",
            })
          }
          onLogResponse={() =>
            updateApplication(application.id, {
              status: "resolved",
              responseLoggedAt: new Date().toISOString(),
            })
          }
        />

        {/* Deadline lapsed: point at the appeal, do not draft it here. */}
        {clock.isOverdue && !appealFiled && (
          <section aria-labelledby="appeal-available">
            <Alert className="border-warning/40 bg-warning/8">
              <Gavel aria-hidden="true" className="text-warning" />
              <AlertTitle id="appeal-available">{t("track.overdueTitle")}</AlertTitle>
              <AlertDescription className="space-y-4">
                <p>{t("track.overdueBody")}</p>
                {clock.appealWindowClosed ? (
                  <p className="font-medium text-foreground">
                    {t("track.appealClosed")}
                  </p>
                ) : (
                  <p className="font-medium text-foreground">
                    {t("track.appealDeadlineWarn", {
                      days: Math.max(
                        0,
                        Math.ceil(
                          (clock.appealDeadline.getTime() -
                            clock.effectiveNow.getTime()) /
                            (24 * 60 * 60 * 1000)
                        ),
                      ),
                    })}
                  </p>
                )}
                <Link href={`/applications/${application.id}/appeal`}
            className={buttonVariants({ variant: "cta", size: "lg" })}
          >
                      {t("appeal.submit")}
                    </Link>
              </AlertDescription>
            </Alert>
          </section>
        )}

        {appealFiled && (
          <section aria-labelledby="appeal-filed">
            <Alert className="border-success/40 bg-success/8">
              <Gavel aria-hidden="true" className="text-success" />
              <AlertTitle id="appeal-filed">
                {t("appeal.submitted", {
                  date: formatDate(application.appeal!.filedAt!),
                })}
              </AlertTitle>
              <AlertDescription className="space-y-4">
                <p>{t("appeal.submittedHelp")}</p>
                <Link href={`/applications/${application.id}/appeal`}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
                      {t("appeal.view")}
                    </Link>
              </AlertDescription>
            </Alert>
          </section>
        )}
      </div>
    </div>
  );
}
