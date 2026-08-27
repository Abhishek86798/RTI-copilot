"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useI18n } from "@/lib/client/i18n";
import type { Receipt as ReceiptData } from "./pay-and-file";

/** How long the confirmation holds before handing over to the dashboard. */
const REDIRECT_SECONDS = 6;

/**
 * The acknowledgement (FR-18) — a transaction-complete screen.
 *
 * This is the shape a payment confirmation takes, and for the same reason: the
 * citizen has just done the thing, and the only two facts that matter at this
 * instant are that it worked and what the reference number is. Everything else
 * about the application — when the reply is due, who it went to, the PDF — is
 * a property of the application, not of this moment, and lives on the
 * Applicant Dashboard where it will still be findable in a month.
 *
 * It used to show all of it here: a five-row table, the full disclosure, and
 * two competing actions, in a dialog that scrolled. Which meant the one line
 * worth reading — the registration number — arrived as item four of eight.
 *
 * So the dialog confirms and then gets out of the way, handing over to the
 * dashboard on its own. The countdown can be stopped before it runs out, which
 * is what WCAG 2.2.1 asks of any time limit, and closing the dialog stops it
 * too.
 */
export function FiledDialog({
  open,
  receipt,
  onClose,
}: {
  open: boolean;
  receipt: ReceiptData;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [seconds, setSeconds] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (!open) return;
    if (seconds <= 0) {
      router.push("/applications");
      return;
    }
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, seconds, router]);

  return (
    <Dialog open={open} onClose={onClose} labelledBy="receipt-heading" dismissible={false}>
      <div className="flex flex-col items-center text-center">
        {/*
          The tick draws itself once. A success state that simply appears is
          indistinguishable from one that was always there; a mark that is
          made confirms that something just happened.
        */}
        <span
          aria-hidden="true"
          className="grid size-16 place-items-center rounded-full bg-success/12 text-success motion-safe:animate-rise"
        >
          <Check className="size-8" strokeWidth={2.5} />
        </span>

        <h2
          id="receipt-heading"
          className="mt-6 text-2xl text-balance sm:text-[1.9rem]"
        >
          {t("receipt.title")}
        </h2>
        <p className="mt-3 max-w-[42ch] opacity-75">{t("receipt.saved")}</p>

        {/*
          The registration number. It is the only key the portal accepts
          afterwards, so it is the one piece of data the dialog carries.
        */}
        <div className="mt-8 w-full border-y border-border py-6">
          <p className="font-mono text-2xs tracking-[0.14em] uppercase opacity-75">
            {t("receipt.regNumber")}
          </p>
          {/*
            Sized to hold the whole number on one line at 320px. It broke
            mid-number there — and a reference split across two lines is
            exactly the one that gets copied down wrong at a counter.
          */}
          <p className="mt-3 font-mono text-[1.2rem] leading-[1.15] font-bold tracking-[-0.01em] break-words sm:text-[2rem]">
            {receipt.registrationNumber}
          </p>
        </div>

        {/* FR-19: a receipt is exactly the artefact someone might mistake for
            an official one, so it says what it is — in one line, here. */}
        <p className="mt-5 max-w-[46ch] text-sm text-warning">
          {t("receipt.simulatedShort")}
        </p>

        {/* Above the actions, not below them: on a small screen the buttons
            are the last thing in view, and a countdown underneath them
            explained the redirect only to people who scrolled to find it. */}
        <p className="mt-7 font-mono text-2xs tracking-[0.14em] uppercase opacity-75">
          {t("receipt.redirect", { seconds: Math.max(seconds, 0) })}
        </p>

        <div className="mt-4 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
          <Button size="lg" variant="cta" onClick={() => router.push("/applications")}>
            {t("receipt.dashboard")}
          </Button>
          <Button size="lg" variant="ghost" onClick={onClose}>
            {t("receipt.stay")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
