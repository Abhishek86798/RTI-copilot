import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A visible label on every control, always. Placeholder-only inputs lose their
 * label the moment someone starts typing, which is exactly when a first-time
 * filer is least sure what the field wanted.
 *
 * `required` draws the red asterisk every Indian government form uses. It is
 * `aria-hidden`: a screen reader gets the requirement from the control's own
 * `required`/`aria-required`, and hearing "asterisk" after every other label
 * is noise, not information.
 */
function Label({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<"label"> & { required?: boolean }) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium text-foreground select-none",
        "has-[+:disabled]:opacity-60",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      )}
    </label>
  )
}

/** Help text under a label. Tie it to the control with `aria-describedby`. */
function FieldHint({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-hint"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * Errors sit next to the field they belong to, not in a summary at the top.
 * `role="alert"` so a screen reader announces it when it appears.
 */
function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    />
  )
}

export { Label, FieldHint, FieldError }
