"use client";

import { useEffect, useMemo, useState } from "react";
import { scrollPageToTop } from "@/components/smooth-scroll";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Gavel, Printer } from "lucide-react";

import { ApplicationHeader } from "@/components/track/application-header";
import { AppealSheet } from "@/components/track/application-sheet";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button, buttonVariants } from "@/components/ui/button";
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
        <p className="mx-auto mt-3 max-w-[52ch] opacity-75">
          {t("track.missingBody")}
        </p>
        <Link href="/applications"
            className={cn(buttonVariants({ variant: "cta", size: "lg" }), "mt-6")}
          >{t("nav.mine")}</Link>
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
        <div className="mt-10 border-t border-border pt-8">
          <p className="max-w-[58ch] opacity-75">
            {t("appeal.notYet")}
          </p>
          <Link href={`/applications/${application.id}/track`}
            className={cn(buttonVariants({ variant: "cta", size: "lg" }), "mt-6")}
          >
                {t("track.viewStatus")}
              </Link>
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
        <Panel className="mt-4" labelledBy="appeal-ack">
          <PanelHeader
            id="appeal-ack"
            title={
              <span className="flex items-center gap-2">
                <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-success" />
                {t("appeal.submitted", { date: formatDate(submitted) })}
              </span>
            }
            description={t("appeal.submittedHelp")}
          />
          <PanelBody className="space-y-4">
            {/*
              The letter at document size, in a capped scroller.

              It was set at page size and ran the full height of the screen —
              a two-page legal document rendered as if it were the page itself.
              Nothing about reading it back needs 16px type.
            */}
            <pre
              tabIndex={0}
              aria-label={t("appeal.grounds")}
              className="max-h-[24rem] overflow-y-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap"
            >
              {text}
            </pre>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/applications/${application.id}/track`}
                className={buttonVariants({ variant: "cta", size: "lg" })}
              >
                {t("track.viewStatus")}
              </Link>
              <Button type="button" size="lg" variant="outline" onClick={() => setPrinting(true)}>
                <Printer aria-hidden="true" />
                {t("common.print")}
              </Button>
            </div>
          </PanelBody>
        </Panel>
      ) : (
        <div className="mt-4 space-y-4">
          <Panel labelledBy="appeal-grounds">
            <PanelHeader
              id="appeal-grounds"
              title={
                <span className="flex items-center gap-2">
                  <Gavel aria-hidden="true" className="size-4 shrink-0 text-warning" />
                  {t("nav.appeal")}
                </span>
              }
              description={t("track.appealHelp")}
            />
            <PanelBody className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="appeal-text">{t("appeal.grounds")}</Label>
                <Textarea
                  id="appeal-text"
                  value={text}
                  onChange={(event) => setGrounds(event.target.value)}
                  rows={12}
                  className="min-h-48 max-h-[22rem] font-mono text-xs"
                />
                <FieldHint>{t("appeal.groundsHelp")}</FieldHint>
              </div>

              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                <span className="font-medium">
                  {t("file.fee")}: {t("submit.feeNil")}
                </span>{" "}
                <span className="text-muted-foreground">{t("appeal.noFee")}</span>
              </p>
            </PanelBody>
          </Panel>

          <Panel labelledBy="appeal-confirm">
            <PanelHeader
              id="appeal-confirm"
              title={t("appeal.confirmTitle")}
              description={
                <span id="appeal-mandatory" className="text-destructive">
                  {t("submit.mandatory")}
                </span>
              }
            />
            <PanelBody className="space-y-4">
              {/*
                The one declaration this act needs. Filing had the citizenship
                declaration; an appeal has this — that the appellant has read
                what is about to be sent in their name.
              */}
              <CheckboxField
                id="appeal-confirm-read"
                aria-required="true"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                label={t("appeal.confirmLabel")}
                hint={t("appeal.confirmHelp")}
              />

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  size="lg"
                  variant="cta"
                  disabled={!confirmed}
                  /* Same rule as the filing steps: the requirement is stated
                     once, at the top, and the disabled action points at it. */
                  aria-describedby={!confirmed ? "appeal-mandatory" : undefined}
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
                <Button type="button" size="lg" variant="outline" onClick={() => setPrinting(true)}>
                  <Printer aria-hidden="true" />
                  {t("common.print")}
                </Button>
              </div>
            </PanelBody>
          </Panel>
        </div>
      )}

      {printing && <AppealSheet text={text} />}
    </div>
  );
}
