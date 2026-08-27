import type { Metadata } from "next";
import { Building2, LifeBuoy } from "lucide-react";

import { Breadcrumbs, LastReviewed } from "@/components/breadcrumbs";

import { PageHeader, PageGrid } from "@/components/ui/page";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { Prose, Section } from "@/components/section";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact and help",
  description: "How to get help with this tool, and where to go for official RTI support.",
};

export default function ContactPage() {
  return (
    <div className={cn(PAGE_LAYOUT)}>
      <Breadcrumbs current="Contact and help" />

      <PageHeader
        eyebrow="Help"
        title={"Contact and help"}
        lead="Where to get help with this tool, and where to go for the official portal."
      />

      <PageGrid>
        <Section label="About this tool" icon={LifeBuoy}>
          <Prose>
            <p>
              This is an independent prototype that helps you draft an RTI application.
              It is not run by the Government of India, and it has no help desk, no phone
              line, and no way to look up the status of an application you filed
              elsewhere.
            </p>
            <p>
              If something here is broken or confusing, the useful thing to do is report
              it on the project&rsquo;s issue tracker. There is no support queue behind
              this page.
            </p>
          </Prose>
        </Section>

        <Section label="Official RTI support" icon={Building2}>
          <Prose>
            <p>
              For anything about a real RTI application — filing it, paying the fee,
              tracking it, or appealing — go to the government&rsquo;s own portal. It
              publishes current contact details for its help desk, which we deliberately
              do not copy here: reprinting a government phone number on an independent
              tool sends people to the wrong place with the wrong expectations.
            </p>
            <p>
              <a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer">
                rtionline.gov.in
              </a>{" "}
              — the official RTI Online portal, including its help desk contacts.
            </p>
            <p className="text-sm">
              Neither this tool nor its authors can give legal advice about the Right to
              Information Act, or act on your behalf with any public authority.
            </p>
          </Prose>
        </Section>
      </PageGrid>
      <LastReviewed date="2026-08-23" />
    </div>
  );
}
