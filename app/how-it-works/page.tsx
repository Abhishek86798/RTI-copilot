import type { Metadata } from "next";
import { CheckCircle2, CircleDashed, FlaskConical } from "lucide-react";

import { Breadcrumbs, LastReviewed } from "@/components/breadcrumbs";

import { Section } from "@/components/section";
import { PageHeader, PageGrid } from "@/components/ui/page";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "What this can and cannot do",
  description:
    "What works, what is only pretending to work, and what is not built yet.",
};

/**
 * The honest page.
 *
 * Written for the citizen who is about to trust this with a pension number,
 * not for an engineer reading a status board. Everything here used to be
 * phrased as capabilities and integrations — "Automated Authority
 * Designation", "Cross-Session Data Persistence" — which is a way of sounding
 * official without telling anyone what actually happens to their application.
 */
type Row = { state: "live" | "mocked" | "planned"; what: string; detail: string };

const ROWS: Row[] = [
  {
    state: "live",
    what: "You write in your own words",
    detail:
      "No dropdowns to work through first. Describe what happened and we take it from there.",
  },
  {
    state: "live",
    what: "We find the office",
    detail:
      "What you wrote is matched against a list of real public authorities. We only ever name an office that is on that list.",
  },
  {
    state: "live",
    what: "We write the request",
    detail:
      "Your complaint becomes a request for documents, which is what an office has to answer. Your reference numbers and dates are carried across exactly as you typed them.",
  },
  {
    state: "live",
    what: "We spot urgent cases",
    detail:
      "Where someone's life or liberty is at stake, the law allows 48 hours instead of 30 days. We tell you when that may apply.",
  },
  {
    state: "live",
    what: "We tell you where to send it",
    detail:
      "Central and State authorities take requests in different places. Sending it to the wrong one means paying a fee for nothing.",
  },
  {
    state: "live",
    what: "We watch the dates",
    detail:
      "We work out when the reply is due — 30 days, 35 days, or 48 hours — and when your window to appeal opens and closes.",
  },
  {
    state: "live",
    what: "We draft the appeal too",
    detail:
      "If the deadline passes with no reply, the first appeal is written for you. It costs nothing to file.",
  },
  {
    state: "live",
    what: "You get a printable application",
    detail: "Laid out on A4 the way an information officer expects to receive it.",
  },
  {
    state: "live",
    what: "Your applications follow you",
    detail:
      "Sign in and they are kept for you, so they survive a cleared browser or a new phone. Without an account they stay on this device only.",
  },
  {
    state: "live",
    what: "We email you before a deadline",
    detail:
      "Once a day we check every filed application and write to you when the reply window is closing or has passed.",
  },
  {
    state: "mocked",
    what: "Nothing is actually filed",
    detail:
      "We prepare the application; you file it yourself. This prototype cannot submit anything to the official portal on your behalf.",
  },
  {
    state: "mocked",
    what: "The fee is not real",
    detail:
      "No money moves and no bank is involved. The registration number is generated here, not issued by the portal.",
  },
  {
    state: "mocked",
    what: "The list of offices is small",
    detail:
      "Thirty-six areas of government, chosen by hand. Ask about something outside them and we will say plainly that we are unsure rather than guess.",
  },
  {
    state: "mocked",
    what: "The clock can be fast-forwarded",
    detail:
      "On the prepared examples only, so you can see the appeal step without waiting a month. It is never available on something you filed yourself.",
  },
  {
    state: "mocked",
    what: "The examples have saved answers",
    detail:
      "If our server cannot be reached, the prepared examples fall back to an answer saved earlier, and the page says so.",
  },
  {
    state: "planned",
    what: "Going beyond the first appeal",
    detail:
      "If the first appeal fails you can go to the Information Commission. That step is not built yet — you would do it yourself.",
  },
];

const STATE_META = {
  live: {
    icon: CheckCircle2,
    label: "Works",
    className: "text-success",
  },
  mocked: {
    icon: FlaskConical,
    label: "Pretend",
    className: "text-warning",
  },
  planned: {
    icon: CircleDashed,
    label: "Not built yet",
    className: "text-muted-foreground",
  },
} as const;

export default function HowItWorksPage() {
  const groups = [
    { state: "live" as const, heading: "What really works" },
    { state: "mocked" as const, heading: "What is only pretending" },
    { state: "planned" as const, heading: "What is not built yet" },
  ];

  return (
    <div className={cn(PAGE_LAYOUT)}>
      <Breadcrumbs current="What this can and cannot do" />

      <PageHeader
        title="What this can and cannot do"
        lead="This is a prototype, so some of it is real and some of it is pretending. Here is which is which, before you rely on any of it."
      />

      {/*
        One column, full width.

        Two columns put each pair on a shared row, so a short card beside a
        long one left a hole the height of the difference — measured at 569px
        on how-it-works and 159px here. These are reference sections read top
        to bottom, not a dashboard, and one consistent card width reads more
        calmly than a ragged grid.
      */}
      <PageGrid columns={1}>
        {groups.map((group) => {
          const meta = STATE_META[group.state];
          return (
            <Section key={group.state} label={group.heading} icon={meta.icon}>
              <ul className="divide-y divide-border">
                {ROWS.filter((row) => row.state === group.state).map((row) => (
                  <li key={row.what} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-semibold">{row.what}</p>
                    <p className="mt-1 text-sm leading-prose text-muted-foreground">
                      {row.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </Section>
          );
        })}
      </PageGrid>

      <LastReviewed date="2026-08-23" />
    </div>
  );
}
