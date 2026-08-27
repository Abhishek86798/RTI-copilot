import { NextResponse } from "next/server";

import { verifyChallenge } from "@/lib/server/auth/captcha";
import { issueCode } from "@/lib/server/auth/otp";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const INDIAN_MOBILE = /^(\+91[-\s]?)?[6-9]\d{9}$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

  if (!EMAIL.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address — your sign-in code is sent there." },
      { status: 400 }
    );
  }

  /*
   * Phone is optional and never verified: the code goes to email only. It is
   * collected because the RTI application itself needs it, so asking once here
   * saves asking again at filing. Validated for shape so a typo surfaces now
   * rather than at the point of filing.
   */
  if (phone && !INDIAN_MOBILE.test(phone.replace(/\s/g, ""))) {
    return NextResponse.json(
      { error: "Enter a valid Indian mobile number, or leave it blank." },
      { status: 400 }
    );
  }

  if (!verifyChallenge(body?.captchaToken, String(body?.captchaAnswer ?? ""))) {
    return NextResponse.json(
      { error: "That answer was not right. Try the new question." },
      { status: 400 }
    );
  }

  const result = await issueCode(email);
  if (!result.ok) {
    return NextResponse.json(
      { error: `Wait ${result.retryAfterSeconds}s before asking for another code.` },
      { status: 429 }
    );
  }

  /*
   * `devCode` is returned only when the deployment cannot actually deliver
   * mail (see isDevOtpActive). Showing it beats a code the citizen waits for
   * and never receives, and the UI labels it as a development stand-in.
   */
  return NextResponse.json({ ok: true, delivery: result.delivery, devCode: result.devCode });
}
