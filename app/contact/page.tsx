import type { Metadata } from "next";
import { Mail } from "lucide-react";

import { Marker, PAGE_LAYOUT, PageTitle, Rule } from "@/components/editorial";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact and help",
  description: "How to get help with this tool, and where to go for official RTI support.",
};

export default function ContactPage() {
  return (
    <div className={cn(PAGE_LAYOUT)}>
      <PageTitle
        marker={<Marker label="Help" />}
        lead="Where to get help with this tool, and where to go for the official portal."
      >
        Contact and help
      </PageTitle>

      <section className="mt-16">
        <Rule />
        <h2 className="flex items-center gap-2 pt-8 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
          <Mail aria-hidden="true" className="size-4 opacity-75" />
          About this tool
        </h2>
        <div className="prose-measure mt-8 space-y-6 text-base leading-relaxed opacity-75">
          <p>
            This is an independent prototype that helps you draft an RTI application. It is
            not run by the Government of India, and it has no help desk, no phone line, and
            no way to look up the status of an application you filed elsewhere.
          </p>
          <p>
            If something here is broken or confusing, the useful thing to do is report it on
            the project&rsquo;s issue tracker. There is no support queue behind this page.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <Rule />
        <h2 className="flex items-center gap-2 pt-8 font-mono text-[0.68rem] tracking-[0.18em] uppercase">
          <Mail aria-hidden="true" className="size-4 opacity-75" />
          Official RTI support
        </h2>
        <div className="prose-measure mt-8 space-y-6 text-base leading-relaxed opacity-75">
          <p>
            For anything about a real RTI application — filing it, paying the fee, tracking
            it, or appealing — go to the government&rsquo;s own portal. It publishes current
            contact details for its help desk, which we deliberately do not copy here:
            reprinting a government phone number on an independent tool sends people to the
            wrong place with the wrong expectations.
          </p>
          <p>
            <a
              href="https://rtionline.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4"
            >
              rtionline.gov.in
            </a>{" "}
            — the official RTI Online portal, including its help desk contacts.
          </p>
          <p className="text-sm">
            Neither this tool nor its authors can give legal advice about the Right to
            Information Act, or act on your behalf with any public authority.
          </p>
        </div>
      </section>
    </div>
  );
}
