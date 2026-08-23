"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, ScrollText } from "lucide-react";

import { AuthControls } from "@/components/auth-controls";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useApplications } from "@/lib/client/use-applications";
import { useI18n } from "@/lib/client/i18n";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const applications = useApplications();

  const navLinks = [
    { href: "/apply", label: t("nav.new"), icon: FileText },
    {
      href: "/applications",
      label: t("nav.mine"),
      icon: ScrollText,
      count: applications.length,
    },
  ];

  return (
    <header
      data-print="hide"
      className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      {/*
        Matches the footer and the landing bands at 88rem with the same
        gutters. The header sat at 64rem while everything under it sat at
        88rem, so the wordmark never lined up with the first footer column.
      */}
      <div className="mx-auto flex h-16 w-full max-w-[88rem] items-center gap-1.5 px-5 sm:gap-3 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {/*
            A wordmark, not an emblem. Using anything that reads as a
            government seal on an independent tool would imply an endorsement
            that does not exist.
          */}
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
          >
            RTI
          </span>
          <span className="hidden text-base font-bold tracking-tight min-[420px]:inline sm:text-lg">
            {t("brand.name")}
          </span>
          <span className="sr-only min-[420px]:hidden">{t("brand.name")}</span>
        </Link>

        <nav aria-label="Main" className="ml-auto flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon aria-hidden="true" className="size-4" />
                {/* The label is hidden on narrow screens but never removed
                    from the accessible name. */}
                <span className="hidden sm:inline">{link.label}</span>
                <span className="sr-only sm:hidden">{link.label}</span>
                {typeof link.count === "number" && link.count > 0 && (
                  <span className="rounded-full bg-info px-1.5 text-xs font-semibold text-info-foreground">
                    {link.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Hidden on the narrowest screens: the header already carries the
            language choice and the primary action there, and theme follows the
            device by default. */}
        <ThemeToggle className="hidden shrink-0 sm:inline-flex" />

        <LanguageToggle className="shrink-0" />

        <div className="flex shrink-0 items-center gap-2">
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
