"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { useI18n } from "@/lib/client/i18n";
import { cn } from "@/lib/utils";

/**
 * Light / dark / system.
 *
 * Sets two things at once, deliberately: `.dark` for our own Tailwind styles
 * and `data-theme="dark"` for UX4G's, which keys its dark palette off the
 * attribute. Driving only one leaves half the page in the other theme.
 *
 * Three options rather than a switch, because "system" is the honest default —
 * a phone set to dark all evening should not be fought by the page.
 */

type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "rti-copilot:theme";

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  root.classList.toggle("dark", dark);
  root.setAttribute("data-theme", dark ? "dark" : "light");
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    return (window.localStorage.getItem(STORAGE_KEY) as Theme) ?? "system";
  } catch {
    // Private browsing: fall back to following the system.
    return "system";
  }
}

/**
 * `compact` shrinks the chips from a 48px touch target to 32px, to sit in the
 * utility strip beside the text-size and contrast controls, which are already
 * at that scale.
 *
 * It is opt-in rather than the default because 48px is the size these should
 * be wherever a finger is the input. The strip is a dense mouse-and-keyboard
 * row on desktop and wraps to its own line on a phone, where the buttons
 * still have space around them — 32px there is the same trade the A− A A+
 * chips beside it already make.
 */
export function ThemeToggle({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    setMounted(true);
    setTheme(readStoredTheme());
  }, []);

  useEffect(() => {
    applyTheme(theme);

    // Keep following the OS while the choice is "system".
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  function choose(next: Theme) {
    setTheme(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not being able to remember it is survivable; applying it is not.
    }
  }

  const OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: t("theme.light") },
    { value: "dark", icon: Moon, label: t("theme.dark") },
    { value: "system", icon: Monitor, label: t("theme.system") },
  ];

  return (
    <div
      role="group"
      aria-label={t("theme.label")}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg bg-muted p-[3px]",
        compact ? "" : "p-1",
        className
      )}
    >
      {OPTIONS.map((option) => {
        const active = mounted ? theme === option.value : option.value === "system";
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => choose(option.value)}
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
            className={cn(
              "grid cursor-pointer place-items-center rounded-md transition-colors",
              compact ? "size-7" : "min-h-11 min-w-11",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active ? "bg-card text-foreground font-semibold shadow-sm ring-1 ring-border/60" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <option.icon aria-hidden="true" className={compact ? "size-3.5" : "size-4"} />
          </button>
        );
      })}
    </div>
  );
}
