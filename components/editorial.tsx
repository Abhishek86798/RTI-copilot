"use client";

import { Reveal } from "@/components/reveal";
import { PAGE_FRAME } from "@/components/page-layout";
import { cn } from "@/lib/utils";

/**
 * The editorial layer that sits on top of the UX4G design system.
 *
 * UX4G supplies the tokens, the controls and the accessibility floor. What it
 * does not supply is a shared sense of rhythm — so the spacing scale lives
 * here, in one file, and every page composes from it. That is the point of the
 * module: when a page hand-rolls its own padding, the app stops feeling like
 * one product by the third screen.
 *
 * The structure is Swiss. A 1px hairline in `--border` does the work cards and
 * shadows would otherwise do, headings run large and tightly tracked, and
 * labels are small spaced capitals. Quiet, and cheap in ink.
 *
 * THE SCALE — compose from these rather than inventing a value:
 *   Frame      horizontal measure, one for the whole app
 *   PAGE_LAYOUT  standard page wrapper (components/page-layout.ts)
 *   Stack      vertical rhythm between blocks inside a page
 *   Band       full-bleed section, hairline-separated
 */

/**
 * Horizontal measure. Every page, band and bar aligns to this and nothing else.
 *
 * It takes no width option any more. There used to be a `wide` for landing
 * bands and a `text` for reading pages, and the result was chrome that ran
 * 160px wider than the content it framed — two left edges on every screen.
 * Reading width is now handled where it belongs, by capping prose inside a
 * section rather than by narrowing the whole frame.
 */
export function Frame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(PAGE_FRAME, className)}>{children}</div>;
}

/*
 * PAGE_LAYOUT deliberately does NOT live here. This is a client module, and a
 * plain constant exported from one reaches a Server Component as `undefined`.
 * It sits in `components/page-layout.ts` so both sides can import it.
 */

/**
 * Vertical rhythm between blocks. Three steps, deliberately few — a scale with
 * eight options is a scale nobody follows.
 */
export function Stack({
  children,
  gap = "md",
  className,
}: {
  children: React.ReactNode;
  gap?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div
      className={cn(
        { sm: "space-y-5", md: "space-y-10", lg: "space-y-14 lg:space-y-20" }[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

/** Full-bleed band. `frame` draws the hairline that separates it from the next. */
export function Band({
  id,
  children,
  className,
  tone = "default",
  frame = true,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "alt" | "invert";
  frame?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20",
        frame && "border-t border-border",
        tone === "alt" && "bg-card",
        tone === "invert" && "border-foreground bg-foreground text-background",
        className
      )}
    >
      {children}
    </section>
  );
}

/**
 * "01 THE PROBLEM / 05". Small, tracked, and paired with the count so a reader
 * can see how much of the argument is left before committing to it.
 */
export function Marker({
  index,
  total,
  label,
  className,
  dim = true,
}: {
  index?: number;
  total?: number;
  label: string;
  className?: string;
  /**
   * Markers are muted by default. Pass false when the caller has given the
   * marker a status colour — `--destructive` and `--success` are mid-tone
   * already, and dimming them to 75% drops the label under 4.5:1.
   */
  dim?: boolean;
}) {
  return (
    <p
      className={cn(
        "flex items-baseline gap-3 font-mono text-[0.75rem] tracking-[0.16em] uppercase",
        className
      )}
    >
      {index !== undefined && <span>{String(index).padStart(2, "0")}</span>}
      <span className={dim ? "opacity-75" : undefined}>{label}</span>
      {total !== undefined && (
        <span className="opacity-72">/ {String(total).padStart(2, "0")}</span>
      )}
    </p>
  );
}

/**
 * Display heading. Capped near 19 characters a line — a long headline set
 * across the full measure is unreadable no matter how large it is.
 */
export function Display({
  children,
  className,
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Tag
      className={cn(
        "max-w-[20ch] text-[1.9rem] leading-[1.05] font-bold tracking-[-0.02em] text-balance",
        "sm:text-[2.3rem] lg:text-[2.8rem]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * A page-level title, for the routes that are tools rather than argument.
 * Smaller than `Display`, so a form screen does not shout at someone who is
 * already mid-task.
 */
export function PageTitle({
  children,
  lead,
  marker,
  className,
}: {
  children: React.ReactNode;
  lead?: React.ReactNode;
  marker?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("border-b border-border pb-6", className)}>
      {marker && <div className="mb-3">{marker}</div>}
      {/*
        28px, down from 36. A page title is a label for what you are looking
        at, not an argument — at display size on a form it shouted, and it cost
        a third of the first screen before any content appeared.
      */}
      <h1 className="max-w-[30ch] text-[1.5rem] leading-[1.15] font-bold tracking-[-0.02em] text-balance sm:text-[1.75rem]">
        {children}
      </h1>
      {lead && (
        <p className="mt-3 max-w-[74ch] text-[0.9375rem] leading-[1.7] opacity-75 sm:text-base">
          {lead}
        </p>
      )}
    </header>
  );
}

/**
 * A statistic. The numeral is the point, so it gets display size; the source
 * is a required prop, because an unsourced figure on a page about government
 * accountability undercuts the argument it is making.
 */
export function Stat({
  value,
  label,
  source,
  className,
}: {
  value: string;
  label: string;
  source: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <p className="text-[1.9rem] leading-[1] font-bold tracking-[-0.03em] tabular-nums sm:text-[2.4rem]">
        {value}
      </p>
      <p className="mt-4 text-sm leading-snug font-medium">{label}</p>
      <p className="mt-2 text-xs leading-relaxed opacity-75">{source}</p>
    </div>
  );
}

/**
 * A row of cells divided by hairlines rather than gaps.
 *
 * Dividers are left borders on every cell after the first, suppressed at each
 * row start, so the grid stays correct as it reflows from four columns to two
 * to one. The first cell of each row also loses its left padding, which keeps
 * every row flush with the page measure instead of floating inside it.
 */
export function RuleGrid({
  children,
  cols = 4,
  className,
}: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const layout = {
    2: "sm:grid-cols-2 [&>*]:sm:border-l [&>*:nth-child(2n+1)]:sm:border-l-0 [&>*:nth-child(2n+1)]:sm:pl-0",
    3: "sm:grid-cols-2 lg:grid-cols-3 [&>*]:sm:border-l [&>*:nth-child(2n+1)]:sm:border-l-0 [&>*:nth-child(2n+1)]:sm:pl-0 [&>*:nth-child(2n+1)]:lg:border-l [&>*:nth-child(2n+1)]:lg:pl-8 [&>*:nth-child(3n+1)]:lg:border-l-0 [&>*:nth-child(3n+1)]:lg:pl-0",
    4: "sm:grid-cols-2 lg:grid-cols-4 [&>*]:sm:border-l [&>*:nth-child(2n+1)]:sm:border-l-0 [&>*:nth-child(2n+1)]:sm:pl-0 [&>*:nth-child(2n+1)]:lg:border-l [&>*:nth-child(2n+1)]:lg:pl-8 [&>*:nth-child(4n+1)]:lg:border-l-0 [&>*:nth-child(4n+1)]:lg:pl-0",
  }[cols];

  return (
    <div
      className={cn(
        "grid grid-cols-1 [&>*]:border-border [&>*]:border-b [&>*]:py-7 sm:[&>*]:border-b-0",
        "[&>*]:sm:px-8",
        layout,
        className
      )}
    >
      {children}
    </div>
  );
}

/** A hairline. Its own component so pages never hand-roll a border. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-border", className)} />;
}

/** Reveal re-exported so pages import their layout vocabulary from one place. */
export { Reveal };
