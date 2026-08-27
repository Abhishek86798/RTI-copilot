import { NextResponse } from "next/server";

import { createChallenge } from "@/lib/server/auth/captcha";

export async function GET() {
  return NextResponse.json(createChallenge(), {
    headers: { "cache-control": "no-store" },
  });
}
