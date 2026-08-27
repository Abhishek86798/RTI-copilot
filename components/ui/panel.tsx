import { cn } from "@/lib/utils";

/**
 * A panel: the one container this app groups things into.
 *
 * Everything used to be separated by bare hairlines on a flat page — an
 * editorial treatment that reads as one long document rather than as a set of
 * things you deal with one at a time. A section had no edges, so its heading,
 * its help text and its fields were held together only by proximity, and on a
 * form with five of them you could never see where one stopped.
 *
 * A panel gives each one a boundary and a surface a shade above the page. That
 * is all it is: a rounded rectangle, a hairline, a header divided from a body.
 * The restraint is the point — one radius, one border, one surface, used the
 * same way on every screen.
 *
 * Deliberately not a client module: these pages are Server Components and
 * nothing here needs the browser.
 */
export function Panel({
  children,
  labelledBy,
  className,
}: {
  children: React.ReactNode;
  /** id of the heading inside, so the region is named. */
  labelledBy?: string;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      {children}
    </section>
  );
}

/**
 * The panel's header: what this panel is, and one line on why.
 *
 * The description sits under the title rather than beside it. Set alongside,
 * it competed with the title for the same glance; underneath, it is read once
 * and then skipped, which is what a standfirst is for.
 */
export function PanelHeader({
  title,
  description,
  eyebrow,
  actions,
  id,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Small mono label above the title, for numbered or named sequences. */
  eyebrow?: React.ReactNode;
  /** Trailing control, aligned to the title's baseline. */
  actions?: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-6 gap-y-2 border-b border-border px-4 py-3 sm:px-5",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 font-mono text-2xs tracking-[0.14em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        )}
        <h2 id={id} tabIndex={id ? -1 : undefined} className="text-base font-semibold">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-[72ch] text-sm leading-prose text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}

/** The panel's contents. One padding value, so panels never disagree. */
export function PanelBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-4 sm:p-5", className)}>{children}</div>;
}

/**
 * A list inside a panel, divided by hairlines and flush with its edges.
 *
 * Rows carry their own horizontal padding so the dividers reach the panel's
 * sides — a divider that stops short of the border reads as a mistake.
 */
export function PanelList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ul className={cn("divide-y divide-border", className)}>{children}</ul>
  );
}
