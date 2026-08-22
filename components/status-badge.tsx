"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileEdit,
  Gavel,
  Send,
  type LucideIcon,
} from "lucide-react";

import { useI18n, type StringKey } from "@/lib/client/i18n";
import type { ApplicationStatus } from "@/lib/client/types";
import { cn } from "@/lib/utils";

/**
 * Status shown as icon + colour + word, never colour alone (WCAG 1.4.1).
 * "Overdue" and "Awaiting response" have to be distinguishable in greyscale,
 * to a colour-blind reader, and read aloud — they mean very different things
 * about what the citizen should do next.
 */
const STATUS_STYLES: Record<
  ApplicationStatus,
  { icon: LucideIcon; className: string; labelKey: StringKey }
> = {
  drafting: {
    icon: FileEdit,
    className: "bg-muted text-muted-foreground",
    labelKey: "status.drafting",
  },
  filed: {
    icon: Send,
    className: "bg-info/12 text-info",
    labelKey: "status.filed",
  },
  "awaiting-response": {
    icon: Clock,
    className: "bg-info/12 text-info",
    labelKey: "status.awaiting-response",
  },
  overdue: {
    icon: AlertTriangle,
    className: "bg-destructive/12 text-destructive",
    labelKey: "status.overdue",
  },
  appealed: {
    icon: Gavel,
    className: "bg-warning/15 text-warning",
    labelKey: "status.appealed",
  },
  resolved: {
    icon: CheckCircle2,
    className: "bg-success/12 text-success",
    labelKey: "status.resolved",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  const { t } = useI18n();
  const style = STATUS_STYLES[status];
  const Icon = style.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        style.className,
        className
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {t(style.labelKey)}
    </span>
  );
}
