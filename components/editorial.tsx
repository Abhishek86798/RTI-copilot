"use client";

import Image from "next/image";

import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

/**
 * The editorial layer that sits on top of the UX4G design system.
 *
 * UX4G supplies the tokens, the controls and the accessibility floor. What it
 * does not supply is a way to lay out a page that has to persuade before it
 * can be used — so the structure here is Swiss: a visible hairline grid, very
 * large tight headings, small tracked labels, and numerals given the space
 * they deserve.
 *
 * The rules are the whole system. A 1px border in `--border` between every
 * cell does the work that boxes and shadows would otherwise do, which keeps
 * the page quiet, keeps the ink budget low, and survives being printed.
 */

/** Full-bleed band. `frame` adds the hairline that separates it from the next. */
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

/** The measure everything aligns to. Wide, with generous gutters. */
export function Frame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12", className)}>
      {children}
    </div>
  );
}

/**
 * "01 — THE PROBLEM". Small, tracked, and always paired with the count, so a
 * reader can see how much of the argument is left before committing to it.
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
   * Markers are muted by default. Set false when the caller has given the
   * marker a status colour — `--destructive` and `--success` are mid-tone
   * already, and dimming them to 75% drops the label under 4.5:1.
   */
  dim?: boolean;
}) {
  return (
    <p
      className={cn(
        "flex items-baseline gap-3 font-mono text-[0.68rem] tracking-[0.18em] uppercase",
        className
      )}
    >
      {index !== undefined && (
        <span className="opacity-100">{String(index).padStart(2, "0")}</span>
      )}
      <span className={dim ? "opacity-75" : undefined}>{label}</span>
      {total !== undefined && (
        <span className="opacity-72">/ {String(total).padStart(2, "0")}</span>
      )}
    </p>
  );
}

/**
 * Display heading. Capped near 20 characters a line — a long headline set
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
        "max-w-[19ch] text-[2.15rem] leading-[0.98] font-bold tracking-[-0.02em] text-balance",
        "sm:text-[3rem] lg:text-[3.9rem]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * A statistic. The numeral is the point, so it gets display size; the source
 * is a required prop because an unsourced figure on a page about government
 * accountability undercuts the argument it is making.
 */
export function Figure({
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
      <p className="text-[2.5rem] leading-[0.95] font-bold tracking-[-0.03em] tabular-nums sm:text-[3.25rem]">
        {value}
      </p>
      <p className="mt-4 text-sm leading-snug font-medium">{label}</p>
      <p className="mt-1.5 text-xs leading-snug opacity-75">{source}</p>
    </div>
  );
}

/**
 * A row of cells divided by hairlines rather than gaps.
 *
 * The dividers are drawn as left borders on every cell after the first, and
 * suppressed at each row start, so the grid stays correct when it reflows from
 * four columns to two to one.
 */
export function RuleGrid({
  children,
  cols = 4,
  className,
}: {
  children: React.ReactNode;
  /** Columns at the widest breakpoint. */
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const layout = {
    2: "sm:grid-cols-2 [&>*]:sm:border-l [&>*:nth-child(2n+1)]:sm:border-l-0",
    3: "sm:grid-cols-2 lg:grid-cols-3 [&>*]:sm:border-l [&>*:nth-child(2n+1)]:sm:border-l-0 [&>*:nth-child(2n+1)]:lg:border-l [&>*:nth-child(3n+1)]:lg:border-l-0",
    4: "sm:grid-cols-2 lg:grid-cols-4 [&>*]:sm:border-l [&>*:nth-child(2n+1)]:sm:border-l-0 [&>*:nth-child(2n+1)]:lg:border-l [&>*:nth-child(4n+1)]:lg:border-l-0",
  }[cols];

  return (
    <div
      className={cn(
        "grid grid-cols-1 [&>*]:border-border [&>*]:px-0 [&>*]:py-8",
        "[&>*]:sm:px-7 [&>*:nth-child(2n+1)]:sm:pl-0 [&>*]:lg:px-8",
        layout,
        className
      )}
    >
      {children}
    </div>
  );
}

/** A hairline. Its own component so the page never hand-rolls a border. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-border", className)} />;
}

/**
 * A documentary photograph with its caption and licence.
 *
 * Attribution is baked into the component rather than left to the caller. All
 * three photographs are CC BY or CC BY-SA, which require credit, and a product
 * whose entire pitch is transparency should not be sloppy about that. The
 * caption also states plainly that these are illustrative — nobody pictured is
 * an RTI applicant.
 */
export function Photo({
  src,
  alt,
  caption,
  credit,
  creditHref,
  width,
  height,
  priority = false,
  className,
  imageClassName,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  creditHref: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  sizes?: string;
}) {
  return (
    <figure className={cn("min-w-0", className)}>
      <div className="relative overflow-hidden bg-muted">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      </div>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-xs leading-relaxed">
        <span className="max-w-[52ch] opacity-75">{caption}</span>
        <a
          href={creditHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono tracking-wide uppercase opacity-72 underline-offset-4 hover:opacity-90 hover:underline"
        >
          {credit}
        </a>
      </figcaption>
    </figure>
  );
}

/** Reveal re-exported so pages import their layout vocabulary from one place. */
export { Reveal };
