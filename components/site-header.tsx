"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/apply", label: t("nav.new") },
    { href: "/applications", label: t("nav.mine"), count: applications.length },
    { href: "/manual", label: t("nav.manual") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/payment-reconciliation", label: t("nav.payment") },
  ];

  return (
    <header
      data-print="hide"
      className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto flex h-16 w-full max-w-[88rem] items-center px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
          >
            RTI
          </span>
          <span className="hidden text-base font-bold tracking-tight sm:inline sm:text-lg">
            {t("brand.name")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main" className="ml-8 hidden lg:flex flex-1 items-center gap-8">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-foreground",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-foreground" />
                )}
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
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex shrink-0" />
          <LanguageToggle className="shrink-0" />
          <AuthControls />
          
          <button 
            className="ml-2 flex min-h-12 min-w-12 items-center justify-center rounded-md hover:bg-muted lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="flex flex-col px-4 py-4 space-y-5">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-2 text-base font-medium transition-colors",
                    active ? "text-foreground" : "text-muted-foreground"
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
