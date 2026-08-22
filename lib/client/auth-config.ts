/**
 * Whether Clerk is configured for this deployment.
 *
 * Deliberately in its own module with no Clerk import of its own. Anything
 * that pulls `@clerk/nextjs` into the module graph throws at render time when
 * no publishable key is set — even if the component is never rendered — which
 * takes down the guest journey along with the signed-in one. Keeping the flag
 * importable without the SDK is what lets the app decide before loading it.
 *
 * `NEXT_PUBLIC_*` is inlined at build time, so this is a constant at runtime.
 */
export const isAuthConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);
