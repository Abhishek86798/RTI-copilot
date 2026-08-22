import { NextResponse } from "next/server";
import { computeClock, formatDate } from "@/lib/client/deadlines";
import { buildFirstAppeal } from "@/lib/client/filing";
import { isDatabaseConfigured } from "@/lib/server/db";
import {
  listOpenApplications,
  markNotified,
  updateApplication,
} from "@/lib/server/db/applications";
import { appealWindowClosingMail, deadlineLapsedMail, sendMail } from "@/lib/server/email";

/**
 * Daily sweep: the piece that makes tracking actually follow through.
 *
 * Without it the deadline only exists if the citizen happens to come back and
 * look — which is the same position the Act already leaves them in.
 *
 * Deliberately reuses `computeClock` and `buildFirstAppeal` from the client
 * modules rather than restating either. They are plain TypeScript with no
 * browser dependency, and two implementations of the statutory clock would
 * eventually disagree about a date.
 */

/** Warn this many days before the s.19(1) appeal window shuts. */
const APPEAL_WARNING_DAYS = 7;

function baseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
}

export async function GET(request: Request) {
  // Vercel Cron signs its requests. Without this the endpoint is a public
  // trigger for sending mail to every user.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = request.headers.get("authorization");
    if (header !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  const open = await listOpenApplications();
  const now = new Date();
  let lapsed = 0;
  let closing = 0;
  const failures: string[] = [];

  for (const application of open) {
    if (!application.filedAt) continue;

    const clock = computeClock(
      {
        filedAt: application.filedAt,
        lifeOrLibertyFlag: application.lifeOrLibertyFlag,
        viaApio: application.viaApio,
        // Never read simulatedDaysElapsed here: demo rows are excluded from
        // the sweep, and a spoofed clock must not drive a real email.
      },
      now
    );

    if (!clock.isOverdue) continue;

    try {
      // Draft the appeal once, the moment the deadline lapses, so it is
      // waiting when the citizen opens the link in the email.
      if (!application.appeal) {
        const text = buildFirstAppeal({
          applicantName: application.applicant.fullName,
          applicantAddress: application.applicant.address,
          authority: application.authority,
          registrationNumber: application.registrationNumber,
          filedAtLabel: formatDate(application.filedAt),
          responseDeadlineLabel: formatDate(clock.responseDeadline),
          items: application.items,
          grounds: "deemed-refusal",
        });
        await updateApplication(application.userId, application.id, {
          status: "overdue",
          appeal: { draftedAt: now.toISOString(), grounds: "deemed-refusal", text },
        });
      }

      const to = application.applicant.email;
      const url = `${baseUrl()}/applications/${application.id}`;

      if (to && !application.deadlineNotifiedAt) {
        await sendMail(
          deadlineLapsedMail({
            to,
            name: application.applicant.fullName,
            authorityName: application.authority.authorityName,
            filedAtLabel: formatDate(application.filedAt),
            deadlineLabel: formatDate(clock.responseDeadline),
            appealDeadlineLabel: formatDate(clock.appealDeadline),
            url,
          })
        );
        await markNotified(application.id, "deadlineNotifiedAt");
        lapsed++;
        continue;
      }

      // Second nudge as the appeal window runs out — the point after which
      // appealing needs a condonation plea.
      const daysLeft = Math.ceil(
        (clock.appealDeadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (
        to &&
        !application.appealNotifiedAt &&
        daysLeft > 0 &&
        daysLeft <= APPEAL_WARNING_DAYS
      ) {
        await sendMail(
          appealWindowClosingMail({
            to,
            name: application.applicant.fullName,
            authorityName: application.authority.authorityName,
            appealDeadlineLabel: formatDate(clock.appealDeadline),
            daysLeft,
            url,
          })
        );
        await markNotified(application.id, "appealNotifiedAt");
        closing++;
      }
    } catch (error) {
      // One bad row must not stop the sweep for everyone else.
      failures.push(`${application.id}: ${(error as Error).message}`);
    }
  }

  return NextResponse.json({
    scanned: open.length,
    deadlineNotices: lapsed,
    appealWarnings: closing,
    failures,
  });
}
