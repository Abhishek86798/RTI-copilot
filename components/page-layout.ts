/**
 * The layout every page uses for its outer wrapper.
 *
 * This lives in its own module, with no `"use client"` directive, and that is
 * the whole reason the file exists. It used to sit in `components/editorial`,
 * which is a client module — and a plain value exported from a client module
 * arrives in a Server Component as `undefined`, because the bundler replaces
 * that module with a set of client references. Only components survive the
 * crossing; constants do not.
 *
 * So `cn(PAGE_LAYOUT)` quietly produced an empty string on every server-
 * rendered page. The five help pages had no measure, no gutters and no
 * centring at all, while the three client pages next to them looked correct.
 * Nothing errored, which is what made it survive review.
 *
 * Keep it importable from both sides: a page should never have to know whether
 * it is a Server or a Client Component to get its own margins right.
 *
 * Gutters match `Frame` in `components/editorial`, so a form page and a
 * landing band align to the same measure at every breakpoint.
 */
export const PAGE_LAYOUT =
  "mx-auto w-full max-w-4xl px-6 pt-6 pb-12 sm:px-12 sm:pt-10 sm:pb-20 lg:px-16 lg:pt-12 lg:pb-28";

/**
 * The same page, widened for a screen that puts two things side by side.
 *
 * Used by the drafting journey, where the draft and the citizen's original
 * words sit in adjacent columns. At the standard measure that split leaves
 * each column too narrow to read, so the step that needs the room gets it —
 * and the steps that do not still hold their content to a readable column of
 * their own, rather than letting a form stretch to 1100 pixels because one of
 * its siblings needed the space.
 *
 * Padding and vertical rhythm are identical to PAGE_LAYOUT, so moving between
 * a wide step and a narrow one does not shift the header or the step rule.
 */
export const PAGE_LAYOUT_WIDE =
  "mx-auto w-full max-w-6xl px-6 pt-6 pb-12 sm:px-12 sm:pt-10 sm:pb-20 lg:px-16 lg:pt-12 lg:pb-28";

/**
 * Readable column for content inside a wide page.
 *
 * `mx-auto` is the point of it. Without it the column pinned itself to the
 * left of the wider measure and left a third of the screen empty on the right,
 * so the steps that do not need the extra width looked misaligned against the
 * one that does.
 */
export const READABLE_COLUMN = "mx-auto w-full max-w-3xl";
