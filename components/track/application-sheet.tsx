"use client";

import { formatDate } from "@/lib/client/deadlines";
import { RTI_FEE_RUPEES } from "@/lib/client/filing";
import type { Application } from "@/lib/client/guest-storage";

/**
 * The printable application, laid out the way a PIO expects to receive it.
 *
 * Hidden on screen and revealed only for print (`data-print="only"`), so the
 * browser's own "Save as PDF" produces a filed-ready A4 document. That is the
 * export path that works on every device today — including the shared PC at a
 * cyber cafe, which is where a great many RTI applications are actually
 * printed — and it needs no server, no library, and no upload of a document
 * that contains someone's pension number.
 *
 * The PRD's server-rendered PDF (FR-6) can replace this later without changing
 * anything the citizen sees here.
 */
export function ApplicationSheet({ application }: { application: Application }) {
  const { applicant, authority } = application;

  return (
    <div data-print="only" className="print-sheet hidden text-black">
      <header className="mb-6">
        <h1 className="text-center text-lg font-bold">
          APPLICATION UNDER THE RIGHT TO INFORMATION ACT, 2005
        </h1>
        <p className="mt-1 text-center text-sm">
          (Under Section 6(1) of the Act)
        </p>
      </header>

      <section className="mb-5 text-sm leading-relaxed">
        <p>To,</p>
        <p className="font-semibold">{authority.pioDesignation}</p>
        <p>{authority.authorityName}</p>
        <p>{authority.filingAddress}</p>
      </section>

      <section className="mb-5 text-sm leading-relaxed">
        <p>
          <span className="font-semibold">Subject:</span> Request for information
          under the Right to Information Act, 2005
        </p>
      </section>

      <section className="mb-5 text-sm leading-relaxed">
        <p>Sir/Madam,</p>
        <p className="mt-2">
          I request the following information under Section 6(1) of the Right to
          Information Act, 2005. In terms of Section 6(2), I am not required to
          state any reason for this request.
        </p>
      </section>

      <section className="mb-5">
        <p className="mb-2 text-sm font-semibold">Information sought:</p>
        <ol className="space-y-2 text-sm leading-relaxed">
          {application.items.map((item, index) => (
            <li key={index} className="flex gap-2">
              <span className="font-semibold">{index + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>

      {application.lifeOrLibertyFlag && (
        <section className="mb-5 border border-black p-3 text-sm leading-relaxed">
          <p className="font-semibold">
            Request under the proviso to Section 7(1) — life or liberty
          </p>
          <p className="mt-1">
            This request concerns the life or liberty of a person and a reply is
            sought within 48 hours as provided in the proviso to Section 7(1) of
            the Act. {application.lifeOrLibertyReason}
          </p>
        </section>
      )}

      <section className="mb-5 text-sm leading-relaxed">
        <p className="font-semibold">Fee</p>
        {applicant.isBpl ? (
          <p>
            I am a person below the poverty line and am exempt from payment of
            fee under Section 7(5) of the Act. A copy of my BPL certificate is
            enclosed.
          </p>
        ) : (
          <p>
            The prescribed application fee of ₹{RTI_FEE_RUPEES} has been paid.
            Proof of payment is enclosed.
          </p>
        )}
      </section>

      <section className="mb-5 text-sm leading-relaxed">
        <p>
          I request that the information be provided within the period
          prescribed by Section 7(1) of the Act.
        </p>
      </section>

      <section className="mt-8 text-sm leading-relaxed">
        <p>Yours faithfully,</p>
        <p className="mt-8">____________________________</p>
        <p className="font-semibold">{applicant.fullName || "[Full name]"}</p>
        <p className="whitespace-pre-line">{applicant.address || "[Postal address]"}</p>
        {applicant.phone && <p>Phone: {applicant.phone}</p>}
        {applicant.email && <p>Email: {applicant.email}</p>}
        <p className="mt-4">
          Date: {formatDate(application.filedAt ?? new Date())}
        </p>
        <p>Place: ______________________</p>
      </section>

      <footer className="mt-8 border-t border-black pt-2 text-xs">
        Prepared with RTI Copilot, an independent drafting aid. Not a government
        document and not legal advice. Review before filing.
      </footer>
    </div>
  );
}

/** Same treatment for the First Appeal. */
export function AppealSheet({ text }: { text: string }) {
  return (
    <div data-print="only" className="print-sheet hidden text-black">
      <pre className="text-sm leading-relaxed whitespace-pre-wrap">{text}</pre>
      <footer className="mt-8 border-t border-black pt-2 text-xs">
        Prepared with RTI Copilot, an independent drafting aid. Not a government
        document and not legal advice. Review before filing.
      </footer>
    </div>
  );
}
