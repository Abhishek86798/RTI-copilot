import type { Metadata } from "next";
import { ClipboardList, ListChecks } from "lucide-react";

import { LastReviewed } from "@/components/breadcrumbs";

import { PageHeader, PageGrid } from "@/components/ui/page";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { Prose, Section, Steps } from "@/components/section";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "How to use this tool",
  description: "What you need before you start, and what happens at each step.",
};

const STEPS = [
  {
    title: "Describe what you want to know",
    body: "Write your question in your own words — plain Hindi or English is fine. The tool works out which public authority is likely to hold the information and turns what you wrote into a properly formatted RTI application.",
  },
  {
    title: "Review the draft",
    body: "You get a draft you can read and edit before anything else happens. This is the part worth spending time on: a vague question is the most common reason an RTI request comes back unanswered.",
  },
  {
    title: "File it and keep the number",
    body: "The fee step here is simulated — nothing is charged and nothing is filed for you. When you file on the real portal, save the registration number it gives you. You need it to track the request and to appeal if 30 days pass with no reply.",
  },
];

export default function ManualPage() {
  return (
    <div className={cn(PAGE_LAYOUT)}>

      <PageHeader
        eyebrow="Guide"
        title={"How to use this tool"}
        lead="What you need before you start, and what happens at each step."
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
        <Section label="Before you start" icon={ListChecks}>
          <Prose>
            <p>
              This tool helps you write an RTI application for a Central Government
              ministry, department, or public authority. It drafts the request — it does
              not file it for you, and it is not the government&rsquo;s own portal.
            </p>
            <ul>
              <li>
                An RTI request to a Central authority has to go to a Central authority.
                State departments have their own portals, and a misdirected request is
                returned without a refund of the fee.
              </li>
              <li>Supporting documents must be PDFs under 1MB.</li>
              <li>
                You will need a working email address and mobile number when you file on
                the real portal.
              </li>
            </ul>
          </Prose>
        </Section>

        <Section label="The three steps" icon={ClipboardList}>
          <Steps items={STEPS} />
        </Section>
      </PageGrid>

      <LastReviewed date="2026-08-23" />
    </div>
  );
}
