import { Resend } from "resend";

/**
 * Deadline mail.
 *
 * Three outcomes, all deliberate:
 *  - no RESEND_API_KEY   -> "logged", the mail is written to the console
 *  - shared test sender  -> "sent" to the Resend account owner, "blocked" for
 *                           anyone else (the current setup — no domain)
 *  - verified domain     -> "sent" to anyone
 *
 * Moving between them is a config change, not a code change.
 */

const FROM = process.env.RESEND_FROM ?? "RTI Copilot <onboarding@resend.dev>";

export type Mail = { to: string; subject: string; text: string };

export async function sendMail(mail: Mail): Promise<"sent" | "logged" | "blocked"> {
  if (!process.env.RESEND_API_KEY) {
    console.info(`[email:logged] to=${mail.to} subject=${mail.subject}\n${mail.text}`);
    return "logged";
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: FROM, ...mail });
  if (error) {
    // Resend's shared onboarding@resend.dev sender only delivers to the
    // Resend account owner's own address. That is the current deliberate
    // setup: there is no domain, so the demo sends real mail to the owner and
    // nothing reaches anyone else.
    //
    // It must stay loud rather than pass as success. A deadline notice that
    // silently never arrives is the exact failure this whole sweep exists to
    // prevent, and the day a real applicant is added is the day this line is
    // the only warning that they were never told.
    if (FROM.includes("onboarding@resend.dev")) {
      console.error(
        `[email:blocked] to=${mail.to} — the shared resend.dev sender only ` +
          `delivers to the Resend account owner, so this notice was NOT sent. ` +
          `Sending to real applicants needs a domain in Resend and ` +
          `RESEND_FROM set to an address on it. (${error.message})`
      );
      return "blocked";
    }
    throw new Error(`Resend failed: ${error.message}`);
  }
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
