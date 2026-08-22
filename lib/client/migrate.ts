import { listApplications } from "./guest-storage";
import type { Application } from "./guest-storage";

/**
 * Copy guest applications into a signed-in account.
 *
 * Only ever runs on an explicit click. A guest draft can contain a PPO, FIR, or
 * PAN number, and uploading that because someone happened to sign in would be
 * the same mistake the print-not-upload decision avoids.
 *
 * Local state is left intact — if the upload half-fails, the citizen has not
 * lost anything, and a re-run is safe because the server ignores ids it
 * already holds.
 */

export type MigrationResult = { migrated: number; failed: number };

export function pendingMigrationCount(): number {
  return listApplications().length;
}

export async function migrateGuestApplications(): Promise<MigrationResult> {
  const local = listApplications();
  let migrated = 0;
  let failed = 0;

  for (const application of local) {
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application: stripDemoClock(application) }),
      });
      if (response.ok) migrated++;
      else failed++;
    } catch {
      failed++;
    }
  }

  return { migrated, failed };
}

/** A demo fast-forward must never follow an application into a real account. */
function stripDemoClock(application: Application): Application {
  const { simulatedDaysElapsed: _ignored, ...rest } = application;
  return { ...rest, isDemo: false };
}
