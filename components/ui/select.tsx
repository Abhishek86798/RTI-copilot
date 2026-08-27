import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A native `<select>`, styled to match the inputs beside it.
 *
 * Native rather than a listbox built out of divs. The options here run to
 * thirty-six states and several hundred public authorities, and every platform
 * already has a fast, familiar, accessible picker for exactly that — one that
 * a screen reader announces correctly and Android renders as a full-screen
 * wheel. A custom one would be worse on every device that matters here.
 *
 * The chevron is drawn as a sibling rather than a background image so it
 * inherits the theme instead of being a hard-coded colour: the previous one
 * carried UX4G's `#171717` arrow on a `#fff` field, which in dark mode was a
 * black box in a row of grey ones.
 */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "h-10 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-input bg-card py-2 pr-9 pl-3 text-base transition-colors outline-none md:text-sm",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
          "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          "dark:bg-input/30",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

export { Select };
