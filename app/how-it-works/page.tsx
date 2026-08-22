import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleDashed, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How this works, and what is mocked",
  description:
    "What RTI Copilot really does, which parts are live, which are simulated, and where the limits are.",
};

/**
 * The honesty page.
 *
 * A prototype that hides its seams is worth less than one that names them —
 * a reviewer cannot judge what they cannot see, and a citizen deciding whether
 * to trust a legal draft deserves to know which parts of it a machine wrote.
 * Everything below is stated plainly, including the parts that make the
 * product look less finished than a demo video would.
 */

type Row = { state: "live" | "mocked" | "planned"; what: string; detail: string };

const ROWS: Row[] = [
  {
    state: "live",
    what: "Plain-language intake",
    detail:
      "You type freely. There are no dropdowns to navigate and no department to identify first.",
  },
  {
    state: "live",
    what: "Authority routing",
    detail:
      "A keyword pre-filter narrows our directory, then a language model ranks the shortlist. The model can only return an authority ID that already exists in our data, so it cannot invent an office. Confidence is shown as a word, never a percentage.",
  },
  {
    state: "live",
    what: "Legal rewrite",
    detail:
      "A language model converts the grievance into itemized requests for records, strips interrogatives, and copies your dates and reference numbers through verbatim.",
  },
  {
    state: "live",
    what: "Section 7(1) urgency detection",
    detail:
      "The same call flags genuine life-or-liberty cases against the narrow test the Information Commission applies, and you can withdraw the claim if it does not fit.",
  },
  {
    state: "live",
    what: "Filing-channel guidance",
    detail:
      "Derived from whether the authority is Central or State, including the warning that the central portal keeps the fee on a State application it returns.",
  },
  {
    state: "live",
    what: "Statutory deadline tracking",
    detail:
      "30 days under Section 7(1), 35 if filed through an Assistant PIO, 48 hours where the life-or-liberty proviso applies, and a 30-day appeal window from the expiry of whichever applies.",
  },
  {
    state: "live",
    what: "First Appeal drafting",
    detail:
      "Generated from a template the moment the deadline lapses, addressed to the appellate officer recorded for that authority. Template rather than a model call, because the document is formulaic and must be exact.",
  },
  {
    state: "live",
    what: "Print / Save as PDF",
    detail:
      "Both the application and the appeal print as A4 documents from your browser, formatted the way a PIO expects them.",
  },
  {
    state: "mocked",
    what: "The authority directory",
    detail:
      "Twenty domains, hand-curated. The real RTI Online directory runs to thousands of public authorities. Addresses are given at district or regional level rather than as a specific office, and we link the official source to confirm against. A grievance outside these twenty domains will route poorly, and should show low confidence when it does.",
  },
  {
    state: "mocked",
    what: "Filing itself",
    detail:
      "Nothing is submitted to any government system. There is no public write API for rtionline.gov.in, and building against one would be neither possible nor appropriate. You file; you tell us the date; we track it.",
  },
  {
    state: "mocked",
    what: "“Filed” status and the fee",
    detail:
      "Both are self-reported. We never see a payment and never verify a registration number, so the clock is only as accurate as what you enter.",
  },
  {
    state: "mocked",
    what: "The demo fast-forward",
    detail:
      "“Simulate +31 days” shifts the clock on a prepared example so the appeal can be demonstrated without waiting a month. It is unavailable on anything you actually filed — spoofing a real appeal window would be the one lie this product cannot afford.",
  },
  {
    state: "mocked",
    what: "Saved responses on the prepared examples",
    detail:
      "If the model is unreachable, the three prepared examples fall back to a stored response so the journey still runs. A banner says so whenever that happens, and it never applies to text you wrote yourself.",
  },
  {
    state: "planned",
    what: "Accounts and cross-device sync",
    detail:
      "Everything currently lives in your browser's local storage. Clearing site data deletes it, and it does not follow you to another device.",
  },
  {
    state: "planned",
    what: "Email and SMS reminders",
    detail:
      "A deadline you have to remember to come back and check is a deadline you will miss. Reminders need an account, which needs the backend work above.",
  },
  {
    state: "planned",
    what: "Second Appeal and Section 18 complaints",
    detail:
      "We stop at the First Appeal. The escalation to the Information Commission is a different document with different rules.",
  },
];

const STATE_META = {
  live: {
    icon: CheckCircle2,
    label: "Works today",
    className: "text-success",
  },
  mocked: {
    icon: XCircle,
    label: "Mocked or limited",
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
    { state: "live" as const, heading: "What works today" },
    { state: "mocked" as const, heading: "What is mocked, or deliberately limited" },
    { state: "planned" as const, heading: "What is not built yet" },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        How this works, and what is mocked
      </h1>
      <p className="prose-measure mt-4 text-lg text-muted-foreground">
        RTI Copilot is a prototype. It does real work on the two things that
        sink most first RTI applications — the wrong office and the wrong
        phrasing — and it does not pretend to do the rest.
      </p>

      {groups.map((group) => {
        const meta = STATE_META[group.state];
        const Icon = meta.icon;
        return (
          <section key={group.state} className="mt-10">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Icon aria-hidden="true" className={`size-5 ${meta.className}`} />
              {group.heading}
            </h2>
            <ul className="mt-4 space-y-4">
              {ROWS.filter((row) => row.state === group.state).map((row) => (
                <li key={row.what} className="border-l-2 border-border pl-4">
                  <p className="font-semibold">{row.what}</p>
                  <p className="prose-measure mt-1 text-sm leading-relaxed text-muted-foreground">
                    {row.detail}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-12 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold tracking-tight">
          How this would work at real scale
        </h2>
        <div className="prose-measure mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">
              The directory is the accuracy ceiling, not the model.
            </span>{" "}
            Routing is grounded in our own data by design, so the honest way to
            scale coverage is to ingest the public authority lists that
            ministries and states already publish, and to keep the rule that a
            model may only ever return an ID that exists in that data.
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Confidence has to stay visible.
            </span>{" "}
            At scale the failure mode is a confident wrong match at volume. The
            mandatory confirm step and the honest low-confidence state are the
            safety mechanism, and neither should be optimised away for
            conversion.
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Deadlines belong on a server, not in a tab.
            </span>{" "}
            Tracking only helps if something reaches the citizen when the clock
            runs out. That means accounts, a daily sweep, and a reminder by
            email or SMS — the tracking logic here is already written against
            that shape.
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Grievances are sensitive.
            </span>{" "}
            They contain health, pension, and police details. Drafts should be
            encrypted at rest, submissions must never train an external model
            without opt-in, and the text should be retained only as long as the
            citizen wants it kept.
          </p>
        </div>
      </section>

      <div className="mt-10">
        <Button
          size="xl"
          variant="cta"
          nativeButton={false}
          render={<Link href="/apply">Try it</Link>}
        />
      </div>
    </div>
  );
}
