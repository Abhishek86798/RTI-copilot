import type { Metadata } from "next";
import { CheckCircle2, CircleDashed, FlaskConical } from "lucide-react";

import { Breadcrumbs, LastReviewed } from "@/components/breadcrumbs";

import { Section } from "@/components/section";
import { PageHeader, PageGrid } from "@/components/ui/page";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "System Capabilities and Technical Limitations",
  description:
    "Documentation outlining live integrations, simulated capabilities, and pending administrative features of the RTI Copilot module.",
};

type Row = { state: "live" | "mocked" | "planned"; what: string; detail: string };

const ROWS: Row[] = [
  {
    state: "live",
    what: "Unstructured Data Intake",
    detail:
      "The system supports free-text input without requiring pre-selection of administrative hierarchies or departments.",
  },
  {
    state: "live",
    what: "Automated Authority Designation",
    detail:
      "Input parameters are evaluated against a curated directory using a language model. Output is strictly bounded to pre-existing official designations to prevent invalid routing.",
  },
  {
    state: "live",
    what: "Statutory Compliance Formatting",
    detail:
      "The module transcribes unstructured grievances into formal Section 2(f) compliant document requisitions while preserving critical reference numbers and dates.",
  },
  {
    state: "live",
    what: "Proviso Clause Detection",
    detail:
      "The system analyzes the request against the stringent criteria of the Section 7(1) proviso, identifying cases requiring a 48-hour expedited response.",
  },
  {
    state: "live",
    what: "Jurisdictional Filing Directives",
    detail:
      "Determines appropriate submission channels based on Central versus State jurisdiction to prevent erroneous fee capture and subsequent rejection.",
  },
  {
    state: "live",
    what: "Statutory Period Monitoring",
    detail:
      "Calculates applicable statutory deadlines (30 days, 35 days, or 48 hours) and automatically monitors the 30-day First Appeal window post-expiration.",
  },
  {
    state: "live",
    what: "First Appellate Draft Generation",
    detail:
      "Automatically compiles a formulaic First Appeal utilizing verified administrative templates upon expiration of the statutory response period.",
  },
  {
    state: "live",
    what: "Standardized Output Formatting",
    detail:
      "Generates compliant A4 documentation formatted according to prevailing Public Information Officer (PIO) expectations.",
  },
  {
    state: "mocked",
    what: "Public Authority Database",
    detail:
      "Currently limited to thirty-six curated domains. Expansion to the full national directory is required for production deployment. Queries outside supported domains yield an explicit low-confidence assessment.",
  },
  {
    state: "mocked",
    what: "Direct Portal Integration",
    detail:
      "The prototype lacks write-access integration with official RTI portals. Submissions are generated but not electronically filed on behalf of the citizen.",
  },
  {
    state: "mocked",
    what: "Payment Verification",
    detail:
      "Fee payment and registration status are reliant entirely on user self-certification without backend verification or validation.",
  },
  {
    state: "mocked",
    what: "Temporal Simulation Utility",
    detail:
      "A demonstration utility is provided to simulate deadline expiration. This feature is disabled for genuine user-generated queries to prevent statutory misrepresentation.",
  },
  {
    state: "mocked",
    what: "Fallback Contingency Protocols",
    detail:
      "Pre-loaded templates utilize static fallback responses in the event of upstream model unavailability, ensuring uninterrupted demonstration flow.",
  },
  {
    state: "live",
    what: "Cross-Session Data Persistence",
    detail:
      "Signed-in applications are stored server-side and survive a cleared browser or a change of device. Guest mode remains available and stays local-only, by design.",
  },
  {
    state: "live",
    what: "Automated Notification Systems",
    detail:
      "A daily server-side sweep checks every filed application against its statutory deadline and emails the applicant when the window is closing or has lapsed.",
  },
  {
    state: "planned",
    what: "Escalation Protocols",
    detail:
      "Functionality currently terminates at the First Appellate level. Integration with Information Commission escalation procedures (Section 18/19) is pending.",
  },
];

const STATE_META = {
  live: {
    icon: CheckCircle2,
    label: "Active Integration",
    className: "text-success",
  },
  mocked: {
    icon: FlaskConical,
    label: "Simulated Constraints",
    className: "text-warning",
  },
  planned: {
    icon: CircleDashed,
    label: "Pending Development",
    className: "text-muted-foreground",
  },
} as const;

export default function HowItWorksPage() {
  const groups = [
    { state: "live" as const, heading: "Active System Integrations" },
    { state: "mocked" as const, heading: "Simulated Constraints & Technical Limitations" },
    { state: "planned" as const, heading: "Pending Administrative Features" },
  ];

  return (
    <div className={cn(PAGE_LAYOUT)}>
      <Breadcrumbs current="System capabilities and limitations" />

      <PageHeader
        eyebrow="System Documentation"
        title={"System Capabilities and Technical Limitations"}
        lead="This portal serves as a functional prototype detailing the operational boundaries of the RTI Copilot module. The following documentation outlines live integrations, simulated capabilities, and pending administrative features."
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

        <Section label="Production Deployment Considerations">
          <div className="space-y-3 text-sm leading-prose text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">
                Directory Completeness Dependency.
              </span>{" "}
              Routing accuracy requires ingestion of complete public authority datasets rather than reliance on generative inference. Models must be strictly bounded to prevent the fabrication of non-existent administrative entities.
            </p>
            <p>
              <span className="font-semibold text-foreground">
                Confidence Metric Transparency.
              </span>{" "}
              High-volume administrative processing demands explicit low-confidence warnings. Mandatory review protocols must remain in place to prevent systemic misdirection of citizen applications.
            </p>
            <p>
              <span className="font-semibold text-foreground">
                Centralized State Management.
              </span>{" "}
              Statutory tracking necessitates server-side persistence. Active monitoring and automated citizen notification are critical to ensuring compliance with strict appellate timelines.
            </p>
            <p>
              <span className="font-semibold text-foreground">
                Data Privacy and Security Compliance.
              </span>{" "}
              Requests frequently contain sensitive personal data, mandating encryption at rest. Submission data must never be utilized for external model training without explicit, documented consent.
            </p>
          </div>
        </Section>
      </PageGrid>

      <LastReviewed date="2026-08-23" />
    </div>
  );
}
