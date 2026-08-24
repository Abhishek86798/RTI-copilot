import type { Metadata } from "next";
import { Phone } from "lucide-react";

import { Marker, PAGE_LAYOUT, PageTitle, Rule } from "@/components/editorial";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Grievance Redressal / Help Desk",
  description: "Technical support and contact directives for the RTI Online Portal.",
};

export default function ContactPage() {
  return (
    <div className={cn(PAGE_LAYOUT)}>
      <PageTitle
        marker={<Marker label="Technical Support" />}
        lead="Directives for submitting technical queries and portal feedback."
      >
        Grievance Redressal Desk
      </PageTitle>

      <section className="mt-16">
        <Rule />
        <h2 className="flex items-center gap-2 pt-8 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
          <Phone aria-hidden="true" className="size-4 opacity-75" />
          Contact Details
        </h2>
        <div className="prose-measure mt-8 space-y-6 text-base leading-relaxed opacity-75">
          <p>
            For any technical query or feedback concerning portal operations, please contact the support desk strictly during stipulated office hours (09:00 Hrs to 17:30 Hrs, Monday to Friday, excluding Gazetted Holidays).
          </p>
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="text-sm font-semibold tracking-widest uppercase opacity-60">
              Telephonic Support
            </h3>
            <p className="mt-3 font-mono text-2xl tracking-tight text-foreground">
              011-24010690 / 691
            </p>
            <p className="mt-3 text-sm text-destructive">
              Note: Due to high call volumes, extended waiting periods may be experienced.
            </p>
            
            <div className="my-8 border-t border-border" />
            
            <h3 className="text-sm font-semibold tracking-widest uppercase opacity-60">
              Electronic Mail Support
            </h3>
            <p className="mt-3 font-mono text-lg tracking-tight text-foreground">
              helprtionline-dopt[at]nic[dot]in
            </p>
          </div>
          <p className="text-sm">
            Statutory Disclaimer: The Technical Support Desk is not authorized to provide legal counsel regarding the Right to Information Act, nor does it possess jurisdiction to track individual application statuses beyond identifying technical portal failures.
          </p>
        </div>
      </section>
    </div>
  );
}
