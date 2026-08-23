"use client";

import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * A button in the Government of India's UX4G design system.
 *
 * The migration bridge: screens move to UX4G one at a time, so this wraps the
 * official CSS classes in the same prop shape our own Button uses. Nothing
 * imports UX4G class strings directly, which keeps the class names in one file
 * when the next screen is converted.
 *
 * Size note — UX4G's `md` is 40px, below the 44px WCAG 2.5.5 target this app
 * holds itself to elsewhere. `lg` (48px) is the default here for that reason;
 * `md` stays available for genuinely secondary controls.
 */

type Variant =
  | "primary"
  | "outline-primary"
  | "tonal-primary"
  | "text-primary"
  | "danger"
  | "outline-danger";

type Size = "xl" | "lg" | "md" | "sm";

export function Ux4gButton({
  variant = "primary",
  size = "lg",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(`ux4g-btn-${variant}`, `ux4g-btn-${size}`, className)}
      {...props}
    />
  );
}

/** Same styling on a link, for navigation that should look like an action. */
export function Ux4gLinkButton({
  variant = "primary",
  size = "lg",
  className,
  ...props
}: ComponentProps<"a"> & { variant?: Variant; size?: Size }) {
  return (
    <a
      className={cn(
        `ux4g-btn-${variant}`,
        `ux4g-btn-${size}`,
        "ux4g-d-inline-flex ux4g-ai-center",
        className
      )}
      {...props}
    />
  );
}
