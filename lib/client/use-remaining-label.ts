"use client";

import type { Remaining } from "./deadlines";
import { useI18n } from "./i18n";

/**
 * Renders a `Remaining` descriptor in the reader's language.
 *
 * Singular and plural are separate keys rather than an "s" appended to a
 * count, because Hindi does not form plurals that way and "1 दिनs" is the kind
 * of detail that makes a translated interface feel machine-made.
 */
export function useRemainingLabel(): (remaining: Remaining) => string {
  const { t } = useI18n();

  return (remaining) => {
    switch (remaining.kind) {
      case "overdue-today":
        return t("time.overdueToday");
      case "overdue":
        return remaining.days === 1
          ? t("time.overdueOne")
          : t("time.overdueMany", { days: remaining.days });
      case "hours":
        return remaining.hours === 1
          ? t("time.hourLeft")
          : t("time.hoursLeft", { hours: remaining.hours });
      case "days":
        return remaining.days === 1
          ? t("time.dayLeft")
          : t("time.daysLeft", { days: remaining.days });
    }
  };
}
