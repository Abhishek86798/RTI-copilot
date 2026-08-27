import type { LucideIcon } from "lucide-react";

import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

/**
 * Section and body vocabulary for the reading pages — the guide, the FAQ, the
 * contact page, the fee explainer, and the honesty page.
 *
 * These five had each hand-rolled the same idiom: a `<Rule />`, a mono heading
 * with an icon and `pt-8`, then a `prose-measure … opacity-75` wrapper. Five
 * copies meant five slightly different rhythms, and the first copy on every
 * page drew a hairline immediately below the one `PageTitle` already draws —
 * two rules with an empty band between them, which reads as a mistake rather
 * than a division.
 *
 * Deliberately not in `components/editorial`: that module is `"use client"`,
 * and these pages are Server Components. Nothing here needs the browser, so
 * keeping it server-rendered costs the reader no JavaScript.
 */

export function Section({
  label,
  icon: Icon,
  description,
  children,
  className,
}: {
  label: string;
  icon?: LucideIcon;
  /** Optional standfirst, under the heading. */
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Panel className={className}>
      <PanelHeader
        title={
          <span className="flex items-center gap-2">
            {Icon && <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}
            {label}
          </span>
        }
        description={description}
      />
      <PanelBody>{children}</PanelBody>
    </Panel>
  );
}

/**
 * Running text at one measure, one leading, one weight.
 *
 * Lists use `list-outside` with real padding so a wrapped line aligns under
 * the text rather than under the bullet — `list-inside`, which these pages
 * were using, puts the second line back at the marker's left edge and breaks
 * the left rag of every multi-line item.
 */
export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-3 text-sm leading-prose text-muted-foreground",
        "[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4",
        "[&_ul]:list-outside [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-4 [&_ul]:marker:text-border",
        "[&_ol]:list-outside [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-4 [&_ol]:marker:text-border",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * A numbered list of steps, aligned so the text column is straight regardless
 * of how tall each step runs.
 */
export function Steps({
  items,
  className,
}: {
  items: { title: string; body: string }[];
  className?: string;
}) {
  return (
    /*
      Two columns from `sm`. A numbered step is a short title and two lines of
      body — set one per row it produced a column of mostly empty space and
      three screens of scrolling for six steps. The numerals keep the reading
      order unambiguous across the wrap.
    */
    <ol className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <li key={item.title} className="flex gap-4">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs tabular-nums"
          >
            {index + 1}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight">
              {item.title}
            </h3>
            <p className="mt-1.5 text-sm leading-prose text-muted-foreground">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * A callout that must not inherit the muted body treatment around it — the
 * "no money changes hands here" notice is the most important sentence on the
 * fee page and was being rendered at 75% opacity inside a `Prose` block.
 */
export function Callout({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-warning/30 bg-warning/10 p-5 sm:p-6",
        className
      )}
    >
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <div className="mt-2 space-y-3 text-sm opacity-90">
        {children}
      </div>
    </div>
  );
}
