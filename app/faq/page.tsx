import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";

import { Marker, PAGE_LAYOUT, PageTitle, Rule } from "@/components/editorial";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Statutory Clarifications",
  description: "Official clarifications regarding portal operations and statutory constraints.",
};

export default function FAQPage() {
  const faqs = [
    {
      q: "Can I file an RTI application for State Government departments here?",
      a: "No. This portal is strictly for Central Government Ministries, Departments, and other Central Public Authorities. If you file a request intended for a State Government, it will be returned and the fee will not be refunded.",
    },
    {
      q: "What is the fee for filing an RTI application?",
      a: "A fee of ₹10 is required as per the RTI Rules, 2012. Citizens holding a Below Poverty Line (BPL) certificate are exempt from paying this fee.",
    },
    {
      q: "How do I attach supporting documents?",
      a: "During the application process, there is a provision to upload a supporting document. The document must be a PDF file and cannot exceed 1MB in size.",
    },
    {
      q: "What should I do if my payment fails but money was deducted?",
      a: "Please wait 24-48 hours. Do not attempt another payment immediately. If the payment is successful at the gateway but the receipt is not generated, it will be reconciled automatically. See the Payment Reconciliation page for more details.",
    },
    {
      q: "When can I file a First Appeal?",
      a: "You may file a First Appeal if you receive no response within 30 days of submitting your request, or if you are dissatisfied with the response provided by the CPIO.",
    },
  ];

  return (
    <div className={cn(PAGE_LAYOUT)}>
      <PageTitle
        marker={<Marker label="Clarifications" />}
        lead="Official administrative guidance and technical clarifications for portal usage."
      >
        Statutory & Technical Clarifications
      </PageTitle>

      <section className="mt-16">
        <Rule />
        <h2 className="flex items-center gap-2 pt-8 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
          <HelpCircle aria-hidden="true" className="size-4 opacity-75" />
          Documented Clarifications
        </h2>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {faqs.map((faq, index) => (
            <div key={index} className="py-8">
              <h3 className="max-w-[42ch] text-lg font-semibold leading-snug tracking-tight">
                {faq.q}
              </h3>
              <p className="prose-measure mt-4 text-base leading-relaxed opacity-75">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
