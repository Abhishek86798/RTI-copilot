import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";

import { Marker, PAGE_LAYOUT, PageTitle, Rule } from "@/components/editorial";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Common questions",
  description: "Answers to the questions people ask most often about filing an RTI request.",
};

const FAQS = [
  {
    q: "Does this actually file my RTI application?",
    a: "No. This tool helps you write the application and works out which authority to send it to. You file it yourself on rtionline.gov.in. The fee step here is simulated — nothing is charged.",
  },
  {
    q: "Can I use this for a State government department?",
    a: "Not usefully. The central portal only handles Central Government ministries, departments, and public authorities. A request meant for a State department is returned, and the fee is not refunded — most States run their own RTI portal instead.",
  },
  {
    q: "What does it cost to file?",
    a: "₹10 under the RTI Rules, 2012. If you hold a Below Poverty Line certificate, you are exempt and pay nothing.",
  },
  {
    q: "Can I attach documents?",
    a: "Yes, when you file on the real portal. Attachments have to be PDFs and no larger than 1MB.",
  },
  {
    q: "When can I appeal?",
    a: "You can file a First Appeal if 30 days pass with no response, or if the response you got does not answer what you asked. The appeal goes to the First Appellate Authority in the same public authority, not to a court.",
  },
];

export default function FAQPage() {
  return (
    <div className={cn(PAGE_LAYOUT)}>
      <PageTitle
        marker={<Marker label="Questions" />}
        lead="The questions people ask most often, answered plainly."
      >
        Common questions
      </PageTitle>

      <section className="mt-16">
        <Rule />
        <h2 className="flex items-center gap-2 pt-8 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
          <HelpCircle aria-hidden="true" className="size-4 opacity-75" />
          Questions and answers
        </h2>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {FAQS.map((faq) => (
            <div key={faq.q} className="py-8">
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
