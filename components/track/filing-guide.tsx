"use client";

import { useId } from "react";
import { AlertTriangle, FileUp, IndianRupee, Siren } from "lucide-react";

import { INDIAN_STATES } from "@/lib/client/states";
import { Select } from "@/components/ui/select";
import { RadioField, SelectField } from "@/components/track/submit-fields";
import {
  authorityById,
  ministryGroups,
  ministryOf,
} from "@/lib/client/authority-directory";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { CheckboxField } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RTI_FEE_RUPEES } from "@/lib/client/filing";
import type { Application } from "@/lib/client/guest-storage";
import { useI18n } from "@/lib/client/i18n";
import type { Applicant, Authority } from "@/lib/client/types";

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
export type FilingSectionId =
  | "authority"
  | "applicant"
  | "declaration"
  | "supporting"
  | "request";

export function FilingGuide({
  application,
  onApplicantChange,
  onAuthorityChange,
  only,
}: {
  application: Application;
  /**
   * Render only these sections, in the order the form declares them.
   *
   * The filing screen shows one at a time behind Next/Previous rather than as
   * one long scroll; omit it and every section renders, which is what the
   * print sheet and any single-page view want.
   */
  only?: FilingSectionId[];
  onApplicantChange: (applicant: Applicant) => void;
  /**
   * Routing pre-selects the authority; this lets the applicant override it.
   * The real form makes them choose from scratch, which is the hardest thing
   * about filing an RTI — but a guess they cannot correct would be worse.
   */
  onAuthorityChange: (authority: Authority) => void;
}) {
  const { t } = useI18n();
  const fieldPrefix = useId();

  const isState = application.authority.level === "state";
  const groups = ministryGroups();

  /*
   * Group from the directory by id, not from the stored snapshot.
   *
   * An application saved before `ministry` existed on Authority — or seeded
   * from a demo fixture that never carried it — has the field undefined, which
   * silently sorted it under "State public authorities" and left both
   * dropdowns showing a body that had nothing to do with the request. The id
   * is the identity; everything else on the snapshot is a copy that can go
   * stale.
   */
  const canonical = authorityById(application.authority.id) ?? application.authority;
  const selectedMinistry = ministryOf(canonical);
  const authoritiesInMinistry =
    groups.find((group) => group.ministry === selectedMinistry)?.authorities ?? [];

  function patchApplicant(patch: Partial<Applicant>) {
    onApplicantChange({ ...application.applicant, ...patch });
  }

  const shows = (section: FilingSectionId) => !only || only.includes(section);

  return (
    /*
     * The 16-unit rhythm separates sections on a page that shows all of them.
     * Stepped through one at a time there is nothing to separate, and the gap
     * became a blank band under the step chips.
     */
    <div className={only ? "space-y-10" : "space-y-10"}>
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
      {/* Public authority — the two-level choice the real form opens with */}
      {/* -------------------------------------------------------------- */}
      {shows("authority") && (
        <Panel labelledBy="authority-heading">
          <PanelHeader
            id="authority-heading"
            title={t("submit.authorityTitle")}
            description={t("submit.authorityHelp")}
          />
          <PanelBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id={`${fieldPrefix}-ministry`}
              label={t("submit.ministry")}
              value={selectedMinistry}
              onChange={(ministry) => {
                // Moving ministry has to move the authority with it, or the two
                // dropdowns disagree and the request files against whichever one
                // the server happens to read.
                const group = groups.find((entry) => entry.ministry === ministry);
                if (group?.authorities[0]) onAuthorityChange(group.authorities[0]);
              }}
            >
              {groups.map((group) => (
                <option key={group.ministry} value={group.ministry}>
                  {group.ministry}
                </option>
              ))}
            </SelectField>

            <SelectField
              id={`${fieldPrefix}-authority`}
              label={t("submit.publicAuthority")}
              value={application.authority.id}
              onChange={(id) => {
                const next = authoritiesInMinistry.find((entry) => entry.id === id);
                if (next) onAuthorityChange(next);
              }}
              hint={t("submit.publicAuthorityHint")}
            >
              {authoritiesInMinistry.map((authority) => (
                <option key={authority.id} value={authority.id}>
                  {authority.authorityName}
                </option>
              ))}
            </SelectField>
          </div>

          <p className="mt-4 border-l-2 border-border py-1 pl-4 text-sm opacity-75">
            {t("submit.pio")}: <span className="text-foreground">{application.authority.pioDesignation}</span>
          </p>
          </PanelBody>
        </Panel>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Applicant details                                              */}
      {/* -------------------------------------------------------------- */}
      {shows("applicant") && (
        <Panel labelledBy="applicant-heading">
          <PanelHeader
            id="applicant-heading"
            title={t("file.applicantTitle")}
            description={t("file.applicantHelp")}
          />
          <PanelBody>
          {/*
            One grid for the whole particulars form, two fields to a row.

            Set as a stack of full-width rows it ran past a thousand pixels
            for eleven short fields, and put a 780px-wide box under a label
            reading "PIN code". Paired, the step fits a screen and every
            control is about as wide as the thing it holds.
          */}
          <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`${fieldPrefix}-name`}>{t("file.name")}</Label>
              <Input
                id={`${fieldPrefix}-name`}
                value={application.applicant.fullName}
                onChange={(event) => patchApplicant({ fullName: event.target.value })}
                autoComplete="name"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor={`${fieldPrefix}-mobile`}>{t("file.mobile")}</Label>
              <Input
                id={`${fieldPrefix}-mobile`}
                type="tel"
                inputMode="tel"
                value={application.applicant.mobile}
                onChange={(event) => patchApplicant({ mobile: event.target.value })}
                autoComplete="tel"
              />
              <p className="text-xs text-muted-foreground">{t("file.mobileHelp")}</p>
            </div>

            {/* The one field that genuinely needs the full width. */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`${fieldPrefix}-address`}>{t("file.address")}</Label>
              <Textarea
                id={`${fieldPrefix}-address`}
                value={application.applicant.address}
                onChange={(event) => patchApplicant({ address: event.target.value })}
                rows={2}
                autoComplete="street-address"
              />
            </div>

            {/*
              State and PIN are separate fields on the real form, not part of
              the street address, and it rejects an application without them.
            */}
            <div className="space-y-1">
              <Label htmlFor={`${fieldPrefix}-state`}>{t("file.state")}</Label>
              <Select
                id={`${fieldPrefix}-state`}
                value={application.applicant.state}
                onChange={(event) => patchApplicant({ state: event.target.value })}
                autoComplete="address-level1"
              >
                <option value="">{t("file.statePlaceholder")}</option>
                {INDIAN_STATES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
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
              <p className="text-xs text-muted-foreground">{t("file.pincodeHelp")}</p>
            </div>

            <RadioField
              legend={t("file.gender")}
              name={`${fieldPrefix}-gender`}
              value={application.applicant.gender}
              onChange={(gender) => patchApplicant({ gender })}
              options={[
                { value: "male", label: t("file.gender.male") },
                { value: "female", label: t("file.gender.female") },
                { value: "third", label: t("file.gender.third") },
              ]}
            />

            <RadioField
              legend={t("file.country")}
              name={`${fieldPrefix}-country`}
              value={application.applicant.country}
              onChange={(country) => patchApplicant({ country })}
              options={[
                { value: "india", label: t("file.country.india") },
                { value: "other", label: t("file.country.other") },
              ]}
              hint={t("file.countryHelp")}
            />

            <RadioField
              legend={t("file.areaStatus")}
              name={`${fieldPrefix}-area`}
              value={application.applicant.areaStatus}
              onChange={(areaStatus) => patchApplicant({ areaStatus })}
              options={[
                { value: "rural", label: t("file.area.rural") },
                { value: "urban", label: t("file.area.urban") },
              ]}
            />

            <RadioField
              legend={t("file.education")}
              name={`${fieldPrefix}-education`}
              value={application.applicant.educationalStatus}
              onChange={(educationalStatus) => patchApplicant({ educationalStatus })}
              options={[
                { value: "literate", label: t("file.education.literate") },
                { value: "illiterate", label: t("file.education.illiterate") },
              ]}
            />

            <div className="space-y-1">
              <Label htmlFor={`${fieldPrefix}-phone`}>
                {t("file.phone")}{" "}
                <span className="font-normal opacity-75">({t("common.optional")})</span>
              </Label>
              <Input
                id={`${fieldPrefix}-phone`}
                type="tel"
                inputMode="tel"
                value={application.applicant.phone}
                onChange={(event) => patchApplicant({ phone: event.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor={`${fieldPrefix}-email`}>{t("file.email")}</Label>
              <Input
                id={`${fieldPrefix}-email`}
                type="email"
                inputMode="email"
                value={application.applicant.email}
                onChange={(event) => patchApplicant({ email: event.target.value })}
                autoComplete="email"
              />
              <p className="text-xs text-muted-foreground">{t("submit.emailHelp")}</p>
            </div>
          </div>
          </PanelBody>
        </Panel>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Declaration and fee status                                     */}
      {/* -------------------------------------------------------------- */}
      {shows("declaration") && (
        <Panel labelledBy="declaration-heading">
          <PanelHeader
            id="declaration-heading"
            title={t("submit.declarationTitle")}
          />
          <PanelBody>
          <div className="space-y-3">
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
              <p className="text-sm">
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
          </PanelBody>
        </Panel>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Supporting document                                            */}
      {/* -------------------------------------------------------------- */}
      {shows("supporting") && (
        <Panel labelledBy="supporting-heading">
          <PanelHeader
            id="supporting-heading"
            title={t("submit.supportingTitle")}
          />
          <PanelBody>
          <div>
            {/*
              Disclosed rather than faked. The real form takes one PDF up to 1MB
              here; this build has no document store, and an upload control that
              silently discarded the file would be worse than saying so.
            */}
            <div className="flex items-start gap-3 border border-dashed border-border p-5">
              <FileUp aria-hidden="true" className="mt-0.5 size-5 shrink-0 opacity-75" />
              <div>
                <p className="text-sm font-medium">{t("submit.supportingNotAvailable")}</p>
                <p className="mt-1 max-w-[58ch] text-sm opacity-75">
                  {t("submit.supportingHelp")}
                </p>
              </div>
            </div>
          </div>
          </PanelBody>
        </Panel>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Text of the request                                            */}
      {/* -------------------------------------------------------------- */}
      {shows("request") && (
        <Panel labelledBy="request-heading">
          <PanelHeader
            id="request-heading"
            title={t("submit.requestTitle")}
            description={t("submit.requestHelp")}
          />
          <PanelBody>
          {application.lifeOrLibertyFlag && (
            <Alert className="border-destructive/40 bg-destructive/6">
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

          <pre
            tabIndex={0}
            className="max-h-72 overflow-y-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap"
          >
            {application.portalText}
          </pre>
          <p className="mt-4 font-mono text-2xs tracking-[0.14em] uppercase opacity-75">
            {application.portalText.length.toLocaleString("en-IN")} / 3,000{" "}
            {t("draft.chars")}
          </p>
          </PanelBody>
        </Panel>
      )}
    </div>
  );
}
