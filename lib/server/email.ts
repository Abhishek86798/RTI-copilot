import { Resend } from "resend";

/**
 * Deadline mail.
 *
 * Falls back to logging when RESEND_API_KEY is absent, so the sweep is fully
 * testable before a sender domain is verified. Wiring the real key later is a
 * config change, not a code change.
 */

const FROM = process.env.RESEND_FROM ?? "RTI Copilot <onboarding@resend.dev>";

export type Mail = { to: string; subject: string; text: string };

export async function sendMail(mail: Mail): Promise<"sent" | "logged"> {
  if (!process.env.RESEND_API_KEY) {
    console.info(`[email:logged] to=${mail.to} subject=${mail.subject}\n${mail.text}`);
    return "logged";
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: FROM, ...mail });
  if (error) throw new Error(`Resend failed: ${error.message}`);
  return "sent";
}

export function deadlineLapsedMail(params: {
  to: string;
  name: string;
  authorityName: string;
  filedAtLabel: string;
  deadlineLabel: string;
  appealDeadlineLabel: string;
  url: string;
}): Mail {
  return {
    to: params.to,
    subject: `Your RTI deadline has passed — you can now appeal`,
    text: `Dear ${params.name || "applicant"},

The ${params.authorityName} has not replied to the RTI application you filed on ${params.filedAtLabel}. The period allowed by Section 7(1) of the Right to Information Act, 2005 expired on ${params.deadlineLabel}.

Under Section 7(2), that silence is a "deemed refusal". You do not have to wait any longer, and you do not have to pay anything to challenge it.

You can file a First Appeal under Section 19(1) at no fee. Your appeal must be lodged by ${params.appealDeadlineLabel} — after that it needs a separate plea to condone the delay.

Your appeal is already drafted and ready to review here:
${params.url}

This is an automated reminder from RTI Copilot, an independent drafting aid. It is not legal advice.`,
  };
}

export function appealWindowClosingMail(params: {
  to: string;
  name: string;
  authorityName: string;
  appealDeadlineLabel: string;
  daysLeft: number;
  url: string;
}): Mail {
  return {
    to: params.to,
    subject: `${params.daysLeft} days left to appeal your RTI application`,
    text: `Dear ${params.name || "applicant"},

Your window to file a First Appeal against ${params.authorityName} closes on ${params.appealDeadlineLabel} — ${params.daysLeft} days from now.

After that date a First Appeal can still be filed, but it must carry a request to condone the delay, and the Appellate Authority is not obliged to grant it.

Your appeal is drafted and ready:
${params.url}

This is an automated reminder from RTI Copilot, an independent drafting aid. It is not legal advice.`,
  };
}
