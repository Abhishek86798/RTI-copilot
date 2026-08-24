"use client";

import { CheckCircle2, FlaskConical, Printer } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ux4g/alert";
import { Button } from "@/components/ux4g/button";
import { Marker, Rule } from "@/components/editorial";
import { formatDate } from "@/lib/client/deadlines";
import { useI18n } from "@/lib/client/i18n";
import type { Receipt as ReceiptData } from "./pay-and-file";

/**
 * The acknowledgement (FR-18).
 *
 * The registration number is given the most visual weight on the screen
 * because it is the only key the portal later accepts for status checks,
 * appeals and complaints — a citizen who loses it has no way back to their own
 * application. It is set in a monospace face at display size so digits cannot
 * be misread when copied off a screen by hand.
 *
 * Set as a record on hairlines rather than a card. This is the artefact a
 * citizen keeps, so it should read like a receipt rather than like a panel in
 * an application.
 */
export function Receipt({
  receipt,
  onPrint,
  onTrack,
}: {
  receipt: ReceiptData;
  onPrint: () => void;
  onTrack: () => void;
}) {
  const { t } = useI18n();

  const rows: [string, string][] = [
    [t("receipt.filedOn"), formatDate(receipt.filedAt)],
    [t("receipt.authority"), receipt.authorityName],
    ...(receipt.ministry ? ([[t("receipt.ministry"), receipt.ministry]] as [string, string][]) : []),
    [
      t("receipt.fee"),
      receipt.feeBasis === "bpl-exempt" ? t("receipt.feeExempt") : t("receipt.feePaid"),
    ],
    [t("receipt.dueBy"), formatDate(receipt.responseDueBy)],
  ];

  return (
    <section aria-labelledby="receipt-heading">
      <Rule />

      <div className="pt-8">
        <Marker label={t("receipt.title")} dim={false} className="text-success" />
        <h2
          id="receipt-heading"
          className="mt-5 flex items-start gap-3 text-[1.75rem] leading-[1.12] font-bold tracking-[-0.02em] text-balance sm:text-[2.25rem]"
        >
          <CheckCircle2 aria-hidden="true" className="mt-1.5 size-7 shrink-0 text-success" />
          {t("receipt.title")}
        </h2>
        <p className="mt-4 max-w-[58ch] leading-relaxed opacity-75">{t("receipt.help")}</p>
      </div>

      {/*
        The registration number, at display size. It is the only key the portal
        accepts afterwards, so it outweighs everything else on the screen.
      */}
      <div className="mt-8 border-y border-border py-7">
        <Marker label={t("receipt.regNumber")} />
        <p className="mt-4 font-mono text-[1.75rem] leading-[1.05] font-bold tracking-[-0.02em] break-all sm:text-[2.4rem]">
          {receipt.registrationNumber}
        </p>
      </div>

      <dl className="grid grid-cols-1 divide-y divide-border border-b border-border sm:grid-cols-2 sm:divide-y-0">
        {rows.map(([label, value], index) => (
          <div
            key={label}
            className={
              index % 2 === 1
                ? "py-5 sm:border-b sm:border-l sm:border-border sm:pl-8"
                : "py-5 sm:border-b sm:border-border"
            }
          >
            <dt className="font-mono text-[0.68rem] tracking-[0.14em] uppercase opacity-75">
              {label}
            </dt>
            <dd className="mt-1.5 font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      {/* FR-19 again: a receipt is exactly the artefact someone might mistake
          for an official one, so it says what it is. */}
      <Alert variant="warning" className="mt-6">
        <FlaskConical aria-hidden="true" />
        <AlertTitle>{t("file.simulatedTitle")}</AlertTitle>
        <AlertDescription>{t("file.simulatedBody")}</AlertDescription>
      </Alert>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="xl" variant="cta" onClick={onTrack}>
          {t("receipt.track")}
        </Button>
        <Button size="xl" variant="outline" onClick={onPrint}>
          <Printer aria-hidden="true" />
          {t("receipt.download")}
        </Button>
      </div>
    </section>
  );
}
