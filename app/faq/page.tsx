import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";

import { LastReviewed } from "@/components/breadcrumbs";

import { PageHeader } from "@/components/ui/page";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { Section } from "@/components/section";
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

      <PageHeader
        eyebrow="Questions"
        title={"Common questions"}
        lead="The questions people ask most often, answered plainly."
      />

      <Section label="Questions and answers" icon={HelpCircle}>
        {/*
          Two columns from `sm`, divided by hairlines rather than boxed.

          A question and its answer are one block of running text, and a border
          on four sides of each would add five frames to a page that is only
          ever read top to bottom. Set in a single column they ran to two and a
          half screens for five short answers; paired, the whole set is visible
          at once, which is the only way anyone scans an FAQ.
        */}
        <div className="grid gap-x-10 border-t border-border sm:grid-cols-2">
          {FAQS.map((faq) => (
            <div key={faq.q} className="border-b border-border py-6">
              <h3 className="text-sm font-semibold tracking-tight">
                {faq.q}
              </h3>
              <p className="mt-2 text-sm leading-prose text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </Section>
      <LastReviewed date="2026-08-23" />
    </div>
  );
}
