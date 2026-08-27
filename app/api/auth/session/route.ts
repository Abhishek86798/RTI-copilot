import { NextResponse } from "next/server";

import { currentUser } from "@/lib/server/auth/current-user";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/server/auth/session";

export async function GET() {
  return NextResponse.json(
    { email: await currentUser() },
    { headers: { "cache-control": "no-store" } }
  );
}

/** Sign out. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
