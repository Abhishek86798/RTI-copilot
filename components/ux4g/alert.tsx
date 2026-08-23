"use client";

import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Alert in the UX4G design system, API-compatible with `components/ui/alert`.
 *
 * The variant names are ours, mapped to UX4G's: this app already uses
 * `destructive` throughout for the overdue-deadline notices, and renaming
 * every call site would be churn for nothing.
 */

type Variant = "default" | "info" | "success" | "warning" | "destructive";

const VARIANT_CLASS: Record<Variant, string> = {
  default: "ux4g-alert-info",
  info: "ux4g-alert-info",
  success: "ux4g-alert-success",
  warning: "ux4g-alert-warning",
  destructive: "ux4g-alert-error",
};

export function Alert({
  variant = "default",
  className,
  ...props
}: ComponentProps<"div"> & { variant?: Variant }) {
  return (
    <div
      role="alert"
      className={cn("ux4g-alert", VARIANT_CLASS[variant], className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("ux4g-alert-title", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("ux4g-alert-content", className)} {...props} />;
}

export function AlertAction({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("ux4g-alert-actions", className)} {...props} />;
}
