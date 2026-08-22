import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Clerk throws on every request when no publishable key is configured, which
 * takes down the guest journey along with the signed-in one — the PRD lists
 * exactly that ("auth as a demo blocker") as a risk to mitigate, and guest
 * mode is meant to need zero external services.
 *
 * So the middleware is only installed when Clerk is actually configured. With
 * keys present this behaves exactly as before; without them the app still
 * serves the full guest flow instead of returning 500 on every route.
 */
const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

export default isClerkConfigured
  ? clerkMiddleware()
  : () => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
