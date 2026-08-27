"use client";

import { useState } from "react";
import { AlertTriangle, FlaskConical, IndianRupee, Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ux4g/alert";
import { Button } from "@/components/ux4g/button";
import { Marker, Rule } from "@/components/editorial";
import { useI18n } from "@/lib/client/i18n";
import type { Application } from "@/lib/client/store";

/**
 * Mock settlement (FR-16) and submission (FR-15).
 *
 * The payment is simulated and says so on the screen, not only in the docs —
 * a build that could be mistaken for the real portal would be worse than one
 * that stops short of filing. What is not simulated is the validation: the
 * server applies the rules the real portal applies, including the ones it only
 * reveals after taking the fee.
 */

export type FilingProblem = { field: string; message: string };

export function PayAndFile({
  application,
  onFiled,
}: {
  application: Application;
  onFiled: (receipt: Receipt) => void;
}) {
  const { t } = useI18n();
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState<FilingProblem[]>([]);
  const [failed, setFailed] = useState(false);

  const isBpl = application.applicant.isBpl;

  async function submit() {
    setBusy(true);
    setProblems([]);
    setFailed(false);
    try {
      const response = await fetch("/api/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filing: {
            authorityId: application.authority.id,
            requestText: application.portalText,
            // The declaration is a real field on the form now, so send what
            // was ticked. The server rejects an undeclared request, which is
            // what the portal it mirrors does.
            //
            // `phone` on the API is the mobile number — it is validated as
            // one. The form splits mobile from landline the way the real form
            // does, so the mobile is what crosses the boundary, with the
            // landline as a fallback for applications saved before the split.
            applicant: {
              ...application.applicant,
              phone: application.applicant.mobile || application.applicant.phone,
            },
          },
        }),
      });

      if (response.status === 422) {
        const body = await response.json();
        setProblems(body.problems ?? []);
        return;
      }
      if (!response.ok) {
        setFailed(true);
        return;
      }
      const body = await response.json();
      onFiled(body.receipt);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="pay-heading">
      <Rule />

      <div className="pt-8">
        <Marker label={isBpl ? t("pay.bplTitle") : t("pay.title")} />
        <h2
          id="pay-heading"
          className="mt-4 max-w-[24ch] text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] text-balance sm:text-[1.9rem]"
        >
          {isBpl ? t("pay.bplTitle") : t("pay.title")}
        </h2>
        <p className="mt-4 max-w-[58ch] leading-relaxed opacity-75">
          {isBpl ? t("pay.bplBody") : t("pay.help")}
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {/* FR-19: the disclosure sits on the screen, above the action. */}
        <Alert variant="warning">
          <FlaskConical aria-hidden="true" />
          <AlertTitle>{t("file.simulatedTitle")}</AlertTitle>
          <AlertDescription>{t("file.simulatedBody")}</AlertDescription>
        </Alert>

        {!isBpl && (
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">{t("pay.method")}</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["upi", t("pay.upi")],
                  ["card", t("pay.card")],
                  ["netbanking", t("pay.netbanking")],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={`inline-flex min-h-12 cursor-pointer items-center gap-2 border px-4 text-sm font-medium ${
                    method === value
                      ? "border-foreground bg-card text-foreground"
                      : "border-border opacity-75"
                  }`}
                >
                  <input
                    type="radio"
                    name="pay-method"
                    value={value}
                    checked={method === value}
                    onChange={() => setMethod(value)}
                    className="size-4"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {problems.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>{t("file.problemsTitle")}</AlertTitle>
            <AlertDescription>
              <ul className="list-disc space-y-1 pl-5">
                {problems.map((problem) => (
                  <li key={problem.field}>{problem.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {failed && (
          <Alert variant="destructive">
            <AlertTriangle aria-hidden="true" />
            <AlertDescription>
              Something went wrong on our side, not yours. Nothing was filed — try again.
            </AlertDescription>
          </Alert>
        )}

        <Button size="xl" variant="cta" onClick={submit} disabled={busy}>
          {busy ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              {t("file.submitting")}
            </>
          ) : (
            <>
              {!isBpl && <IndianRupee aria-hidden="true" />}
              {isBpl ? t("pay.confirmBpl") : t("pay.confirm")}
            </>
          )}
        </Button>
      </div>
    </section>
  );
}

export type Receipt = {
  registrationNumber: string;
  filedAt: string;
  authorityName: string;
  ministry?: string;
  pioDesignation: string;
  feePaidRupees: number;
  feeBasis: "paid" | "bpl-exempt";
  responseDueBy: string;
  charCount: number;
};
