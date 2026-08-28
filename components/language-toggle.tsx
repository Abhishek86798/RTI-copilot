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
        "inline-flex items-center gap-0.5",
        className
      )}
    >
      {OPTIONS.map((option, index) => {
        const active = locale === option.value;
        return (
          <span key={option.value} className="inline-flex items-center">
            {index > 0 && (
              <span aria-hidden="true" className="mr-0.5 h-3.5 w-px bg-border" />
            )}
          <button
            type="button"
            lang={option.value}
            onClick={() => setLocale(option.value)}
            aria-pressed={active}
            aria-label={option.aria}
            className={cn(
              /*
               * 36px tall so the tap area clears the 44px guideline once the
               * header's own padding is counted, but visually light: the
               * selected language is marked by weight and colour alone.
               *
               * It used to be a filled chip inside a filled tray — three
               * treatments (background, shadow, ring) saying one thing, in a
               * header that already carries a nav, a sign-in button and the
               * utility strip above it.
               */
              "min-h-9 cursor-pointer rounded-md px-2 text-xs transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active
                ? "font-semibold text-foreground"
                : "font-medium text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="sm:hidden">{option.short}</span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
          </span>
        );
      })}
    </div>
  );
}
