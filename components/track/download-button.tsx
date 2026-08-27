"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";

import { ApplicationSheet } from "@/components/track/application-sheet";
import { Button } from "@/components/ux4g/button";
import { useI18n } from "@/lib/client/i18n";
import type { Application } from "@/lib/client/store";

/**
 * Download the application as a PDF, via the browser's own print dialog.
 *
 * Browser "Save as PDF" is the export path that works on every device today,
 * including the shared cyber-cafe PC where a lot of RTI applications actually
 * get printed. It costs nothing to ship and needs no server.
 *
 * This lives wherever an application is listed rather than only at the moment
 * of filing. Someone who needs a copy of their application needs it weeks
 * later, at a counter, not in the ten seconds after pressing submit.
 */
export function DownloadButton({
  application,
  variant = "outline",
  size = "lg",
  className,
}: {
  application: Application;
  variant?: "outline" | "ghost";
  size?: "xl" | "lg";
  className?: string;
}) {
  const { t } = useI18n();
  const [printing, setPrinting] = useState(false);

  /*
   * Render the print sheet first, then print. Calling window.print() in the
   * same tick would capture the DOM before React has committed the sheet.
   */
  useEffect(() => {
    if (!printing) return;
    const frame = requestAnimationFrame(() => {
      window.print();
      setPrinting(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [printing]);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setPrinting(true)}
      >
        <Printer aria-hidden="true" />
        {t("receipt.download")}
      </Button>
      {printing && <ApplicationSheet application={application} />}
    </>
  );
}
