import type { Metadata } from "next";
import { CreditCard, Landmark } from "lucide-react";

import { Breadcrumbs, LastReviewed } from "@/components/breadcrumbs";
import { Marker, PageTitle } from "@/components/editorial";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { Callout, Prose, Section } from "@/components/section";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About the fee step",
  description: "Why this prototype simulates the RTI fee, and what the real portal does.",
};

export default function PaymentPage() {
  return (
    <div className={cn(PAGE_LAYOUT, "space-y-5")}>
      <Breadcrumbs current="About the fee step" />

      <PageTitle
        marker={<Marker label="Fees" />}
        lead="This prototype simulates the fee step. Here is what that means, and what actually happens on the real portal."
      >
        About the fee step
      </PageTitle>

      <Section label="What this tool does" icon={CreditCard}>
        {/*
          The callout sits outside Prose on purpose. Nested inside it, it
          inherited the muted body treatment and rendered the single most
          important sentence on the page at 75% opacity.
        */}
        <Callout title="No money changes hands here">
          <p>
            The fee step in this prototype is simulated. Nothing is charged, no
            payment gateway is involved, and no application is filed with any public
            authority. You will never be asked for card or bank details.
          </p>
        </Callout>

        <Prose className="mt-8">
          <p>
            Because of that, none of the usual payment problems can happen here —
            there is no failed transaction to reconcile and no refund to chase. If you
            came to this page looking for help with a payment that actually left your
            bank account, it was not this tool that took it.
          </p>
        </Prose>
      </Section>

      <Section label="The fee on the real portal" icon={Landmark}>
        <Prose>
          <p>
            Filing an RTI application costs ₹10 under the RTI Rules, 2012. If you hold
            a Below Poverty Line certificate, you do not pay it.
          </p>
          <p>
            If a payment there is deducted but you get no registration number, the
            standard advice is to wait rather than pay again — a duplicate payment is
            harder to recover than a pending one. For the current process and
            timelines, check{" "}
            <a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer">
              rtionline.gov.in
            </a>
            , which is the only authority on its own refund handling.
          </p>
        </Prose>
      </Section>
      <LastReviewed date="2026-08-23" />
    </div>
  );
}
