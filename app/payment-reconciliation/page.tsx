import type { Metadata } from "next";
import { CreditCard } from "lucide-react";

import { Marker, PAGE_LAYOUT, PageTitle, Rule } from "@/components/editorial";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payment Reconciliation",
  description: "Information about payment failures and reconciliation.",
};

export default function PaymentPage() {
  return (
    <div className={cn(PAGE_LAYOUT)}>
      <PageTitle
        marker={<Marker label="Payment Reconciliation" />}
        lead="Procedural directives for resolving transaction deductions unacknowledged by registration generation."
      >
        Payment Reconciliation
      </PageTitle>

      <section className="mt-16">
        <Rule />
        <h2 className="flex items-center gap-2 pt-8 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
          <CreditCard aria-hidden="true" className="size-4 opacity-75" />
          Payment Advisory
        </h2>
        <div className="prose-measure mt-8 space-y-6 text-base leading-relaxed opacity-75">
          <p>
            In certain cases, the statutory fee amount may be deducted from the applicant&rsquo;s bank account, but the RTI application Registration Number is not generated immediately due to network latency or gateway timeouts.
          </p>
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-8 text-destructive">
            <h3 className="text-lg font-semibold tracking-tight">
              Statutory Notice: Withhold Duplicate Remittance
            </h3>
            <p className="mt-3 leading-relaxed">
              If a deduction occurs without registration generation, applicants are strictly advised to wait for a mandatory period of 24 to 48 working hours. The portal automatically attempts to reconcile pending transactions with the authorized payment gateway partner.
            </p>
          </div>
          <ul className="list-inside list-disc space-y-4 marker:text-border">
            <li>
              <span className="font-semibold text-foreground">Upon Successful Reconciliation:</span> The application will be formally registered, and an official confirmation email will be dispatched to the registered email ID.
            </li>
            <li>
              <span className="font-semibold text-foreground">Upon Failed Reconciliation:</span> The deducted amount will be automatically refunded to the original payment source within a standard processing window of 5-7 working days.
            </li>
          </ul>
          <p className="mt-8 text-sm">
            For further administrative assistance regarding a transaction unrefunded beyond 7 working days, please contact the Grievance Redressal Desk and furnish your payment reference details.
          </p>
        </div>
      </section>
    </div>
  );
}
