import { NextResponse } from "next/server";

import { verifyCode } from "@/lib/server/auth/otp";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  createSessionToken,
} from "@/lib/server/auth/session";

const MESSAGES = {
  invalid: "That code is not right. Check the email and try again.",
  expired: "That code has expired. Ask for a new one.",
  "too-many-attempts": "Too many wrong attempts. Ask for a new code.",
} as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const code = typeof body?.code === "string" ? body.code : "";

  if (!email || !code) {
    return NextResponse.json({ error: "Enter the code from your email." }, { status: 400 });
  }

  const result = verifyCode(email, code);
  if (result !== "ok") {
    return NextResponse.json({ error: MESSAGES[result] }, { status: 401 });
  }

  /*
   * A deployment with no AUTH_SECRET throws here rather than signing cookies
   * with a guessable key. Caught so the citizen gets a sentence instead of a
   * bare 500 whose only explanation is in a log they cannot read — the code
   * they were sent is spent by now, so an unexplained failure would look like
   * the code itself was wrong and send them round the loop again.
   */
  let token: string;
  try {
    token = createSessionToken(email);
  } catch (caught) {
    console.error("[auth] cannot sign session:", caught);
    return NextResponse.json(
      { error: "Sign-in is not configured on this deployment. You can keep using the tool without an account." },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ ok: true, email });
  response.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return response;
}
