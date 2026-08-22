"use client";

import Link from "next/link";

import { useI18n } from "@/lib/client/i18n";

/**
 * The disclaimer is in the footer of every page, not buried on an about page,
 * and it is translated along with the rest of the interface.
 *
 * Two things have to be unmissable. This is an independent tool and not a
 * government service — an RTI product that lets anyone believe otherwise is
 * doing real harm. And it drafts documents rather than giving legal advice,
 * which is the line the PRD draws and the one a user is most likely to blur.
 * Leaving that in English for a Hindi-speaking reader would put the disclaimer
 * in front of exactly the people least able to read it.
 */
export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer data-print="hide" className="mt-auto border-t border-border bg-card">
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-8 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{t("footer.independent")}</p>
        <p className="prose-measure">{t("footer.notGov")}</p>
        <p className="prose-measure">{t("footer.notLegal")}</p>
        <p className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
          <Link
            href="/how-it-works"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {t("footer.howLink")}
          </Link>
          <a
            href="https://rtionline.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {t("footer.portalLink")}
          </a>
          <a
            href="https://rti.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {t("footer.actLink")}
          </a>
        </p>
      </div>
    </footer>
  );
}
