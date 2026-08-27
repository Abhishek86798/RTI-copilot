import { NextResponse } from "next/server";

/**
 * No auth middleware.
 *
 * Sessions are a signed cookie read per-route by `currentUser()`, so there is
 * nothing to intercept here: an unauthenticated request to an API route gets
 * its 401 from the route itself, and every page renders for signed-out and
 * guest visitors alike.
 *
 * The file stays because the matcher below still excludes static assets from
 * the middleware pass, and because the next thing that needs a request hook
 * (rate limiting, locale detection) belongs here rather than in a new file.
 */
export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
