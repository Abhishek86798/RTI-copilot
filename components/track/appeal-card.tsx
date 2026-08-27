"use client";

import { Gavel, Printer } from "lucide-react";

import { Button } from "@/components/ux4g/button";
import { Marker, Rule } from "@/components/editorial";
import { FieldHint, Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/client/deadlines";
import type { AppealDraft } from "@/lib/client/guest-storage";
import { useI18n } from "@/lib/client/i18n";

/**
 * Submit First Appeal.
 *
 * Modelled on the real form, which is deliberately thin: you give the
 * registration number of the original request, the portal fills in everything
 * it already knows, you state the grounds, and you submit. No fee is payable
 * on a first appeal under Section 19(1).
 *
 * Here the registration number is not asked for at all — this portal issued it
 * at filing and can read it back. An earlier version of this screen had the
 * applicant type it in, along with the date they filed, which is what a
 * third-party helper would need to do and exactly what a portal must not.
 *
 * The grounds are pre-written the moment the deadline lapses rather than left
 * blank. By then the applicant has been ignored for a month; the document
 * being already drafted is the point of the feature.
 */
export function AppealCard({
  appealText,
  onAppealTextChange,
  appeal,
  registrationNumber,
  onSubmitAppeal,
  onPrint,
}: {
  appealText: string;
  onAppealTextChange: (value: string) => void;
  appeal?: AppealDraft;
  /** Issued at filing. Shown read-only, the way the real form populates it. */
  registrationNumber?: string;
  onSubmitAppeal: () => void;
  onPrint: () => void;
}) {
  const { t } = useI18n();
  const alreadyFiled = Boolean(appeal?.filedAt);

  return (
    <section aria-labelledby="appeal-heading">
      <Rule />
      <div className="pt-8">
        <Marker label={t("track.appealTitle")} />
        <h2
          id="appeal-heading"
          className="mt-4 flex items-center gap-3 text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] sm:text-[1.9rem]"
        >
          <Gavel aria-hidden="true" className="size-6 shrink-0 text-warning" />
          {t("track.appealTitle")}
        </h2>
        <p className="mt-4 max-w-[58ch] leading-relaxed opacity-75">
          {t("track.appealHelp")}
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {/*
          Auto-populated, exactly as the real form does once you give it the
          number — except this portal already has it, so there is nothing to
          give. Read-only because it is a fact of record, not an input.
        */}
        {registrationNumber && (
          <div>
            <Marker label={t("appeal.against")} />
            <p className="mt-3 font-mono text-base">{registrationNumber}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="appeal-text">{t("appeal.grounds")}</Label>
          <Textarea
            id="appeal-text"
            value={appealText}
            onChange={(event) => onAppealTextChange(event.target.value)}
            rows={18}
            readOnly={alreadyFiled}
            className="min-h-96 font-mono text-sm leading-relaxed"
          />
          <FieldHint>{t("appeal.groundsHelp")}</FieldHint>
        </div>

        <p className="border-l-2 border-border py-1 pl-4 text-sm leading-relaxed">
          <span className="font-semibold">
            {t("file.fee")}: {t("submit.feeNil")}
          </span>{" "}
          <span className="opacity-75">{t("appeal.noFee")}</span>
        </p>

        {alreadyFiled ? (
          <div className="border-l-2 border-success py-1 pl-4">
            <p className="text-sm font-medium text-success">
              {t("appeal.submitted", { date: formatDate(appeal!.filedAt!) })}
            </p>
            <p className="mt-1 text-sm leading-relaxed opacity-75">
              {t("appeal.submittedHelp")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" size="xl" variant="cta" onClick={onSubmitAppeal}>
              {t("appeal.submit")}
            </Button>
            <Button type="button" size="xl" variant="outline" onClick={onPrint}>
              <Printer aria-hidden="true" />
              {t("common.print")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
