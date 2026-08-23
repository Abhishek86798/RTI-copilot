"use client";

import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Card in the UX4G design system, with the same API as `components/ui/card`.
 *
 * Deliberately API-compatible so a screen converts by changing one import
 * line rather than being rewritten — the point of migrating page by page is
 * that a half-migrated app still works.
 */

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      // solid, not outline: it carries the background, border and elevation
      // the screens had before, so converting a page does not quietly flatten
      // it against the page background.
      className={cn("ux4g-card ux4g-card-solid ux4g-card-vertical", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("ux4g-card-header", className)} {...props} />;
}

/**
 * `as` sets the heading level. Card titles sit at different depths on
 * different screens, and the level has to follow the document outline rather
 * than the component — a screen reader navigates by that outline, and
 * check:ui enforces exactly one h1 per page.
 */
export function CardTitle({
  as: Tag = "h3",
  className,
  ...props
}: ComponentProps<"h3"> & { as?: "h1" | "h2" | "h3" | "h4" }) {
  return <Tag className={cn("ux4g-card-title", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("ux4g-card-sub-title", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("ux4g-card-body", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("ux4g-card-footer", className)} {...props} />;
}

/** Kept for API parity with the shadcn card; UX4G has no direct equivalent. */
export function CardAction({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("ux4g-card-action", className)} {...props} />;
}
