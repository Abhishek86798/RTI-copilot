"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useI18n } from "@/lib/client/i18n";
import { cn } from "@/lib/utils";

/**
 * Breadcrumbs.
 *
 * GIGW 3.0 makes these part of what it calls user-centric information
 * architecture, and the reason bites here specifically: people arrive on these
 * pages from a search engine or a shared link rather than by walking the nav,
 * so the page has to say where it sits before it says anything else.
 *
 * Marked up as an ordered list inside a labelled `nav`, with the current page
 * as plain text carrying `aria-current="page"` rather than a link to itself.
 * Separators are `aria-hidden`, so a screen reader hears a list of two items
 * instead of "Home chevron Accessibility".
 */
export function Breadcrumbs({
  current,
  items = [],
  className,
}: {
  /** The page being viewed. Rendered as text, never as a link. */
  current: string;
  /** Ancestors between Home and the current page, in order. */
  items?: { label: string; href: string }[];
  className?: string;
}) {
  const { t } = useI18n();

  const ancestors = [{ label: t("nav.home"), href: "/" }, ...items];

  return (
    <nav
      aria-label={t("nav.breadcrumb")}
      data-print="hide"
      className={cn("mb-8", className)}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {ancestors.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-2">
            <Link
              href={crumb.href}
              className="underline-offset-4 opacity-75 hover:underline hover:opacity-100"
            >
              {crumb.label}
            </Link>
            <ChevronRight aria-hidden="true" className="size-3.5 opacity-50" />
          </li>
        ))}
        <li>
          <span aria-current="page" className="font-medium">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}

/**
 * "Page last reviewed on …".
 *
 * GIGW requires a review date on content pages, and it is genuinely load
 * bearing here rather than decorative: this page describes statutory
 * deadlines and fees that change, and a reader deciding whether to trust it
 * needs to know how old it is.
 *
 * The date is passed in as an ISO string the author edits by hand. Deriving it
 * from a build timestamp or file mtime would refresh it on every unrelated
 * deploy and quietly turn it into a lie.
 */
export function LastReviewed({
  date,
  className,
}: {
  /** ISO `YYYY-MM-DD`. */
  date: string;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const formatted = new Date(`${date}T00:00:00`).toLocaleDateString(
    locale === "hi" ? "hi-IN" : "en-IN",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <p className={cn("mt-16 border-t border-border pt-6 text-sm opacity-75", className)}>
      {t("footer.updated")}:{" "}
      <time dateTime={date} className="font-medium">
        {formatted}
      </time>
    </p>
  );
}
