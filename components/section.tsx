"use client";

import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

/**
 * The page's editorial rhythm, in one place.
 *
 * Government sites go wrong in one of two directions: everything crammed edge
 * to edge so nothing has a hierarchy, or so much decoration that the content
 * disappears. This aims between them — wide gutters, a hard limit on line
 * length, and a numbered marker on every section so a reader always knows
 * where they are in the argument and how much is left.
 *
 * The numbering is not decoration. This page makes a five-part case to someone
 * who is already sceptical of government websites, and a visible "02 / 05"
 * tells them how long that case is before they commit to reading it.
 */

export function Section({
  id,
  children,
  className,
  tone = "default",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  /** `alt` lifts the band onto the card colour to separate it from its neighbours. */
  tone?: "default" | "alt" | "invert";
}) {
  return (
    <section
      id={id}
      className={cn(
        // Generous, and it grows with the viewport rather than staying fixed —
        // the whole point of the wide layout is lost at 1440 if the padding
        // was tuned for 768.
        "scroll-mt-24 py-20 sm:py-28 lg:py-36",
        tone === "alt" && "bg-card",
        tone === "invert" && "bg-primary text-primary-foreground",
        className
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12">{children}</div>
    </section>
  );
}

export function SectionHeader({
  index,
  total,
  eyebrow,
  title,
  lead,
  className,
  invert = false,
}: {
  /** Zero-padded on render: 1 becomes "01". */
  index?: number;
  total?: number;
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
  invert?: boolean;
}) {
  return (
    <Reveal className={cn("mb-12 lg:mb-16", className)}>
      {(index !== undefined || eyebrow) && (
        <div
          className={cn(
            "mb-5 flex items-center gap-3 text-xs font-semibold tracking-[0.14em] uppercase",
            invert ? "text-primary-foreground/85" : "text-muted-foreground"
          )}
        >
          {index !== undefined && (
            <>
              <span className={invert ? "text-primary-foreground" : "text-primary"}>
                {String(index).padStart(2, "0")}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "h-px w-8",
                  invert ? "bg-primary-foreground/40" : "bg-border"
                )}
              />
            </>
          )}
          {eyebrow && <span>{eyebrow}</span>}
          {total !== undefined && (
            <span className={invert ? "text-primary-foreground/75" : "text-muted-foreground"}>
              / {String(total).padStart(2, "0")}
            </span>
          )}
        </div>
      )}

      {/*
        Large, tightly-led, and capped at ~18 characters per line on desktop.
        A 60-character headline set across a 1200px measure is unreadable no
        matter how big it is.
      */}
      <h2
        className={cn(
          "max-w-[20ch] text-3xl leading-[1.1] font-bold tracking-tight text-balance",
          "sm:text-4xl lg:text-[2.75rem]"
        )}
      >
        {title}
      </h2>

      {lead && (
        <p
          className={cn(
            "mt-6 max-w-[52ch] text-lg leading-relaxed sm:text-xl",
            invert ? "text-primary-foreground/90" : "text-muted-foreground"
          )}
        >
          {lead}
        </p>
      )}
    </Reveal>
  );
}

/**
 * A large statistic with its source underneath.
 *
 * Every figure on this page has to be attributable — an unsourced number on a
 * page about government accountability undercuts the entire argument — so the
 * caption is a required prop rather than an optional one.
 */
export function Stat({
  value,
  label,
  source,
  invert = false,
}: {
  value: string;
  label: string;
  source: string;
  invert?: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          "text-4xl font-bold tracking-tight tabular-nums sm:text-5xl",
          invert ? "text-primary-foreground" : "text-primary"
        )}
      >
        {value}
      </p>
      <p className={cn("mt-3 text-base font-medium", invert && "text-primary-foreground")}>
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-sm",
          invert ? "text-primary-foreground/85" : "text-muted-foreground"
        )}
      >
        {source}
      </p>
    </div>
  );
}
