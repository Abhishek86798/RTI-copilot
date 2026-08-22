"use client";

import { CalendarClock, FastForward, FlaskConical, Gavel, RotateCcw, Siren } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  basisKey,
  computeClock,
  describeRemaining,
  formatDate,
} from "@/lib/client/deadlines";
import { canSimulate, type Application } from "@/lib/client/guest-storage";
import { useI18n } from "@/lib/client/i18n";
import { useRemainingLabel } from "@/lib/client/use-remaining-label";

/**
 * Step 5. The half of the pitch that happens after "submit".
 *
 * The statutory clock is the thing the official portal never shows you. It
 * gives you a registration number and then goes quiet, and thirty days later
 * nobody tells you that a deemed refusal has occurred and a thirty-day appeal
 * window has started running against you.
 *
 * Every date here is computed in `lib/client/deadlines.ts` from the clause it
 * comes from, and the rule being applied is named on screen so the citizen can
 * check it rather than trust it.
 */
export function DeadlineTracker({
  application,
  onSimulate,
  onResetSimulation,
  onLogResponse,
}: {
  application: Application;
  onSimulate: () => void;
  onResetSimulation: () => void;
  onLogResponse: () => void;
}) {
  const { t } = useI18n();
  const remainingLabel = useRemainingLabel();

  if (!application.filedAt) return null;

  const clock = computeClock({
    filedAt: application.filedAt,
    lifeOrLibertyFlag: application.lifeOrLibertyFlag,
    viaApio: application.viaApio,
    simulatedDaysElapsed: application.simulatedDaysElapsed,
  });

  const tone = clock.isOverdue
    ? "danger"
    : clock.elapsedFraction > 0.75
      ? "warning"
      : "good";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-xl">{t("track.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {application.lifeOrLibertyFlag && (
            <Alert className="border-destructive/40 bg-destructive/6">
              <Siren aria-hidden="true" className="text-destructive" />
              <AlertTitle>48-hour window claimed under Section 7(1)</AlertTitle>
              <AlertDescription>
                This application asserts the life-or-liberty proviso, so the
                deadline below is 48 hours rather than 30 days.
              </AlertDescription>
            </Alert>
          )}

          {/*
            The countdown, as text first. The bar underneath is aria-hidden —
            a screen reader gets "6 days left", not a percentage.
          */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                {t("track.remaining")}
              </p>
              <p
                className={
                  clock.isOverdue
                    ? "text-2xl font-bold text-destructive"
                    : "text-2xl font-bold"
                }
              >
                {remainingLabel(describeRemaining(clock))}
              </p>
            </div>
            <Progress value={clock.elapsedFraction * 100} tone={tone} className="mt-2" />
          </div>

          <dl className="grid gap-4 sm:grid-cols-3">
            <Fact label={t("track.filedOn")}>{formatDate(clock.filedAt)}</Fact>
            <Fact label={t("track.deadline")}>{formatDate(clock.responseDeadline)}</Fact>
            <Fact label={t("track.appealBy")}>{formatDate(clock.appealDeadline)}</Fact>
          </dl>

          <p className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            <CalendarClock aria-hidden="true" className="size-4 shrink-0" />
            <span>
              <span className="font-medium text-foreground">{t("track.basis")}:</span>{" "}
              {t(basisKey(clock.basis))}
            </span>
          </p>

          {application.registrationNumber && (
            <p className="text-sm">
              <span className="font-medium">Registration number: </span>
              <span className="font-mono">{application.registrationNumber}</span>
            </p>
          )}

          {!clock.isOverdue && (
            <Button type="button" variant="outline" size="xl" onClick={onLogResponse}>
              {t("track.gotReply")}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------- */}
      {/* FR-14 demo control                                             */}
      {/* -------------------------------------------------------------- */}
      {canSimulate(application) && (
        <Card className="border-warning/40 bg-warning/6 ring-warning/25">
          <CardContent className="space-y-3 pt-2">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <FlaskConical aria-hidden="true" className="size-4 text-warning" />
              Demo control
            </p>
            <p className="text-sm text-muted-foreground">{t("track.simulateHelp")}</p>
            {application.simulatedDaysElapsed ? (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {t("track.simulateOn", { days: application.simulatedDaysElapsed })}
                </p>
                <Button type="button" variant="outline" size="lg" onClick={onResetSimulation}>
                  <RotateCcw aria-hidden="true" />
                  {t("track.simulateReset")}
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="xl" onClick={onSimulate}>
                <FastForward aria-hidden="true" />
                {t("track.simulate")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Deadline lapsed                                                */}
      {/* -------------------------------------------------------------- */}
      {clock.isOverdue && !application.appeal?.filedAt && (
        <Alert className="border-destructive/40 bg-destructive/6">
          <Gavel aria-hidden="true" className="text-destructive" />
          <AlertTitle>{t("track.overdueTitle")}</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{t("track.overdueBody")}</p>
            {clock.appealWindowClosed ? (
              <p className="font-medium text-foreground">{t("track.appealClosed")}</p>
            ) : (
              <p className="font-medium text-foreground">
                {t("track.appealDeadlineWarn", {
                  days: Math.max(
                    0,
                    Math.ceil(
                      (clock.appealDeadline.getTime() - clock.effectiveNow.getTime()) /
                        (24 * 60 * 60 * 1000)
                    )
                  ),
                })}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold">{children}</dd>
    </div>
  );
}
