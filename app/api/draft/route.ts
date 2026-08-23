import { NextResponse } from "next/server";
import { draftApplication } from "@/lib/server/ai";
import { getAuthorityById } from "@/lib/server/authorities";
import { checkGrievance } from "@/lib/server/limits";

export async function POST(request: Request) {
  const body = await request.json();
  const grievance = typeof body.grievance === "string" ? body.grievance.trim() : "";
  const authorityId = typeof body.authorityId === "string" ? body.authorityId : "";
  const extractedReferences = Array.isArray(body.extractedReferences) ? body.extractedReferences : [];

  const authority = getAuthorityById(authorityId);
  if (!authority) {
    return NextResponse.json({ error: "Unknown or missing authority selection." }, { status: 400 });
  }
  const rejection = checkGrievance(grievance);
  if (rejection) {
    return NextResponse.json({ error: rejection.error }, { status: rejection.status });
  }

  const draft = await draftApplication(grievance, authority, extractedReferences);
  return NextResponse.json(draft);
}
