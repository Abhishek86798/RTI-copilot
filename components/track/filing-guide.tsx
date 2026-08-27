"use client";

import { useId } from "react";
import { AlertTriangle, FileUp, IndianRupee, Siren } from "lucide-react";

import { INDIAN_STATES } from "@/lib/client/states";
import { Alert, AlertDescription, AlertTitle } from "@/components/ux4g/alert";
import { Marker, Rule } from "@/components/editorial";
import { CheckboxField } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RTI_FEE_RUPEES } from "@/lib/client/filing";
import type { Application } from "@/lib/client/guest-storage";
import { useI18n } from "@/lib/client/i18n";
import type { Applicant } from "@/lib/client/types";

/**
 * The sentence that invokes the proviso to Section 7(1).
 *
 * The 48-hour window is not automatic — it applies only where the ground is
 * claimed in the application itself, so the applicant is shown the exact
 * wording that has to appear in the request text.
 */
const URGENCY_LINE =
  "This request concerns the life and liberty of a person and a reply is sought within 48 hours as provided in the proviso to Section 7(1) of the Right to Information Act, 2005.";

/**
 * Step 4 — Submit RTI Request.
 *
 * This is the portal's own submission form, not instructions for filling in
 * somebody else's. That distinction is the whole point of the screen: an
 * earlier version of it read like a help site, walking the applicant through
 * opening rtionline.gov.in, pasting text into it, and then coming back here to
 * type in the registration number they were given. A portal issues that
 * number; it does not ask for it.
 *
 * The fields mirror the real Submit Request form and are in its order:
 * applicant details, state and PIN, citizenship declaration, BPL status and
 * certificate, supporting document, then the request text. The public
 * authority is already resolved — that is the two-level Ministry → Public
 * Authority dropdown the real portal opens with, answered upstream by routing
 * so the applicant never has to know the answer to it.
 *
 * Submission, fee and acknowledgement are handled by `PayAndFile` below, which
 * posts to `/api/file` and receives a registration number in the portal's own
 * format.
 */
