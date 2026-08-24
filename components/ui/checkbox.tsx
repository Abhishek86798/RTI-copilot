import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A native `<input type="checkbox">` rather than a scripted div.
 *
 * It is keyboard-operable, announced correctly by every screen reader, honours
 * Windows High Contrast mode, and still works if the JavaScript bundle fails
 * to load on a bad connection. `accent-color` gets it into the product palette
 * without giving up any of that.
 */
function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "size-5 shrink-0 cursor-pointer rounded-sm border-input accent-[var(--info)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
}

/**
 * Checkbox plus label as one 44px target, so the label text is tappable too.
 * Hitting a 20px box with a thumb is a coin flip.
 */
function CheckboxField({
  id,
  label,
  hint,
  className,
  ...props
}: React.ComponentProps<"input"> & { label: React.ReactNode; hint?: React.ReactNode }) {
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div className={cn("rounded-lg", className)}>
      <label
        htmlFor={id}
        className="flex min-h-12 cursor-pointer items-start gap-3 py-1.5 select-none"
      >
        <Checkbox id={id} aria-describedby={hintId} className="mt-0.5" {...props} />
        <span className="text-sm leading-snug font-medium">{label}</span>
      </label>
      {hint && (
        <p id={hintId} className="mt-0.5 ml-8 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}

export { Checkbox, CheckboxField }
