import { NextResponse } from "next/server";

import { computeClock } from "@/lib/client/deadlines";
import { getAuthorityById } from "@/lib/server/authorities";
import {
  authorityCode,
  generateRegistrationNumber,
  validateFiling,
  FEE_RUPEES,
  type FilingReceipt,
  type FilingRequest,
} from "@/lib/server/filing-service";

/**
 * Simulated RTI submission (FR-15..FR-18).
 *
 * Nothing here reaches rtionline.gov.in or any public authority. The portal
 * has no public write API and interfering with a live government system is out
 * of bounds, so filing is simulated — which is also what lets a reviewer finish
 * the journey instead of being handed off at the hardest step.
 *
 * What is real: the validation rules, the registration number format, the
 * persisted record, and the statutory clock, which starts from this server's
 * timestamp rather than a date the citizen types in afterwards.
 */

/**
 * Stands in for the portal's per-authority sequence. A real portal reads this
 * from its own counter; a demo needs numbers that look right and do not
 * collide, and the clock is what has to be true here, not the sequence.
 */
function nextSequence(): number {
  return Math.floor(Math.random() * 90000) + 10000;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    filing?: FilingRequest;
  } | null;

  const filing = body?.filing;
  if (!filing) {
    return NextResponse.json({ error: "A filing is required." }, { status: 400 });
  }

  const problems = validateFiling(filing);
  if (problems.length > 0) {
    // 422: understood, and refused for reasons the citizen can act on. Every
    // problem is returned at once — a form that reveals its objections one
    // reload apart is the experience this product exists to replace.
    return NextResponse.json({ problems }, { status: 422 });
  }

  const authority = getAuthorityById(filing.authorityId)!;
  const now = new Date();

  const registrationNumber = generateRegistrationNumber(
    authorityCode(filing.authorityId),
    nextSequence(),
    "request",
    now
  );

  // The clock runs from the moment of filing, per Section 7(1). Deriving it
  // here rather than trusting a typed-in date is the point of having a portal
  // at all: the filing date is the one fact an applicant cannot later prove.
  const clock = computeClock(
    {
      filedAt: now.toISOString(),
      lifeOrLibertyFlag: false,
      viaApio: false,
    },
    now
  );

  const receipt: FilingReceipt = {
    registrationNumber,
    filedAt: now.toISOString(),
    authorityName: authority.authorityName,
    ministry: authority.ministry,
    pioDesignation: authority.pioDesignation,
    feePaidRupees: filing.applicant.isBpl ? 0 : FEE_RUPEES,
    feeBasis: filing.applicant.isBpl ? "bpl-exempt" : "paid",
    responseDueBy: clock.responseDeadline.toISOString(),
    charCount: filing.requestText.trim().length,
  };

  return NextResponse.json({ receipt, simulated: true });
}
