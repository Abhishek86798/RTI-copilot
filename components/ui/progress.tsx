import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A determinate meter for the statutory countdown.
 *
 * Tone is passed in rather than derived from the value, because "most of the
 * bar is full" is good news on a download and bad news on a legal deadline.
 * The bar is decorative: `aria-hidden` here, with the real state carried by the
 * text label beside it, so a screen reader hears "6 days left", not "80%".
 */
function Progress({
  value,
  tone = "neutral",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** 0–100. */
  value: number
  tone?: "neutral" | "good" | "warning" | "danger"
}) {
  const clamped = Math.min(100, Math.max(0, value))

  const fill = {
    neutral: "bg-info",
    good: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
  }[tone]

  return (
    <div
      data-slot="progress"
      aria-hidden="true"
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", fill)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export { Progress }
