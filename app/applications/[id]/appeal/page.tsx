"use client";

import { useEffect, useMemo, useState } from "react";
import { scrollPageToTop } from "@/components/smooth-scroll";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Gavel, Printer } from "lucide-react";

import { Marker, Rule } from "@/components/editorial";
import { ApplicationHeader } from "@/components/track/application-header";
import { AppealSheet } from "@/components/track/application-sheet";
import { Alert, AlertTitle } from "@/components/ux4g/alert";
import { Button } from "@/components/ux4g/button";
import { CheckboxField } from "@/components/ui/checkbox";
import { FieldHint, Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { computeClock, formatDate } from "@/lib/client/deadlines";
import { buildFirstAppeal } from "@/lib/client/filing";
import { updateApplication } from "@/lib/client/store";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/client/i18n";
import { useApplication, useHydrated } from "@/lib/client/use-applications";

/**
 * Submit First Appeal — its own process, the way filing is.
 *
 * The appeal used to draft itself the moment a deadline lapsed and appear,
 * pre-written and ready to send, at the bottom of the tracking page. That was
 * the wrong shape twice over. A legal document that materialises unbidden
 * under a countdown is easy to submit without reading, and the appeal is a
 * separate act under Section 19(1) with its own grounds, its own window and
 * its own acknowledgement — not a footnote to the request it follows.
 *
 * So it works like the filing does: the portal composes a starting draft, the
 * appellant reads and edits it, declares the ground, and submits. Nothing is
 * written to the record until they do.
 */
export default function SubmitAppealPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const application = useApplication(params.id);

  const [grounds, setGrounds] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [printing, setPrinting] = useState(false);

  const clock = application?.filedAt
    ? computeClock({
        filedAt: application.filedAt,
        lifeOrLibertyFlag: application.lifeOrLibertyFlag,
        viaApio: application.viaApio,
        simulatedDaysElapsed: application.simulatedDaysElapsed,
      })
    : null;

  /*
   * Composed for editing, not persisted. The appeal only becomes part of the
   * record when it is submitted — an unsent draft sitting in storage would
   * show up as an appeal that was never made.
   */
  const composed = useMemo(() => {
    if (!application || !clock) return "";
    return buildFirstAppeal({
      applicantName: application.applicant.fullName,
      applicantAddress: application.applicant.address,
      authority: application.authority,
      registrationNumber: application.registrationNumber,
      filedAtLabel: formatDate(clock.filedAt),
      responseDeadlineLabel: formatDate(clock.responseDeadline),
      items: application.items,
      grounds: "deemed-refusal",
    });
  }, [application, clock]);

  useEffect(() => {
    if (!printing) return;
    const frame = requestAnimationFrame(() => {
      window.print();
      setPrinting(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [printing]);

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
        <Button
          size="xl"
          variant="cta"
          className="mt-6"
          nativeButton={false}
          render={<Link href="/applications">{t("nav.mine")}</Link>}
        />
      </div>
    );
  }

  const submitted = application.appeal?.filedAt;
  const text = submitted ? application.appeal!.text : (grounds ?? composed);

  /* Not yet eligible: the request has not passed its reply deadline. */
  if (!submitted && !clock?.isOverdue) {
    return (
      <div className={cn(PAGE_LAYOUT)}>
        <ApplicationHeader
          application={application}
          stageKey="nav.appeal"
          backHref={`/applications/${application.id}/track`}
          backLabelKey="track.backToStatus"
        />
        <div className="mt-16 border-t border-border pt-8">
          <p className="max-w-[58ch] leading-relaxed opacity-75">
            {t("appeal.notYet")}
          </p>
          <Button
            size="xl"
            variant="cta"
            className="mt-6"
            nativeButton={false}
            render={
              <Link href={`/applications/${application.id}/track`}>
                {t("track.viewStatus")}
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(PAGE_LAYOUT)}>
      <ApplicationHeader
        application={application}
        stageKey="nav.appeal"
        backHref={`/applications/${application.id}/track`}
        backLabelKey="track.backToStatus"
      />

      {submitted ? (
        <section className="mt-16" aria-labelledby="appeal-ack">
          <Rule />
          <div className="pt-8">
            <Marker label={t("appeal.acknowledgement")} />
            <h2
              id="appeal-ack"
              className="mt-4 flex items-center gap-3 text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] sm:text-[1.9rem]"
            >
              <CheckCircle2 aria-hidden="true" className="size-7 shrink-0 text-success" />
              {t("appeal.submitted", { date: formatDate(submitted) })}
            </h2>
            <p className="mt-4 max-w-[58ch] leading-relaxed opacity-75">
              {t("appeal.submittedHelp")}
            </p>
          </div>

          <pre className="mt-8 border-l-2 border-border py-2 pl-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {text}
          </pre>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="xl"
              variant="cta"
              nativeButton={false}
              render={
                <Link href={`/applications/${application.id}/track`}>
                  {t("track.viewStatus")}
                </Link>
              }
            />
            <Button type="button" size="xl" variant="outline" onClick={() => setPrinting(true)}>
              <Printer aria-hidden="true" />
              {t("common.print")}
            </Button>
          </div>
        </section>
      ) : (
        <>
          <section className="mt-16" aria-labelledby="appeal-grounds">
            <Rule />
            <div className="pt-8">
              <Marker label={t("appeal.section.grounds")} />
              <h2
                id="appeal-grounds"
                className="mt-4 flex items-center gap-3 text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] sm:text-[1.9rem]"
              >
                <Gavel aria-hidden="true" className="size-6 shrink-0 text-warning" />
                {t("nav.appeal")}
              </h2>
              <p className="mt-4 max-w-[58ch] leading-relaxed opacity-75">
                {t("track.appealHelp")}
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <Marker label={t("appeal.against")} />
                <p className="mt-3 font-mono text-base">
                  {application.registrationNumber ?? "—"}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="appeal-text">{t("appeal.grounds")}</Label>
                <Textarea
                  id="appeal-text"
                  value={text}
                  onChange={(event) => setGrounds(event.target.value)}
                  rows={18}
                  className="min-h-96 font-mono text-sm leading-relaxed"
                />
                <FieldHint>{t("appeal.groundsHelp")}</FieldHint>
              </div>

              <p className="border-l-2 border-border py-1 pl-4 text-sm leading-relaxed">
                <span className="font-semibold">
                  {t("file.fee")}: {t("submit.feeNil")}
                </span>{" "}
                <span className="opacity-75">{t("appeal.noFee")}</span>
              </p>
            </div>
          </section>

          <section className="mt-16" aria-labelledby="appeal-confirm">
            <Rule />
            <div className="pt-8">
              <Marker label={t("appeal.section.confirm")} />
              <h2
                id="appeal-confirm"
                className="mt-4 text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] sm:text-[1.9rem]"
              >
                {t("appeal.confirmTitle")}
              </h2>
            </div>

            <div className="mt-8 space-y-6">
              {/*
                The one declaration this act needs. Filing had the citizenship
                declaration; an appeal has this — that the appellant has read
                what is about to be sent in their name.
              */}
              <CheckboxField
                id="appeal-confirm-read"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                label={t("appeal.confirmLabel")}
                hint={t("appeal.confirmHelp")}
              />

              {!confirmed && (
                <Alert role="note">
                  <Gavel aria-hidden="true" />
                  <AlertTitle>{t("appeal.confirmRequired")}</AlertTitle>
                </Alert>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  size="xl"
                  variant="cta"
                  disabled={!confirmed}
                  onClick={() => {
                    updateApplication(application.id, {
                      status: "appealed",
                      appeal: {
                        draftedAt: new Date().toISOString(),
                        grounds: "deemed-refusal",
                        text,
                        filedAt: new Date().toISOString(),
                      },
                    });
                    scrollPageToTop();
                  }}
                >
                  {t("appeal.submit")}
                </Button>
                <Button
                  type="button"
                  size="xl"
                  variant="outline"
                  onClick={() => setPrinting(true)}
                >
                  <Printer aria-hidden="true" />
                  {t("common.print")}
                </Button>
              </div>
            </div>
          </section>
        </>
      )}

      {printing && <AppealSheet text={text} />}
    </div>
  );
}
