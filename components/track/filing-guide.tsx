"use client";

import { useId, useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  IndianRupee,
  Paperclip,
  Printer,
  Siren,
} from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckboxField } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FieldHint, Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toDateInputValue } from "@/lib/client/deadlines";
import { buildFilingPlan } from "@/lib/client/filing";
import type { Application } from "@/lib/client/guest-storage";
import { useI18n } from "@/lib/client/i18n";
import type { Applicant } from "@/lib/client/types";

/**
 * The sentence that actually invokes the proviso to Section 7(1).
 *
 * Detecting urgency is only half the job — the 48-hour window applies only
 * where the ground is claimed in the application. Handing over the exact
 * wording is the difference between a flag on a screen and a shorter deadline
 * the PIO is bound by.
 */
const URGENCY_LINE =
  "This request concerns the life and liberty of a person and a reply is sought within 48 hours as provided in the proviso to Section 7(1) of the Right to Information Act, 2005.";

/**
 * Step 4. What to actually do with the draft, in the order it has to be done.
 *
 * The official portal tells you none of this until after you have paid: which
 * portal accepts this authority, what the fee is, what has to be attached, and
 * that a State application filed centrally is returned with the fee kept. All
 * of it is derived from the authority we already routed to, so the citizen is
 * never asked to supply knowledge they came here because they lacked.
 */
export function FilingGuide({
  application,
  onApplicantChange,
  onMarkFiled,
  onPrint,
}: {
  application: Application;
  onApplicantChange: (applicant: Applicant) => void;
  onMarkFiled: (details: {
    filedAt: string;
    registrationNumber: string;
    viaApio: boolean;
  }) => void;
  onPrint: () => void;
}) {
  const { t } = useI18n();
  const fieldPrefix = useId();

  const [filedAt, setFiledAt] = useState(toDateInputValue());
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [viaApio, setViaApio] = useState(false);

  const plan = buildFilingPlan(application.authority, {
    isBpl: application.applicant.isBpl,
    overPortalLimit: application.portalText.length > 3000,
  });

  function patchApplicant(patch: Partial<Applicant>) {
    onApplicantChange({ ...application.applicant, ...patch });
  }

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------- */}
      {/* Applicant details                                              */}
      {/* -------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-xl">{t("file.applicantTitle")}</CardTitle>
          <CardDescription>{t("file.applicantHelp")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          </div>

          <CheckboxField
            id={`${fieldPrefix}-bpl`}
            checked={application.applicant.isBpl}
            onChange={(event) => patchApplicant({ isBpl: event.target.checked })}
            label={t("file.bpl")}
            hint={t("file.bplHelp")}
          />
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------- */}
      {/* Where and how to file                                          */}
      {/* -------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-xl">{plan.title}</CardTitle>
          <CardDescription>{plan.rationale}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {plan.warning && (
            <Alert className="border-destructive/40 bg-destructive/6">
              <AlertTriangle aria-hidden="true" className="text-destructive" />
              <AlertTitle>Do not use the central portal for this</AlertTitle>
              <AlertDescription>{plan.warning}</AlertDescription>
            </Alert>
          )}

          {/*
            The 48-hour window is not automatic — it applies only if the ground
            is actually claimed in the application. Flagging it on the draft
            screen and then going quiet here is how someone files an urgent
            request on a 30-day clock without realising.
          */}
          {application.lifeOrLibertyFlag && (
            <Alert className="border-destructive/40 bg-destructive/6">
              <Siren aria-hidden="true" className="text-destructive" />
              <AlertTitle>Claim the 48-hour window in the application itself</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>
                  The shorter deadline under the proviso to Section 7(1) is not
                  automatic — it applies only if you state the ground. Add this
                  line at the top of the request text before you submit it.
                </p>
                <p className="rounded-lg bg-card p-3 font-mono text-sm text-foreground ring-1 ring-border">
                  {URGENCY_LINE}
                </p>
                <CopyButton value={URGENCY_LINE} size="lg" label="Copy this line" />
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
            <IndianRupee aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">
                {t("file.fee")}:{" "}
                {plan.feeRupees === 0 ? "No fee payable" : `₹${plan.feeRupees}`}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">{plan.feeNote}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{t("file.stepsTitle")}</h3>
            <ol className="mt-2 space-y-2.5">
              {plan.steps.map((stepText, index) => (
                <li key={index} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                  >
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-sm leading-relaxed">{stepText}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Paperclip aria-hidden="true" className="size-4 text-muted-foreground" />
              {t("file.attachments")}
            </h3>
            <ul className="mt-2 space-y-1.5">
              {plan.attachments.map((attachment, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                >
                  <span aria-hidden="true">•</span>
                  <span>{attachment}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <CopyButton
              value={application.portalText}
              label={t("file.copyText")}
              variant="cta"
            />
            {plan.url && (
              <Button
                type="button"
                size="xl"
                variant="outline"
                nativeButton={false}
                render={
                  <a href={plan.url} target="_blank" rel="noopener noreferrer">
                    {t("file.openPortal")}
                    <ExternalLink aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                }
              />
            )}
            <Button type="button" size="xl" variant="outline" onClick={onPrint}>
              <Printer aria-hidden="true" />
              {t("common.print")}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">{t("file.printHelp")}</p>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------- */}
      {/* Record the filing — this is what starts the statutory clock     */}
      {/* -------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-xl">{t("file.filedTitle")}</CardTitle>
          <CardDescription>{t("file.filedHelp")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              onMarkFiled({ filedAt, registrationNumber, viaApio });
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldPrefix}-filed-at`}>{t("file.filedDate")}</Label>
                <Input
                  id={`${fieldPrefix}-filed-at`}
                  type="date"
                  required
                  value={filedAt}
                  // A future filing date would start the clock early and put
                  // the appeal window in the wrong place.
                  max={toDateInputValue()}
                  onChange={(event) => setFiledAt(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldPrefix}-reg`}>
                  {t("file.regNumber")}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({t("common.optional")})
                  </span>
                </Label>
                <Input
                  id={`${fieldPrefix}-reg`}
                  value={registrationNumber}
                  onChange={(event) => setRegistrationNumber(event.target.value)}
                  aria-describedby={`${fieldPrefix}-reg-hint`}
                  className="font-mono"
                />
                <FieldHint id={`${fieldPrefix}-reg-hint`}>
                  {t("file.regNumberHelp")}
                </FieldHint>
              </div>
            </div>

            <CheckboxField
              id={`${fieldPrefix}-apio`}
              checked={viaApio}
              onChange={(event) => setViaApio(event.target.checked)}
              label={t("file.viaApio")}
              hint={t("file.viaApioHelp")}
            />

            <Button type="submit" size="xl" variant="cta" className="w-full sm:w-auto">
              {t("file.confirm")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
