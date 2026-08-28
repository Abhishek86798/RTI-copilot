"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { AuthControls } from "@/components/auth/auth-controls";
import { LanguageToggle } from "@/components/language-toggle";
import { useApplications } from "@/lib/client/use-applications";
import { useI18n } from "@/lib/client/i18n";
import { PAGE_FRAME } from "@/components/page-layout";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const applications = useApplications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /*
   * The three things a citizen comes here to do. The four help pages sit in
   * the utility strip above — seven phrase-length labels did not fit the page
   * measure, and "Fees" was rendering underneath the language toggle where
   * nobody could see it.
   */
  const primaryLinks = [
    { href: "/apply", label: t("nav.new") },
    { href: "/applications", label: t("nav.mine"), count: applications.length },
    { href: "/appeal", label: t("nav.appeal") },
  ];

  /* The burger has no room problem, so it carries everything. */
  const navLinks = [
    ...primaryLinks,
    { href: "/manual", label: t("nav.manual") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/payment-reconciliation", label: t("nav.payment") },
  ];

  /*
   * `/applications/<id>` is the filing screen — step 4 of Initiate
   * Requisition, not a dashboard screen — so it lights up the nav item the
   * citizen has been under since step 1. Its own sub-routes (`/track`,
   * `/appeal`) are separate errands begun from the dashboard, and belong to
   * the dashboard's nav item.
   */
  const isFilingScreen = /^\/applications\/[^/]+$/.test(pathname);

  /*
   * Otherwise segment-prefix matching. A bare `pathname.startsWith(href)`
   * would make `/applications` also light up `/apply`, since the string
   * "/applications" starts with "/apply" — two nav items active at once.
   */
  function isActive(href: string) {
    if (isFilingScreen) return href === "/apply";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      data-print="hide"
      className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className={cn(PAGE_FRAME, "flex h-14 items-center")}>
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {/*
            A wordmark, not an emblem. A tricolor disc with a navy wheel reads
            as the National Flag / State Emblem — using anything that reads as
            a government seal on an independent tool would imply an
            endorsement that does not exist.
          */}
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
          >
            RTI
          </span>
          {/*
            `sr-only` rather than `hidden` below the sm breakpoint. The badge
            beside this is aria-hidden, so hiding the wordmark outright left
            the home link with no accessible name at all on a phone — axe
            flagged it as a serious link-name violation on every page.
          */}
          <span className="sr-only text-base font-bold tracking-tight sm:not-sr-only sm:text-lg">
            {t("brand.name")}
          </span>
        </Link>

        {/*
          Desktop navigation, from `xl` rather than `lg`.

          Seven items whose labels are phrases — "New application",
          "Applicant Dashboard", "Submit First Appeal" — need about 1250px
          once the wordmark and the three control groups are placed. Showing
          them from 1024px left every laptop between those two widths with a
          header that wrapped each label onto two lines and overlapped the
          controls. The burger carries 1024–1280px instead, where it fits.
        */}
        <nav aria-label="Main" className="ml-8 hidden h-full items-center gap-6 xl:flex">
          {primaryLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  // `whitespace-nowrap` because every label here is a phrase:
                  // without it "Submit First Appeal" breaks after the first
                  // word and doubles the header's height.
                  "relative flex h-full items-center whitespace-nowrap border-b-2 text-sm font-medium transition-colors hover:text-foreground",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground"
                )}
              >
                {link.label}
                {typeof link.count === "number" && link.count > 0 && (
                  <span className="ml-2 rounded-full bg-info px-1.5 py-0.5 text-[0.65rem] font-bold text-info-foreground">
                    {link.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        {/* `min-w-0` rather than `shrink-0`: at the narrowest width with the
            largest text this group is what decides whether the page scrolls
            sideways, and it has to be allowed to give. */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <LanguageToggle className="shrink-0" />
          <AuthControls />
          
          <button
            type="button"
            className="ml-1 flex min-h-9 min-w-12 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label="Toggle Menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation — `xl:hidden` must track the burger above it. */}
      {isMobileMenuOpen && (
        <div id="mobile-nav" className="border-t border-border bg-background xl:hidden">
          <nav className="flex flex-col px-2 py-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex min-h-9 items-center rounded-md px-3 text-base font-medium transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                  {typeof link.count === "number" && link.count > 0 && (
                    <span className="ml-2 rounded-full bg-info px-1.5 py-0.5 text-[0.7rem] font-bold text-info-foreground">
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
