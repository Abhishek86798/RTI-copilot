import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth/current-user";
import { isDatabaseConfigured } from "@/lib/server/db";
import { createApplication, listApplications } from "@/lib/server/db/applications";

/**
 * Signed-in applications. Guest mode never reaches here — it stays in
 * localStorage and needs no account, which is a PRD requirement, not a
 * fallback.
 */

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }
  const userId = await currentUser();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  return NextResponse.json({ applications: await listApplications(userId) });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }
  const userId = await currentUser();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.application?.id) {
    return NextResponse.json({ error: "An application is required." }, { status: 400 });
  }

  return NextResponse.json({
    application: await createApplication(userId, body.application),
  });
}