export function FilingGuide({
  application,
  onApplicantChange,
}: {
  application: Application;
  onApplicantChange: (applicant: Applicant) => void;
}) {
  const { t } = useI18n();
  const fieldPrefix = useId();

  const isState = application.authority.level === "state";

  function patchApplicant(patch: Partial<Applicant>) {
    onApplicantChange({ ...application.applicant, ...patch });
  }

  return (
    <div className="space-y-16">
      {/* -------------------------------------------------------------- */}
      {/* Scope — the real portal serves Central authorities only          */}
      {/* -------------------------------------------------------------- */}
      {isState && (
        <Alert className="border-warning/40 bg-warning/8">
          <AlertTriangle aria-hidden="true" className="text-warning" />
          <AlertTitle>{t("submit.stateTitle")}</AlertTitle>
          <AlertDescription>{t("submit.stateBody")}</AlertDescription>
        </Alert>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Applicant details                                              */}
      {/* -------------------------------------------------------------- */}
      <section aria-labelledby="applicant-heading">
        <Rule />
        <div className="pt-8">
          <Marker label={t("submit.section.applicant")} />
          <h2
            id="applicant-heading"
            className="mt-4 max-w-[24ch] text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] text-balance sm:text-[1.9rem]"
          >
            {t("file.applicantTitle")}
          </h2>
          <p className="mt-4 max-w-[58ch] leading-relaxed opacity-75">
            {t("file.applicantHelp")}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldPrefix}-name`}>{t("file.name")}</Label>
              <Input
                id={`${fieldPrefix}-name`}
                value={application.applicant.fullName}
                onChange={(event) => patchApplicant({ fullName: event.target.value })}
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldPrefix}-phone`}>{t("file.phone")}</Label>
              <Input
                id={`${fieldPrefix}-phone`}
                type="tel"
                inputMode="tel"
                value={application.applicant.phone}
                onChange={(event) => patchApplicant({ phone: event.target.value })}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldPrefix}-address`}>{t("file.address")}</Label>
            <Textarea
              id={`${fieldPrefix}-address`}
              value={application.applicant.address}
              onChange={(event) => patchApplicant({ address: event.target.value })}
              rows={3}
              autoComplete="street-address"
            />
          </div>

          {/*
            State and PIN are separate fields on the real form, not part of the
            street address, and it rejects an application without them.
          */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldPrefix}-state`}>{t("file.state")}</Label>
              <select
                id={`${fieldPrefix}-state`}
                value={application.applicant.state}
                onChange={(event) => patchApplicant({ state: event.target.value })}
                autoComplete="address-level1"
                className="ux4g-form-select min-h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
              >
                <option value="">{t("file.statePlaceholder")}</option>
                {INDIAN_STATES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${fieldPrefix}-pincode`}>{t("file.pincode")}</Label>
              <Input
                id={`${fieldPrefix}-pincode`}
                inputMode="numeric"
                maxLength={6}
                value={application.applicant.pincode}
                onChange={(event) =>
                  patchApplicant({
                    pincode: event.target.value.replace(/\D/g, "").slice(0, 6),
                  })
                }
                autoComplete="postal-code"
              />
              <p className="text-sm text-muted-foreground">{t("file.pincodeHelp")}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldPrefix}-email`}>{t("file.email")}</Label>
            <Input
              id={`${fieldPrefix}-email`}
              type="email"
              inputMode="email"
              value={application.applicant.email}
              onChange={(event) => patchApplicant({ email: event.target.value })}
              autoComplete="email"
            />
            <p className="text-sm text-muted-foreground">{t("submit.emailHelp")}</p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Declaration and fee status                                     */}
      {/* -------------------------------------------------------------- */}
      <section aria-labelledby="declaration-heading">
        <Rule />
        <div className="pt-8">
          <Marker label={t("submit.section.declaration")} />
          <h2
            id="declaration-heading"
            className="mt-4 max-w-[24ch] text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] text-balance sm:text-[1.9rem]"
          >
            {t("submit.declarationTitle")}
          </h2>
        </div>

        <div className="mt-8 space-y-4">
          {/*
            Section 6(1) confines the right to citizens, and the real form
            makes you assert it before it will take the request. It is a
            declaration, not a verification — nobody checks it, here or there.
          */}
          <CheckboxField
            id={`${fieldPrefix}-citizen`}
            checked={application.applicant.isCitizen ?? false}
            onChange={(event) => patchApplicant({ isCitizen: event.target.checked })}
            label={t("submit.citizen")}
            hint={t("submit.citizenHelp")}
          />

          <CheckboxField
            id={`${fieldPrefix}-bpl`}
            checked={application.applicant.isBpl}
            onChange={(event) => patchApplicant({ isBpl: event.target.checked })}
            label={t("file.bpl")}
            hint={t("file.bplHelp")}
          />

          {/*
            s.7(5) waives the fee on production of the certificate, not on the
            claim alone. Asking for the reference here is what stops someone
            filing a fee-exempt request that is returned as unpaid.
          */}
          {application.applicant.isBpl && (
            <div className="space-y-1.5 pl-8">
              <Label htmlFor={`${fieldPrefix}-bplref`}>{t("file.bplRef")}</Label>
              <Input
                id={`${fieldPrefix}-bplref`}
                value={application.applicant.bplCertificateRef ?? ""}
                onChange={(event) =>
                  patchApplicant({ bplCertificateRef: event.target.value })
                }
              />
              <p className="text-sm text-muted-foreground">{t("file.bplRefHelp")}</p>
            </div>
          )}

          <div className="flex items-start gap-3 border-l-2 border-border py-1 pl-4">
            <IndianRupee
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 opacity-75"
            />
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">
                {t("file.fee")}:{" "}
                {application.applicant.isBpl ? t("submit.feeNil") : `₹${RTI_FEE_RUPEES}`}
              </span>{" "}
              <span className="opacity-75">
                {application.applicant.isBpl
                  ? t("submit.feeExemptNote")
                  : t("submit.feeNote")}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Supporting document                                            */}
      {/* -------------------------------------------------------------- */}
      <section aria-labelledby="supporting-heading">
        <Rule />
        <div className="pt-8">
          <Marker label={t("submit.section.supporting")} />
          <h2
            id="supporting-heading"
            className="mt-4 max-w-[24ch] text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] text-balance sm:text-[1.9rem]"
          >
            {t("submit.supportingTitle")}
          </h2>
        </div>
        <div className="mt-8">
          {/*
            Disclosed rather than faked. The real form takes one PDF up to 1MB
            here; this build has no document store, and an upload control that
            silently discarded the file would be worse than saying so.
          */}
          <div className="flex items-start gap-3 border border-dashed border-border p-5">
            <FileUp aria-hidden="true" className="mt-0.5 size-5 shrink-0 opacity-75" />
            <div>
              <p className="text-sm font-medium">{t("submit.supportingNotAvailable")}</p>
              <p className="mt-1 max-w-[58ch] text-sm leading-relaxed opacity-75">
                {t("submit.supportingHelp")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Text of the request                                            */}
      {/* -------------------------------------------------------------- */}
      <section aria-labelledby="request-heading">
        <Rule />
        <div className="pt-8">
          <Marker label={t("submit.section.request")} />
          <h2
            id="request-heading"
            className="mt-4 max-w-[24ch] text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] text-balance sm:text-[1.9rem]"
          >
            {t("submit.requestTitle")}
          </h2>
          <p className="mt-4 max-w-[58ch] leading-relaxed opacity-75">
            {t("submit.requestHelp")}
          </p>
        </div>

        {application.lifeOrLibertyFlag && (
          <Alert className="mt-8 border-destructive/40 bg-destructive/6">
            <Siren aria-hidden="true" className="text-destructive" />
            <AlertTitle>{t("submit.urgentTitle")}</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{t("submit.urgentBody")}</p>
              <p className="border-l-2 border-destructive/40 py-1 pl-4 font-mono text-sm text-foreground">
                {URGENCY_LINE}
              </p>
            </AlertDescription>
          </Alert>
        )}

        <pre className="mt-8 border-l-2 border-border py-2 pl-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
          {application.portalText}
        </pre>
        <p className="mt-4 font-mono text-[0.68rem] tracking-[0.14em] uppercase opacity-75">
          {application.portalText.length.toLocaleString("en-IN")} / 3,000{" "}
          {t("draft.chars")}
        </p>
      </section>
    </div>
  );
}
