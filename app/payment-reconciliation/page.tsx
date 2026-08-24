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
        lead="What to do if your payment was deducted but no registration number was generated."
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
            In certain cases, the fee amount may be deducted from your bank account, but the RTI application registration number is not generated immediately due to network delays or gateway timeouts.
          </p>
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-8 text-destructive">
            <h3 className="text-lg font-semibold tracking-tight">
              Do not pay again immediately
            </h3>
            <p className="mt-3 leading-relaxed">
              If your amount is deducted, please wait for at least 24 to 48 working hours. The system automatically attempts to reconcile pending transactions with the payment gateway partner.
            </p>
          </div>
          <ul className="list-inside list-disc space-y-4 marker:text-border">
            <li>
              <span className="font-semibold text-foreground">If reconciled successfully:</span> Your application will be registered and a confirmation email will be sent to your registered email ID.
            </li>
            <li>
              <span className="font-semibold text-foreground">If reconciliation fails:</span> The deducted amount will be automatically refunded to your original payment method within 5-7 working days.
            </li>
          </ul>
          <p className="mt-8 text-sm">
            For further assistance regarding a payment that has not been refunded after 7 working days, please contact the Help Desk with your transaction reference number.
          </p>
        </div>
      </section>
    </div>
  );
}
