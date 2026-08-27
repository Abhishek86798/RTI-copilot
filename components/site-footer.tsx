"use client";

import Link from "next/link";

import { Frame } from "@/components/editorial";
import { useI18n } from "@/lib/client/i18n";

/**
 * The footer, as a column index rather than a paragraph.
 *
 * Two jobs, and the layout serves both. It is where someone looks for the
 * thing they could not find in the header, so the links are grouped under
 * small spaced headings and given room to breathe. And it carries the
 * disclaimer, which has to be unmissable rather than buried: this is an
 * independent tool, not a government service, and it drafts documents rather
 * than giving legal advice. An RTI product that lets anyone believe otherwise
 * does real harm.
 *
 * The disclaimer is translated along with everything else — leaving it in
 * English for a Hindi-speaking reader would put it in front of exactly the
 * people least able to read it.
 */
export function SiteFooter() {
  const { t } = useI18n();

  const columns = [
    {
      heading: t("footer.col.start"),
      links: [
        { label: t("nav.new"), href: "/apply" },
        { label: t("nav.mine"), href: "/applications" },
      ],
    },
    {
      heading: t("footer.col.about"),
      links: [{ label: t("footer.howLink"), href: "/how-it-works" }],
    },
    {
      heading: t("footer.col.legal"),
      links: [
        { label: t("footer.accessibility"), href: "/accessibility" },
        { label: t("footer.policies"), href: "/policies" },
        { label: t("footer.sitemap"), href: "/sitemap" },
      ],
    },
    {
      heading: t("footer.col.official"),
      links: [
        { label: t("footer.portalLink"), href: "https://rtionline.gov.in", external: true },
        { label: t("footer.actLink"), href: "https://rti.gov.in", external: true },
      ],
    },
  ];

  return (
    <footer data-print="hide" className="mt-auto border-t border-border bg-card">
      <Frame className="py-8">
        {/*
          Links first, in one compact row, then the disclaimer across the full
          width beneath them.

          Set as a fifth column beside the links, the disclaimer was about
          300px wide — three paragraphs as a narrow ribbon, which made the
          footer 567px tall on every page in the site. Across the measure it
          is the same words in four lines.
        */}
        <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="font-mono text-2xs tracking-[0.14em] text-muted-foreground uppercase">
                {column.heading}
              </h2>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/*
          The disclaimer stays in full. It is the sentence that keeps this from
          being mistaken for a government service, and shortening it to save
          pixels would be saving them in the wrong place.
        */}
        <div className="mt-8 border-t border-border pt-5">
          <p className="text-sm font-medium">{t("footer.independent")}</p>
          <p className="mt-2 max-w-[110ch] text-xs leading-prose text-muted-foreground">
            {t("footer.notGov")}
          </p>
          <p className="mt-1.5 max-w-[110ch] text-xs leading-prose text-muted-foreground">
            {t("footer.notLegal")}
          </p>
          <p className="mt-5 font-mono text-2xs tracking-[0.14em] text-muted-foreground uppercase">
            {t("footer.colophon")}
          </p>
        </div>
      </Frame>
    </footer>
  );
}
