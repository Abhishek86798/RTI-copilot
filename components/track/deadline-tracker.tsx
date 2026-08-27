"use client";

import { CalendarClock, FastForward, FlaskConical, Gavel, RotateCcw, Siren } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ux4g/alert";
import { Button } from "@/components/ux4g/button";
import { Marker, Rule } from "@/components/editorial";
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
import { cn } from "@/lib/utils";

/**
 * Step 5. The half of the pitch that happens after "submit".
 *
 * The statutory clock is the thing the official portal never shows you. It
 * gives you a registration number and then goes quiet, and thirty days later
 * nobody tells you that a deemed refusal has occurred and a thirty-day appeal
 * window has started running against you.
 *
 * So the remaining time is the largest thing on the screen — the one number
 * this page exists to deliver. Every date here is computed in
 * `lib/client/deadlines.ts` from the clause it comes from, and the rule being
 * applied is named on screen so the citizen can check it rather than trust it.
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
    <section aria-labelledby="track-heading">
      <Rule />

      <div className="pt-8">
        <Marker label={t("track.title")} />
        <h2 id="track-heading" className="sr-only">
          {t("track.title")}
        </h2>
      </div>

      {application.lifeOrLibertyFlag && (
        <Alert className="mt-6 border-destructive/40 bg-destructive/6">
          <Siren aria-hidden="true" className="text-destructive" />
          <AlertTitle>48-hour window claimed under Section 7(1)</AlertTitle>
          <AlertDescription>
            This application asserts the life-or-liberty proviso, so the deadline
            below is 48 hours rather than 30 days.
          </AlertDescription>
        </Alert>
      )}

      {/*
        The countdown, as text first and at display size. The bar underneath is
        aria-hidden — a screen reader gets "6 days left", not a percentage.
      */}
      <div className="mt-6">
        <p className="font-mono text-[0.68rem] tracking-[0.14em] uppercase opacity-75">
          {t("track.remaining")}
        </p>
        <p
          className={cn(
            "mt-3 text-[2rem] leading-[1] font-bold tracking-[-0.03em] tabular-nums sm:text-[2.5rem]",
            clock.isOverdue && "text-destructive"
          )}
        >
          {remainingLabel(describeRemaining(clock))}
        </p>
        <Progress value={clock.elapsedFraction * 100} tone={tone} className="mt-5" />
      </div>

      <dl className="mt-8 grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-y-0">
        <Fact label={t("track.filedOn")}>{formatDate(clock.filedAt)}</Fact>
        <Fact label={t("track.deadline")} divided>
          {formatDate(clock.responseDeadline)}
        </Fact>
        <Fact label={t("track.appealBy")} divided>
          {formatDate(clock.appealDeadline)}
        </Fact>
      </dl>

      <p className="mt-6 flex items-start gap-2 border-l-2 border-border pl-4 text-sm leading-relaxed">
        <CalendarClock aria-hidden="true" className="mt-0.5 size-4 shrink-0 opacity-75" />
        <span>
          <span className="font-medium">{t("track.basis")}:</span>{" "}
          <span className="opacity-75">{t(basisKey(clock.basis))}</span>
        </span>
      </p>

      {!clock.isOverdue && (
        <div className="mt-6">
          <Button type="button" variant="outline" size="lg" onClick={onLogResponse}>
            {t("track.gotReply")}
          </Button>
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* FR-14 demo control                                             */}
      {/* -------------------------------------------------------------- */}
      {canSimulate(application) && (
        <div className="mt-10 border border-warning/40 bg-warning/6 p-5">
          <Marker
            label="Demo control"
            dim={false}
            className="text-warning"
          />
          <p className="mt-3 max-w-[58ch] text-sm leading-relaxed opacity-75">
            {t("track.simulateHelp")}
          </p>
          {application.simulatedDaysElapsed ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium">
                {t("track.simulateOn", { days: application.simulatedDaysElapsed })}
              </p>
              <Button type="button" variant="outline" size="lg" onClick={onResetSimulation}>
                <RotateCcw aria-hidden="true" />
                {t("track.simulateReset")}
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <Button type="button" variant="outline" size="lg" onClick={onSimulate}>
                <FastForward aria-hidden="true" />
                {t("track.simulate")}
              </Button>
            </div>
          )}
          <p className="mt-4 flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.14em] uppercase opacity-75">
            <FlaskConical aria-hidden="true" className="size-3.5" />
            Simulated
          </p>
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Deadline lapsed                                                */}
      {/* -------------------------------------------------------------- */}
      {clock.isOverdue && !application.appeal?.filedAt && (
        <Alert className="mt-8 border-destructive/40 bg-destructive/6">
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
    </section>
  );
}

function Fact({
  label,
  children,
  divided = false,
}: {
  label: string;
  children: React.ReactNode;
  divided?: boolean;
}) {
  return (
    <div className={cn("py-5", divided && "sm:border-l sm:border-border sm:pl-8")}>
      <dt className="font-mono text-[0.68rem] tracking-[0.14em] uppercase opacity-75">
        {label}
      </dt>
      <dd className="mt-1.5 text-base font-semibold tabular-nums">{children}</dd>
    </div>
  );
}
