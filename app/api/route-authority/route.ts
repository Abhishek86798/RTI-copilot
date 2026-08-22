import { NextResponse } from "next/server";
import { routeGrievance } from "@/lib/server/ai";

export async function POST(request: Request) {
  const body = await request.json();
  const grievance = typeof body.grievance === "string" ? body.grievance.trim() : "";

  if (grievance.split(/\s+/).filter(Boolean).length < 15) {
    return NextResponse.json(
      { error: "Please describe your grievance in at least 15 words so we can route it accurately." },
      { status: 400 }
    );
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
