"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/client/i18n";

/**
 * Copy-to-clipboard with a confirmation that is announced, not just shown.
 *
 * Copying the application text is the single most-used action in the product —
 * it is the handoff to the real portal — and a button that silently succeeds
 * gets pressed four more times by someone who cannot tell whether it worked.
 * The label changes, and `aria-live` says so out loud.
 */
export function CopyButton({
  value,
  label,
  size = "xl",
  variant = "outline",
  className,
}: {
  value: string;
  label?: string;
  size?: "default" | "lg" | "xl";
  variant?: "default" | "outline" | "cta" | "secondary";
  className?: string;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API needs a secure context and can be blocked outright.
      // Fall back to a selection-based copy rather than failing silently.
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch {
        // Nothing left to try. The text is on screen and selectable by hand.
      }
      document.body.removeChild(area);
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleCopy}
        className={className}
      >
        {copied ? (
          <Check aria-hidden="true" className="text-success" />
        ) : (
          <Copy aria-hidden="true" />
        )}
        {copied ? t("common.copied") : (label ?? t("common.copy"))}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? t("common.copied") : ""}
      </span>
    </>
  );
}
