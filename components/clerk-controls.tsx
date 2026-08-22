"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

/**
 * The Clerk-dependent half of the header controls, kept in its own module so
 * `@clerk/nextjs` is only ever pulled in behind the `isAuthConfigured` check
 * in `components/auth-controls.tsx`. Do not import this file directly.
 */
export function ClerkControls() {
  return (
    <>
      <Show when="signed-out">
        {/* Two auth buttons plus the language toggle overflow a 375px header,
            so only the primary action shows on mobile. Sign in is still one
            tap from the sign-up screen. */}
        <SignInButton>
          <Button variant="ghost" size="xl" className="hidden sm:inline-flex">
            Sign in
          </Button>
        </SignInButton>
        <SignUpButton>
          <Button size="xl">Sign up</Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}
