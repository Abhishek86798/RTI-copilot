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
      <Frame className="py-10 lg:py-12">
        {/*
          The disclaimer column is given twice the width of a link column.
          
          At 1.6fr it was about 300px wide, which set four paragraphs as a
          narrow ribbon and made the footer 712px tall — a full screen of
          chrome under every page on the site. Wider and tighter, it says the
          same thing in half the height.
        */}
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          {/* The disclaimer leads, because it is the part that matters most. */}
          <div className="max-w-[52ch]">
            <p className="font-mono text-[0.75rem] tracking-[0.16em] uppercase opacity-75">
              {t("brand.name")}
            </p>
            <p className="mt-4 text-[0.9375rem] leading-[1.55] font-medium">
              {t("footer.independent")}
            </p>
            <p className="mt-3 text-[0.8125rem] leading-[1.7] opacity-75">{t("footer.notGov")}</p>
            <p className="mt-2 text-[0.8125rem] leading-[1.7] opacity-75">{t("footer.notLegal")}</p>
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="font-mono text-[0.75rem] tracking-[0.16em] uppercase opacity-75">
                {column.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline-offset-4 hover:underline"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm underline-offset-4 hover:underline"
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

        <div className="mt-10 border-t border-border pt-5">
          <p className="font-mono text-[0.75rem] tracking-[0.16em] uppercase opacity-75">
            {t("footer.colophon")}
          </p>
        </div>
      </Frame>
    </footer>
  );
}
