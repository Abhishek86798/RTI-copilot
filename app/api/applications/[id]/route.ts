import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth/current-user";
import { isDatabaseConfigured } from "@/lib/server/db";
import {
  deleteApplication,
  getApplication,
  updateApplication,
} from "@/lib/server/db/applications";

type Params = { params: Promise<{ id: string }> };

async function guard() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }
  const userId = await currentUser();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return userId;
}

export async function GET(_request: Request, { params }: Params) {
  const userId = await guard();
  if (typeof userId !== "string") return userId;

  const application = await getApplication(userId, (await params).id);
  if (!application) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ application });
}

export async function PATCH(request: Request, { params }: Params) {
  const userId = await guard();
  if (typeof userId !== "string") return userId;

  const body = await request.json().catch(() => null);
  if (!body?.patch) {
    return NextResponse.json({ error: "A patch is required." }, { status: 400 });
  }

  // The clock is the one number that must be true: a demo fast-forward can
  // never be set through the API on a real application.
  delete body.patch.simulatedDaysElapsed;
  delete body.patch.isDemo;

  const application = await updateApplication(userId, (await params).id, body.patch);
  if (!application) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ application });
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await guard();
  if (typeof userId !== "string") return userId;

  const deleted = await deleteApplication(userId, (await params).id);
  if (!deleted) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
