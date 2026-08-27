/**
 * The one measure, and the padding a page hangs off it.
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
 */

/**
 * Measure and gutters. The header, the footer, every page and every landing
 * band align to this and to nothing else.
 *
 * They used not to. The chrome ran to 1,408px while page content stopped at
 * 896, so the wordmark, the nav and the footer columns all began nearly 160px
 * to the left of the page's own title — every screen had two competing left
 * edges, which is most of why the app read as unstructured rather than as one
 * document.
 *
 * 1,152px, because that is about as wide as a column of running text can go
 * before it needs help. Past it, prose is capped inside a section rather than
 * the frame being widened further.
 */
export const PAGE_FRAME = "mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10";

/**
 * A page's outer wrapper: the frame, plus vertical breathing room.
 *
 * Deliberately tight at the top. The two bars of chrome above it already cost
 * ~90px before a page says anything, and a first screen that opens on its own
 * heading rather than on empty space is worth more than the air.
 */
export const PAGE_LAYOUT = `${PAGE_FRAME} pt-5 pb-14 sm:pt-7 sm:pb-20`;

/*
 * There is deliberately only one measure.
 *
 * A second, wider one was introduced so the drafting step could put the
 * citizen's own words beside the draft. It spread: the drafting journey ended
 * up 1,152 pixels wide while the ten pages around it were 896, so the frame
 * changed width depending on which page you were on. Content that fills one
 * measure everywhere is worth more than an extra 256 pixels on one screen.
 */
