import type { Metadata } from "next";
import { Accessibility, Keyboard, MonitorSmartphone, TriangleAlert } from "lucide-react";

import { Breadcrumbs, LastReviewed } from "@/components/breadcrumbs";

import { PageHeader, PageGrid } from "@/components/ui/page";
import { PAGE_LAYOUT } from "@/components/page-layout";
import { Prose, Section } from "@/components/section";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Accessibility statement",
  description:
    "How accessible this prototype is, measured against WCAG 2.1 AA and GIGW 3.0, including what still falls short.",
};

/**
 * The accessibility statement.
 *
 * GIGW 3.0 requires one, and an STQC audit looks for it first. It is also the
 * page most often written as a claim rather than a report — "this site is
 * fully accessible" with nothing behind it. This one says what was measured,
 * with what, and what still falls short, because a statement a reader cannot
 * check is worth nothing to the reader it is written for.
 */

const CONFORMS = [
  "Every page passes automated WCAG 2.1 AA testing (axe-core) with zero violations, in both English and Hindi.",
  "Content reflows without horizontal scrolling down to 320 CSS pixels, and at 200% text size.",
  "Text spacing can be overridden — line height, letter, word and paragraph spacing — without clipping or overlap.",
  "All functionality is operable by keyboard, with a visible focus indicator on every control and a skip link as the first tab stop.",
  "Interactive targets are at least 44×44 pixels, and body text starts at 17px on mobile.",
  "Status, deadline and confidence information is never carried by colour alone — each pairs colour with an icon and a text label.",
  "Form fields have persistent visible labels, errors are described in text beside the field, and personal-detail fields declare their purpose for autofill.",
  "Text size and high contrast can be changed from the bar at the top of every page, and the choice is remembered.",
  "The interface is available in English and Hindi, and the page language attribute changes with it.",
];

const SHORTFALLS = [
  "Automated testing catches roughly a third of accessibility problems. This prototype has not been tested with real assistive-technology users, which is the test that matters most.",
  "It has not been audited or certified by STQC, and carries no CQW certification.",
  "The generated RTI application and First Appeal are produced in English only. Machine-translating a legal document risks changing what was actually requested.",
  "Only English and Hindi are offered. GIGW expects broader Indian language coverage.",
  "The diagrams on the home page carry text alternatives, but no long-description page.",
  "No audio or video content exists yet, so captioning and transcript practice is untested.",
];

const READERS = [
  { name: "NVDA", platform: "Windows", cost: "Free" },
  { name: "JAWS", platform: "Windows", cost: "Commercial" },
  { name: "Narrator", platform: "Windows", cost: "Built in" },
  { name: "VoiceOver", platform: "macOS and iOS", cost: "Built in" },
  { name: "TalkBack", platform: "Android", cost: "Built in" },
  { name: "Orca", platform: "Linux", cost: "Free" },
];

export default function AccessibilityPage() {
  return (
    <div className={cn(PAGE_LAYOUT)}>
      <Breadcrumbs current="Accessibility statement" />

      <PageHeader
        eyebrow="Accessibility"
        title={"Accessibility statement"}
        lead="What has been measured, what it was measured with, and what still falls short."
      />

      <PageGrid>
        <Section label="Standard we aim at" icon={Accessibility}>
          <Prose>
            <p>
              This prototype targets <strong>WCAG 2.1 Level AA</strong>, the standard
              adopted by <strong>GIGW 3.0</strong> — the Guidelines for Indian Government
              Websites and Apps issued by the National Informatics Centre under MeitY.
              The underlying legal duty comes from the Rights of Persons with
              Disabilities Act, 2016, and the related Indian Standard IS 17802.
            </p>
            <p>
              It is not a government website and is not certified by anyone. Aiming at
              the government standard is a choice about quality, not a claim of status.
            </p>
          </Prose>
        </Section>

        <Section label="What conforms today" icon={Keyboard}>
          <Prose>
            <ul>
              {CONFORMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Prose>
        </Section>

        <Section label="Where it falls short" icon={TriangleAlert}>
          <Prose>
            <p>
              Stated plainly, because an accessibility statement that lists only
              successes tells a reader nothing they can act on.
            </p>
            <ul>
              {SHORTFALLS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Prose>
        </Section>

        <Section label="Screen reader access" icon={MonitorSmartphone}>
          <Prose>
            <p>
              The pages are built from standard HTML landmarks, headings and form
              controls, so they should work with any current screen reader. The ones in
              common use in India are listed below.
            </p>
          </Prose>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-left text-base">
              <caption className="sr-only">
                Screen readers in common use, their platforms, and cost
              </caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="py-3 pr-6 font-semibold">Screen reader</th>
                  <th scope="col" className="py-3 pr-6 font-semibold">Platform</th>
                  <th scope="col" className="py-3 font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody>
                {READERS.map((reader) => (
                  <tr key={reader.name} className="border-b border-border">
                    <th scope="row" className="py-3 pr-6 font-medium">{reader.name}</th>
                    <td className="py-3 pr-6 opacity-75">{reader.platform}</td>
                    <td className="py-3 opacity-75">{reader.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section label="Reporting a problem" icon={TriangleAlert}>
          <Prose>
            <p>
              If something here is unusable with your assistive technology, that is a
              defect and worth reporting on the project&rsquo;s issue tracker. Saying
              which page, which technology and what happened makes it fixable.
            </p>
            <p>
              There is no help desk behind this page. For a real RTI application, use
              the official portal at{" "}
              <a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer">
                rtionline.gov.in
              </a>
              .
            </p>
          </Prose>
        </Section>
      </PageGrid>

      <LastReviewed date="2026-08-23" />
    </div>
  );
}
