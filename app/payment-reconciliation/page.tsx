import type { Metadata } from "next";
import { CreditCard } from "lucide-react";

import { Marker, PAGE_LAYOUT, PageTitle, Rule } from "@/components/editorial";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About the fee step",
  description: "Why this prototype simulates the RTI fee, and what the real portal does.",
};

export default function PaymentPage() {
  return (
    <div className={cn(PAGE_LAYOUT)}>
      <PageTitle
        marker={<Marker label="Fees" />}
        lead="This prototype simulates the fee step. Here is what that means, and what actually happens on the real portal."
      >
        About the fee step
      </PageTitle>

      <section className="mt-16">
        <Rule />
        <h2 className="flex items-center gap-2 pt-8 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
          <CreditCard aria-hidden="true" className="size-4 opacity-75" />
          What this tool does
        </h2>
        <div className="prose-measure mt-8 space-y-6 text-base leading-relaxed opacity-75">
          <div className="rounded-xl border border-warning/30 bg-warning/10 p-8">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              No money changes hands here
            </h3>
            <p className="mt-3 leading-relaxed">
              The fee step in this prototype is simulated. Nothing is charged, no payment
              gateway is involved, and no application is filed with any public authority.
              You will never be asked for card or bank details.
            </p>
          </div>
          <p>
            Because of that, none of the usual payment problems can happen here — there is
            no failed transaction to reconcile and no refund to chase. If you came to this
            page looking for help with a payment that actually left your bank account, it
            was not this tool that took it.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <Rule />
        <h2 className="flex items-center gap-2 pt-8 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
          <CreditCard aria-hidden="true" className="size-4 opacity-75" />
          The fee on the real portal
        </h2>
        <div className="prose-measure mt-8 space-y-6 text-base leading-relaxed opacity-75">
          <p>
            Filing an RTI application costs ₹10 under the RTI Rules, 2012. If you hold a
            Below Poverty Line certificate, you do not pay it.
          </p>
          <p>
            If a payment there is deducted but you get no registration number, the standard
            advice is to wait rather than pay again — a duplicate payment is harder to
            recover than a pending one. For the current process and timelines, check{" "}
            <a
              href="https://rtionline.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4"
            >
              rtionline.gov.in
            </a>
            , which is the only authority on its own refund handling.
          </p>
        </div>
      </section>
    </div>
  );
}
