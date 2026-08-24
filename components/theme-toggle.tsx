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

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    let stored: Theme = "system";
    try {
      stored = (window.localStorage.getItem(STORAGE_KEY) as Theme) ?? "system";
    } catch {
      // Private browsing: fall back to following the system.
    }
    setTheme(stored);
    applyTheme(stored);

    // Keep following the OS while the choice is "system".
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (stored === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

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
        "inline-flex items-center rounded-lg border border-border bg-card p-0.5",
        className
      )}
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => choose(option.value)}
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
            className={cn(
              "grid min-h-12 min-w-12 cursor-pointer place-items-center rounded-md transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <option.icon aria-hidden="true" className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
