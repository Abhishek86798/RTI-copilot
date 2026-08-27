import type { Metadata } from "next";
import Link from "next/link";
import { FileText, LifeBuoy, Scale } from "lucide-react";

import { Breadcrumbs, LastReviewed } from "@/components/breadcrumbs";

import { PageHeader, PageGrid } from "@/components/ui/page";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { Section } from "@/components/section";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Every page on this site, grouped by what it is for.",
};

/**
 * The human-readable sitemap that GIGW requires.
 *
 * Distinct from `/sitemap.xml`, which is for crawlers. This one is for a
 * reader who could not find something in the navigation — which, on a site
 * whose audience is by definition unfamiliar with government interfaces, is a
 * likelier failure than it would be elsewhere.
 *
 * Each link carries a line saying what the page is for. A bare list of titles
 * only helps someone who already knows the vocabulary.
 */

const GROUPS = [
  {
    heading: "Filing an application",
    icon: FileText,
    links: [
      {
        href: "/apply",
        label: "Initiate Requisition",
        detail: "Describe a grievance and get a drafted RTI application.",
      },
      {
        href: "/applications",
        label: "Applicant Dashboard",
        detail: "Applications you have drafted, with their statutory deadlines.",
      },
    ],
  },
  {
    heading: "Help and guidance",
    icon: LifeBuoy,
    links: [
      {
        href: "/manual",
        label: "How to use this tool",
        detail: "What you need before you start, and what happens at each step.",
      },
      {
        href: "/faq",
        label: "Common questions",
        detail: "The questions people ask most often, answered plainly.",
      },
      {
        href: "/payment-reconciliation",
        label: "About the fee step",
        detail: "Why the fee is simulated here, and what the real portal charges.",
      },
      {
        href: "/contact",
        label: "Contact and help",
        detail: "Where to get help, and where the official portal is.",
      },
      {
        href: "/how-it-works",
        label: "System capabilities and limitations",
        detail: "What works today, what is simulated, and what is not built yet.",
      },
    ],
  },
  {
    heading: "Policies and accessibility",
    icon: Scale,
    links: [
      {
        href: "/accessibility",
        label: "Accessibility statement",
        detail: "What has been measured against WCAG 2.1 AA, and what falls short.",
      },
      {
        href: "/policies",
        label: "Website policies",
        detail: "Privacy, terms of use, copyright, and hyperlinking.",
      },
      {
        href: "/sitemap",
        label: "Sitemap",
        detail: "This page.",
      },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className={cn(PAGE_LAYOUT)}>
      <Breadcrumbs current="Sitemap" />

      <PageHeader
        eyebrow="Index"
        title="Sitemap"
        lead="Every page on this site, grouped by what it is for."
      />

      <PageGrid>
        {GROUPS.map((group) => (
          <Section key={group.heading} label={group.heading} icon={group.icon}>
            {/*
              An index is scanned, not read. A single column of 99px rows put
              four links on a screen and made the shortest page on the site
              three screens long.
            */}
            <ul className="divide-y divide-border">
              {group.links.map((link) => (
                <li key={link.href} className="py-2.5 first:pt-0 last:pb-0">
                  <Link
                    href={link.href}
                    className="text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                  <p className="mt-0.5 text-sm leading-prose text-muted-foreground">
                    {link.detail}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        ))}
      </PageGrid>

      <LastReviewed date="2026-08-23" />
    </div>
  );
}
