"use client";

import { CheckCircle2, FlaskConical, Printer } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ux4g/alert";
import { Button } from "@/components/ux4g/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ux4g/card";
import { formatDate } from "@/lib/client/deadlines";
import { useI18n } from "@/lib/client/i18n";
import type { Receipt as ReceiptData } from "./pay-and-file";

/**
 * The acknowledgement (FR-18).
 *
 * The registration number is given the most visual weight on the screen
 * because it is the only key the portal later accepts for status checks,
 * appeals and complaints — a citizen who loses it has no way back to their own
 * application. It is set in a monospace face so digits cannot be misread when
 * copied off a screen by hand.
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
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-2 text-xl">
          <CheckCircle2 aria-hidden="true" className="text-success" />
          {t("receipt.title")}
        </CardTitle>
        <CardDescription>{t("receipt.help")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium text-muted-foreground">
            {t("receipt.regNumber")}
          </p>
          <p className="mt-1 font-mono text-xl font-bold tracking-tight break-all sm:text-2xl">
            {receipt.registrationNumber}
          </p>
        </div>

        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {/* FR-19 again: a receipt is exactly the artefact someone might mistake
            for an official one, so it says what it is. */}
        <Alert variant="warning">
          <FlaskConical aria-hidden="true" />
          <AlertTitle>{t("file.simulatedTitle")}</AlertTitle>
          <AlertDescription>{t("file.simulatedBody")}</AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-3">
          <Button size="xl" variant="cta" onClick={onTrack}>
            {t("receipt.track")}
          </Button>
          <Button size="xl" variant="outline" onClick={onPrint}>
            <Printer aria-hidden="true" />
            {t("receipt.download")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
