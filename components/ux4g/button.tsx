"use client";

import { cloneElement, isValidElement, type ComponentProps, type ReactElement } from "react";

import { cn } from "@/lib/utils";

/**
 * A button in the Government of India's UX4G design system.
 *
 * API-compatible with `components/ui/button` — same variant, size, and
 * `render`/`nativeButton` props — so a screen converts by changing one import
 * line. That is what makes a page-by-page migration safe: a half-migrated app
 * still builds and still works.
 *
 * Size note — UX4G's `md` is 40px, below the 44px WCAG 2.5.5 target this app
 * holds itself to elsewhere. Our `lg` and `xl` map to UX4G sizes that clear
 * it (48px and 56px); `md` stays reachable for genuinely secondary controls.
 */

type Variant =
  | "default"
  | "cta"
  | "outline"
  | "ghost"
  | "destructive"
  | "secondary";

type Size = "xl" | "lg" | "md" | "sm";

/** Our variant vocabulary mapped onto UX4G's. */
const VARIANT_CLASS: Record<Variant, string> = {
  default: "ux4g-btn-primary",
  cta: "ux4g-btn-primary",
  outline: "ux4g-btn-outline-primary",
  ghost: "ux4g-btn-text-primary",
  destructive: "ux4g-btn-danger",
  secondary: "ux4g-btn-tonal-primary",
};

const SIZE_CLASS: Record<Size, string> = {
  xl: "ux4g-btn-xl",
  lg: "ux4g-btn-lg",
  md: "ux4g-btn-md",
  sm: "ux4g-btn-sm",
};

type ButtonProps = Omit<ComponentProps<"button">, "children"> & {
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
  /** Render as another element (a Link, say) while keeping button styling. */
  render?: ReactElement<{ className?: string }>;
  /** Present for API parity with the shadcn button; `render` implies it. */
  nativeButton?: boolean;
};

export function Button({
  variant = "default",
  size = "lg",
  className,
  render,
  nativeButton,
  ...props
}: ButtonProps) {
  const classes = cn(
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    // UX4G buttons are inline-flex already, but a rendered <a> needs it said.
    "ux4g-d-inline-flex ux4g-ai-center ux4g-jc-center ux4g-gap-xs",
    className
  );

  if (render && isValidElement(render)) {
    return cloneElement(render, {
      className: cn(classes, render.props.className),
    });
  }

  void nativeButton;
  return <button className={classes} {...props} />;
}

/** Explicit alias, for screens not yet migrated that want one UX4G button. */
export { Button as Ux4gButton };
