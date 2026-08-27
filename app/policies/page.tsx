import type { Metadata } from "next";
import { Copyright, Link2, Lock, ScrollText } from "lucide-react";

import { Breadcrumbs, LastReviewed } from "@/components/breadcrumbs";
import { Marker, PageTitle } from "@/components/editorial";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { Prose, Section } from "@/components/section";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Website policies",
  description:
    "Privacy, terms of use, copyright and hyperlinking policy for this prototype.",
};

/**
 * The website policies GIGW expects — privacy, terms, copyright, hyperlinking.
 *
 * One page with four sections rather than four pages, because splitting them
 * would pad the navigation of a prototype that has four real pages of its own.
 *
 * Written as a description of what this build actually does, not as boilerplate
 * borrowed from a real department. The privacy section in particular is short
 * because the honest answer is short: almost nothing leaves the browser, and
 * the two things that do are named.
 */
export default function PoliciesPage() {
  return (
    <div className={cn(PAGE_LAYOUT, "space-y-5")}>
      <Breadcrumbs current="Website policies" />

      <PageTitle
        marker={<Marker label="Policies" />}
        lead="What happens to what you type, what you may do with this site, and who owns what."
      >
        Website policies
      </PageTitle>

      <Section label="Privacy" icon={Lock}>
        <Prose>
          <p>
            There is no account, no analytics, no advertising and no third-party
            tracking on this site. Nothing you type is sold, shared or profiled.
          </p>
          <p>Two things do leave your browser, and only when you ask for them:</p>
          <ul>
            <li>
              <strong>Your grievance text</strong> is sent to our server and on to a
              language model in order to route it and rewrite it. It is not stored on
              our server after the response is returned, and it is not used to train
              any model.
            </li>
            <li>
              <strong>Nothing else.</strong> Your name, address, phone number, email,
              filing date and registration number are held in your own browser&rsquo;s
              local storage and are never transmitted anywhere.
            </li>
          </ul>
          <p>
            Because that data lives only in your browser, clearing your browsing data
            deletes it permanently and it does not follow you to another device. We
            cannot recover it for you, because we never had it.
          </p>
          <p>
            RTI grievances routinely contain health, pension and police details. If
            you are working on a shared or public computer, finish and export what you
            need in one sitting, then clear the browser data.
          </p>
        </Prose>
      </Section>

      <Section label="Terms of use" icon={ScrollText}>
        <Prose>
          <p>
            This is a prototype built for a hackathon. It drafts documents; it does
            not file them, and it is not affiliated with, endorsed by, or operated by
            the Government of India or any State Government.
          </p>
          <ul>
            <li>
              Nothing here is legal advice. Read every draft before you file it — you
              are responsible for what it says.
            </li>
            <li>
              Routing suggestions are estimates. Confirm the public authority against
              its own official listing before filing.
            </li>
            <li>
              Nothing here guarantees that any public authority will reply, or that a
              draft will be accepted.
            </li>
            <li>
              The fee step is simulated. No money is taken and no application is
              submitted to any authority.
            </li>
          </ul>
        </Prose>
      </Section>

      <Section label="Copyright" icon={Copyright}>
        <Prose>
          <p>
            The text of the Right to Information Act, 2005 and the RTI Rules, 2012 is
            Government of India material, reproduced here only as short quotations and
            clause references for explanation.
          </p>
          <p>
            The public authority directory is compiled from publicly published
            departmental listings. Any errors in it are ours, not theirs — check the
            official source linked on each authority before you rely on it.
          </p>
          <p>
            Everything else on this site — the interface, the drafting templates and
            the diagrams — is the work of this project&rsquo;s authors.
          </p>
        </Prose>
      </Section>

      <Section label="Hyperlinking policy" icon={Link2}>
        <Prose>
          <p>
            You may link to any page on this site directly. No permission is needed
            and no link should be framed inside another page in a way that suggests
            this is anyone else&rsquo;s content.
          </p>
          <p>
            Where this site links out — to rtionline.gov.in, to a department&rsquo;s
            own site, or to the text of the Act — those destinations are not under our
            control. We link to them because they are the authoritative source, and we
            are not responsible for their content or availability.
          </p>
        </Prose>
      </Section>

      <LastReviewed date="2026-08-23" />
    </div>
  );
}
