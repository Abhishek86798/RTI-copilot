import { NextResponse } from "next/server";
import { routeGrievance } from "@/lib/server/ai";
import { checkGrievance } from "@/lib/server/limits";

export async function POST(request: Request) {
  const body = await request.json();
  const grievance = typeof body.grievance === "string" ? body.grievance.trim() : "";

  const rejection = checkGrievance(grievance);
  if (rejection) {
    return NextResponse.json({ error: rejection.error }, { status: rejection.status });
  }

  const result = await routeGrievance(grievance);

  if (result.candidates.length === 0) {
    return NextResponse.json(
      { error: "We couldn't confidently match this to a Public Authority yet. Try adding more detail (which office, scheme, or department is involved)." },
      { status: 422 }
    );
  }

  return NextResponse.json(result);
}
