import type { Metadata } from "next";
import { Phone } from "lucide-react";

import { Marker, PAGE_LAYOUT, PageTitle, Rule } from "@/components/editorial";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Help desk and contact information for the RTI Online Portal.",
};

export default function ContactPage() {
  return (
    <div className={cn(PAGE_LAYOUT)}>
      <PageTitle
        marker={<Marker label="Contact Us" />}
        lead="For technical queries and feedback regarding the online portal."
      >
        Help Desk
      </PageTitle>

      <section className="mt-16">
        <Rule />
        <h2 className="flex items-center gap-2 pt-8 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
          <Phone aria-hidden="true" className="size-4 opacity-75" />
          Contact Details
        </h2>
        <div className="prose-measure mt-8 space-y-6 text-base leading-relaxed opacity-75">
          <p>
            For any query or feedback related to this portal, please contact us during office hours (9:00 AM to 5:30 PM, Monday to Friday except Public Holidays).
          </p>
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="text-sm font-semibold tracking-widest uppercase opacity-60">
              Phone Support
            </h3>
            <p className="mt-3 font-mono text-2xl tracking-tight text-foreground">
              011-24010690 / 691
            </p>
            <p className="mt-3 text-sm text-destructive">
              Due to high call volume, call waiting may occur.
            </p>
            
            <div className="my-8 border-t border-border" />
            
            <h3 className="text-sm font-semibold tracking-widest uppercase opacity-60">
              Email Support
            </h3>
            <p className="mt-3 font-mono text-lg tracking-tight text-foreground">
              helprtionline-dopt[at]nic[dot]in
            </p>
          </div>
          <p className="text-sm">
            Please note: The Help Desk does not provide legal advice regarding the Right to Information Act, nor does it track individual application statuses beyond technical failures.
          </p>
        </div>
      </section>
    </div>
  );
}
