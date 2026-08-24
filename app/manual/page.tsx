import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Marker, PAGE_LAYOUT, PageTitle, Rule } from "@/components/editorial";
import { Button } from "@/components/ux4g/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "User Manual",
  description: "Instructions for filing an RTI request through this portal.",
};

export default function ManualPage() {
  return (
    <div className={cn(PAGE_LAYOUT)}>
      <PageTitle
        marker={<Marker label="User Manual" />}
        lead="Step-by-step instructions for submitting your Right to Information application."
      >
        How to Use the Portal
      </PageTitle>

      <section className="mt-16">
        <Rule />
        <h2 className="flex items-center gap-2 pt-8 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
          <BookOpen aria-hidden="true" className="size-4 opacity-75" />
          General Instructions
        </h2>
        <div className="prose-measure mt-8 space-y-6 text-base leading-relaxed opacity-75">
          <p>
            Please read these instructions carefully before proceeding to submit your RTI request. This portal allows you to file RTI applications and First Appeals online for all Ministries/Departments and other Public Authorities of the Central Government.
          </p>
          <ul className="list-inside list-disc space-y-4 marker:text-border">
            <li>Ensure you have a valid email ID and mobile number before starting.</li>
            <li>Applications for State Government authorities will be rejected without a refund.</li>
            <li>Supporting documents must be in PDF format and under 1MB in size.</li>
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <Rule />
        <h2 className="flex items-center gap-2 pt-8 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
          <BookOpen aria-hidden="true" className="size-4 opacity-75" />
          Filing Process
        </h2>
        <div className="mt-8 space-y-8">
          <div className="border-l-2 border-border pl-6">
            <h3 className="text-lg font-semibold tracking-tight">Step 1: Draft your request</h3>
            <p className="mt-2 text-base leading-relaxed opacity-75">
              Enter your grievance in simple language. The Copilot assistant will help route it to the correct Public Authority and structure it legally.
            </p>
          </div>
          <div className="border-l-2 border-border pl-6">
            <h3 className="text-lg font-semibold tracking-tight">Step 2: Pay the fee</h3>
            <p className="mt-2 text-base leading-relaxed opacity-75">
              A statutory fee of ₹10 is required. Payment can be made via Internet Banking, Credit/Debit cards, RuPay, or UPI. BPL cardholders are exempt.
            </p>
          </div>
          <div className="border-l-2 border-border pl-6">
            <h3 className="text-lg font-semibold tracking-tight">Step 3: Track your status</h3>
            <p className="mt-2 text-base leading-relaxed opacity-75">
              Note down your registration number. You can use it to track your application and file a First Appeal if the 30-day deadline lapses.
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
