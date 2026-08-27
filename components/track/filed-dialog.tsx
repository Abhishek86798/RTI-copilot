"use client";

import Link from "next/link";
import { CheckCircle2, FlaskConical, Printer } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ux4g/alert";
import { Button } from "@/components/ux4g/button";
import { Dialog } from "@/components/ui/dialog";
import { Marker } from "@/components/editorial";
import { formatDate } from "@/lib/client/deadlines";
import { useI18n } from "@/lib/client/i18n";
import type { Receipt as ReceiptData } from "./pay-and-file";

/**
 * The acknowledgement (FR-18), as a dialog.
 *
 * Filing is the end of the requisition, not a stage in it, so the confirmation
 * interrupts rather than continues. It used to unroll as another section on
 * the same page, which made "your application has been filed" read as one more
 * thing to scroll past instead of the moment the process finished.
 *
 * The registration number is given the most visual weight in the dialog
 * because it is the only key the portal later accepts for status checks,
 * appeals and complaints — a citizen who loses it has no way back to their own
 * application. It is set in a monospace face at display size so digits cannot
 * be misread when copied off a screen by hand.
 *
 * There is deliberately no "track this" shortcut. Tracking belongs to the
 * Applicant Dashboard, where every application is reachable a month later by
 * someone who no longer has this screen open — sending them there once, now,
 * teaches the route they will actually need.
 */
export function FiledDialog({
  open,
  receipt,
  onClose,
  onPrint,
}: {
  open: boolean;
  receipt: ReceiptData;
  onClose: () => void;
  onPrint: () => void;
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
    <Dialog open={open} onClose={onClose} labelledBy="receipt-heading">
      <Marker label={t("receipt.title")} dim={false} className="text-success" />
      <h2
        id="receipt-heading"
        className="mt-5 flex items-start gap-3 pr-10 text-[1.6rem] leading-[1.12] font-bold tracking-[-0.02em] text-balance sm:text-[2rem]"
      >
        <CheckCircle2 aria-hidden="true" className="mt-1 size-7 shrink-0 text-success" />
        {t("receipt.title")}
      </h2>
      <p className="mt-4 max-w-[58ch] leading-relaxed opacity-75">{t("receipt.help")}</p>

      {/*
        The registration number, at display size. It is the only key the portal
        accepts afterwards, so it outweighs everything else in the dialog.
      */}
      <div className="mt-8 border-y border-border py-7">
        <Marker label={t("receipt.regNumber")} />
        <p className="mt-4 font-mono text-[1.6rem] leading-[1.05] font-bold tracking-[-0.02em] break-all sm:text-[2.2rem]">
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

      {/* Where the next month of this application happens. */}
      <p className="mt-6 max-w-[58ch] leading-relaxed opacity-75">{t("receipt.next")}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          size="xl"
          variant="cta"
          nativeButton={false}
          render={<Link href="/applications">{t("receipt.dashboard")}</Link>}
        />
        <Button size="xl" variant="outline" onClick={onPrint}>
          <Printer aria-hidden="true" />
          {t("receipt.download")}
        </Button>
      </div>
    </Dialog>
  );
}
