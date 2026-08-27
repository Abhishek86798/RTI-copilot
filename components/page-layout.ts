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
