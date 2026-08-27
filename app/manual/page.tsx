import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, ListChecks } from "lucide-react";

import { Breadcrumbs, LastReviewed } from "@/components/breadcrumbs";
import { Marker, PageTitle } from "@/components/editorial";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { Prose, Section, Steps } from "@/components/section";
import { Button } from "@/components/ux4g/button";
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
      <Breadcrumbs current="How to use this tool" />

      <PageTitle
        marker={<Marker label="Guide" />}
        lead="What you need before you start, and what happens at each step."
      >
        How to use this tool
      </PageTitle>

      <Section first label="Before you start" icon={ListChecks}>
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

      <div className="mt-16">
        <Button
          size="xl"
          variant="cta"
          nativeButton={false}
          render={<Link href="/apply">Start an application</Link>}
        />
      </div>
      <LastReviewed date="2026-08-23" />
    </div>
  );
}
