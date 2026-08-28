import { cn } from "@/lib/utils";

/**
 * The page vocabulary: a header, and a grid to hang panels off.
 *
 * Two components, because a page needs exactly two decisions — what it is
 * called, and how its panels are arranged. Everything below that is a `Panel`.
 */

/**
 * A page header, set as one band rather than a stack.
 *
 * The eyebrow, title and standfirst used to run down the page: four elements,
 * each with its own margin, and about 190px before a page said anything. Set
 * across the measure — title on the left, standfirst on the right — it is
 * half the height and reads as one line of the document rather than as three
 * separate announcements.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Trailing control, aligned with the title's baseline. */
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "grid gap-x-10 gap-y-3 border-b border-border pb-5",
        lead && "lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 font-mono text-2xs tracking-[0.14em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-[28ch] text-2xl text-balance">
          {title}
        </h1>
      </div>

      {lead && (
        <p className="max-w-[62ch] text-sm leading-prose text-muted-foreground lg:pb-0.5">
          {lead}
        </p>
      )}

      {actions && <div className="lg:col-span-2">{actions}</div>}
    </header>
  );
}

/**
 * The panel grid.
 *
 * Two columns from `lg`, aligned to the top so a short panel does not stretch
 * to match a tall one beside it. This is the difference between a reference
 * page being three screens and being one and a half: the panels were the right
 * size all along, they were just queued single file down a 1,152px measure
 * with 700px of empty space beside every one of them.
 *
 * `one` for the pages where reading order matters more than height — a form,
 * or a sequence of steps that has to be followed in order.
 */
export function PageGrid({
  children,
  columns = 2,
  flow = false,
  className,
}: {
  children: React.ReactNode;
  columns?: 1 | 2;
  /**
   * Pack the cards instead of aligning them in rows.
   *
   * A two-column grid puts each pair on a shared row, so a short card beside
   * a long one leaves a hole under it the height of the difference. On a page
   * of five sections that ran to a screen of empty space and a last card
   * stranded beside nothing.
   *
   * CSS columns flow the cards top-to-bottom and fill the gaps. The trade is
   * reading order: columns read down then across, so use this only where the
   * cards are independent — a reference page, not a sequence.
   */
  flow?: boolean;
  className?: string;
}) {
  if (flow) {
    return (
      <div
        className={cn(
          "mt-5 gap-4",
          // `break-inside-avoid` on the children keeps a card from being split
          // across the column boundary.
          columns === 2 ? "lg:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid" : "",
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-5 grid items-start gap-4",
        columns === 2 && "lg:grid-cols-2",
        className
      )}
    >
      {children}
    </div>
  );
}
