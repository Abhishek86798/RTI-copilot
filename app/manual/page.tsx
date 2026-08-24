import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Marker, PAGE_LAYOUT, PageTitle, Rule } from "@/components/editorial";
import { Button } from "@/components/ux4g/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Citizen Operations Manual",
  description: "Administrative instructions for submitting statutory requests through this portal.",
};

export default function ManualPage() {
  return (
    <div className={cn(PAGE_LAYOUT)}>
      <PageTitle
        marker={<Marker label="Operations Manual" />}
        lead="Administrative directives and procedures for the submission of Right to Information applications."
      >
        Portal Usage Guidelines
      </PageTitle>

      <section className="mt-16">
        <Rule />
        <h2 className="flex items-center gap-2 pt-8 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
          <BookOpen aria-hidden="true" className="size-4 opacity-75" />
          General Directives & Prerequisites
        </h2>
        <div className="prose-measure mt-8 space-y-6 text-base leading-relaxed opacity-75">
          <p>
            Please review these statutory instructions carefully prior to initiating a request. This portal facilitates the electronic submission of RTI applications and First Appeals exclusively for Ministries, Departments, and Public Authorities of the Central Government.
          </p>
          <ul className="list-inside list-disc space-y-4 marker:text-border">
            <li>Applicants must possess a valid, active email ID and mobile number for authentication.</li>
            <li>Submissions misdirected to State Government authorities will be summarily rejected without fee refund.</li>
            <li>All supporting annexures must be submitted in PDF format and shall not exceed 1MB in file size.</li>
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <Rule />
        <h2 className="flex items-center gap-2 pt-8 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
          <BookOpen aria-hidden="true" className="size-4 opacity-75" />
          Application Submission Procedures
        </h2>
        <div className="mt-8 space-y-8">
          <div className="border-l-2 border-border pl-6">
            <h3 className="text-lg font-semibold tracking-tight">Phase 1: Query Drafting</h3>
            <p className="mt-2 text-base leading-relaxed opacity-75">
              Submit the grievance text. The system's Copilot module will automatically identify the corresponding Public Authority and format the text into a Section 2(f) compliant draft.
            </p>
          </div>
          <div className="border-l-2 border-border pl-6">
            <h3 className="text-lg font-semibold tracking-tight">Phase 2: Fee Remittance</h3>
            <p className="mt-2 text-base leading-relaxed opacity-75">
              A statutory processing fee of ₹10 is mandated. Remittance is accepted via Internet Banking, Credit/Debit cards, RuPay, or UPI. Applicants with valid BPL certification are legally exempt.
            </p>
          </div>
          <div className="border-l-2 border-border pl-6">
            <h3 className="text-lg font-semibold tracking-tight">Phase 3: Statutory Tracking</h3>
            <p className="mt-2 text-base leading-relaxed opacity-75">
              Retain the generated Registration Number. This identifier is required for tracking administrative progress and for initiating a First Appeal upon expiration of the statutory 30-day period.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-16">
        <Button
          size="xl"
          variant="cta"
          nativeButton={false}
          render={<Link href="/apply">Start an application</Link>}
        />
      </div>
    </div>
  );
}
