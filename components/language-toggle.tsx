"use client";

import { useI18n, type Locale } from "@/lib/client/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Locale; label: string; short: string; aria: string }[] = [
  // The short form is used where the header is tight. It stays the language's
  // own script, so it is still findable by someone who cannot read the other.
  { value: "en", label: "English", short: "EN", aria: "Switch to English" },
  { value: "hi", label: "हिन्दी", short: "हिं", aria: "हिन्दी में बदलें" },
];

/**
 * A two-option segmented control rather than a dropdown.
 *
 * With exactly two languages, a select box costs a tap to open, a tap to
 * choose, and hides the option you want behind a widget some users have never
 * successfully operated. Both choices are visible and one tap away here, and
 * each is labelled in its own script so you can find your language without
 * being able to read the other one.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-card p-0.5",
        className
      )}
    >
      {OPTIONS.map((option) => {
        const active = locale === option.value;
        return (
          <button
            key={option.value}
            type="button"
            lang={option.value}
            onClick={() => setLocale(option.value)}
            aria-pressed={active}
            aria-label={option.aria}
            className={cn(
              "min-h-12 cursor-pointer rounded-md px-2.5 text-sm font-medium transition-colors sm:px-3",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span className="sm:hidden">{option.short}</span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
