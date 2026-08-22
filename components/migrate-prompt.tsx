"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/client/i18n";
import { migrateGuestApplications } from "@/lib/client/migrate";
import { refresh } from "@/lib/client/store";

/**
 * Offers to copy browser-held applications into the account (opt-in).
 *
 * Deliberately a prompt rather than an automatic sync. A guest draft can carry
 * a PPO, FIR, or PAN number, and uploading that because someone happened to
 * sign in is the mistake the print-not-upload decision avoids. The reason to
 * say yes — deadline emails — is stated, and so is what gets uploaded.
 *
 * Dismissal is remembered per browser so it is an offer, not a nag.
 */

const DISMISS_KEY = "rti-copilot:migration-dismissed";

export function MigratePrompt({ count }: { count: number }) {
  const { t } = useI18n();
  const [state, setState] = useState<"idle" | "working" | "done" | "failed">("idle");
  const [result, setResult] = useState({ migrated: 0, failed: 0 });
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (dismissed || count === 0 || state === "done") return null;

  async function handleMigrate() {
    setState("working");
    const outcome = await migrateGuestApplications();
    setResult(outcome);
    await refresh();
    setState(outcome.failed > 0 ? "failed" : "done");
  }

  function handleDismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Private browsing: dismissing for this session alone is fine.
    }
    setDismissed(true);
  }

  return (
    <Alert className="mb-6">
      <Upload aria-hidden="true" />
      <AlertTitle>{t("migrate.title")}</AlertTitle>
      <AlertDescription>
        <p>{t("migrate.body", { count })}</p>
        <p className="text-muted-foreground">{t("migrate.privacy")}</p>

        {state === "failed" && (
          <p className="font-medium text-destructive">
            {t("migrate.failed", { count: result.failed })}
          </p>
        )}

        <div className="mt-1 flex flex-wrap gap-2">
          <Button onClick={handleMigrate} disabled={state === "working"}>
            {state === "working" ? t("migrate.working") : t("migrate.confirm")}
          </Button>
          <Button variant="ghost" onClick={handleDismiss} disabled={state === "working"}>
            {t("migrate.dismiss")}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
