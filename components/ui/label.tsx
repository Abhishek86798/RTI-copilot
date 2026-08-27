import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A visible label on every control, always. Placeholder-only inputs lose their
 * label the moment someone starts typing, which is exactly when a first-time
 * filer is least sure what the field wanted.
 */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-foreground select-none",
        "has-[+:disabled]:opacity-60",
        className
      )}
      {...props}
    />
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
