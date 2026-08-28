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
        /*
         * A hairline outline instead of a filled tray.
         *
         * This control has to read as on/off — it is the one piece of state in
         * the chrome someone may need to find in a script they cannot read, so
         * plain text with a divider is not enough. But the tray was doing that
         * job four layers deep: a muted fill, a raised chip, a shadow and a
         * ring. An outline plus one fill says the same thing in a fraction of
         * the ink.
         */
        "inline-flex items-center gap-px rounded-md border border-border p-px",
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
              /*
               * 32px, down from 36. The tap target is the button plus the
               * header's own vertical padding, which keeps it past the 44px
               * guideline at every width.
               */
              "min-h-8 cursor-pointer rounded-[5px] px-2 text-xs transition-colors sm:px-2.5",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active
                ? "bg-muted font-semibold text-foreground"
                : "font-medium text-muted-foreground hover:text-foreground"
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
