import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * 40px, the one control height in the app — buttons, selects and inputs all
 * sit on it, so a row of them has a single baseline.
 *
 * Font size stays at 16px on mobile because iOS Safari zooms the whole page in
 * when you focus an input smaller than that, which throws the layout sideways
 * mid-form. It drops to 14px from `md`, where no such thing happens.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-base transition-colors outline-none md:text-sm",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
        "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
