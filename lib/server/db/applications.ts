import { and, desc, eq, isNotNull, isNull, or } from "drizzle-orm";
import { getDb } from "./index";
import { applications, type ApplicationRow, type NewApplicationRow } from "./schema";
import type { Application } from "@/lib/client/guest-storage";

/**
 * The signed-in half of the storage contract.
 *
 * Mirrors the four functions `lib/client/guest-storage.ts` exports, returning
 * the same `Application` shape, so the UI reads one type either way.
 *
 * Every function takes `userId` and every query filters on it. The row id alone
 * is never enough to read or write an application — ids are UUIDs, but guessing
 * is not the threat model; a missing filter is.
 */

/** Postgres Dates -> the ISO strings the client type declares. */
function toApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    grievance: row.grievance,
    authority: row.authority,
    extractedReferences: row.extractedReferences,
    items: row.items,
    fullText: row.fullText,
    portalText: row.portalText,
    lifeOrLibertyFlag: row.lifeOrLibertyFlag,
    lifeOrLibertyReason: row.lifeOrLibertyReason,
    applicant: row.applicant,
    status: row.status,
    filingChannel: (row.filingChannel ?? undefined) as Application["filingChannel"],
    filedAt: row.filedAt?.toISOString(),
    registrationNumber: row.registrationNumber ?? undefined,
    viaApio: row.viaApio,
    responseLoggedAt: row.responseLoggedAt?.toISOString(),
    responseNote: row.responseNote ?? undefined,
    appeal: row.appeal ?? undefined,
    simulatedDaysElapsed: row.simulatedDaysElapsed ?? undefined,
    isDemo: row.isDemo,
  };
}

export async function listApplications(userId: string): Promise<Application[]> {
  const rows = await getDb()
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.createdAt));
  return rows.map(toApplication);
}

export async function getApplication(
  userId: string,
  id: string
): Promise<Application | undefined> {
  const [row] = await getDb()
    .select()
    .from(applications)
    .where(and(eq(applications.userId, userId), eq(applications.id, id)))
    .limit(1);
  return row ? toApplication(row) : undefined;
}

export async function createApplication(
  userId: string,
  application: Application
): Promise<Application> {
  const [row] = await getDb()
    .insert(applications)
    .values({
      ...toRow(application),
      id: application.id,
      userId,
    })
    .onConflictDoNothing({ target: applications.id })
    .returning();
  // A conflict means this id is already stored — migration re-run, or a retry.
  return row ? toApplication(row) : ((await getApplication(userId, application.id)) as Application);
}

export async function updateApplication(
  userId: string,
  id: string,
  patch: Partial<Application>
): Promise<Application | undefined> {
  const [row] = await getDb()
    .update(applications)
    .set({ ...toRow(patch as Application, true), updatedAt: new Date() })
    .where(and(eq(applications.userId, userId), eq(applications.id, id)))
    .returning();
  return row ? toApplication(row) : undefined;
}

/**
 * Returns false when the row does not exist or belongs to someone else, so
 * the caller can answer 404 rather than a confident "deleted". The scoping
 * was always right — an unscoped delete was never possible — but reporting
 * success for a row that is still there invites a client to drop it from a
 * local cache and show the citizen an application that quietly reappears.
 */
export async function deleteApplication(userId: string, id: string): Promise<boolean> {
  const rows = await getDb()
    .delete(applications)
    .where(and(eq(applications.userId, userId), eq(applications.id, id)))
    .returning({ id: applications.id });
  return rows.length > 0;
}

type WritableRow = Omit<NewApplicationRow, "id" | "userId" | "createdAt" | "updatedAt">;

/** ISO strings -> Dates, dropping keys the caller did not set. */
function toRow(application: Application, partial = false): WritableRow {
  const date = (value?: string) => (value ? new Date(value) : undefined);
  const row: WritableRow = {
    grievance: application.grievance,
    authority: application.authority,
    extractedReferences: application.extractedReferences,
    items: application.items,
    fullText: application.fullText,
    portalText: application.portalText,
    lifeOrLibertyFlag: application.lifeOrLibertyFlag,
    lifeOrLibertyReason: application.lifeOrLibertyReason,
    applicant: application.applicant,
    status: application.status,
    filingChannel: application.filingChannel,
    filedAt: date(application.filedAt),
    registrationNumber: application.registrationNumber,
    viaApio: application.viaApio,
    responseLoggedAt: date(application.responseLoggedAt),
    responseNote: application.responseNote,
    appeal: application.appeal,
    simulatedDaysElapsed: application.simulatedDaysElapsed,
    isDemo: application.isDemo,
  };
  if (!partial) return row;
  return Object.fromEntries(
    Object.entries(row).filter(([key]) => key in application)
  ) as WritableRow;
}

/**
 * Applications the sweep should look at: filed, not yet resolved or appealed.
 * Demo rows are excluded — a spoofed clock must never trigger a real email.
 */
export async function listOpenApplications(): Promise<
  (Application & { userId: string; deadlineNotifiedAt?: Date; appealNotifiedAt?: Date })[]
> {
  const rows = await getDb()
    .select()
    .from(applications)
    .where(
      and(
        isNotNull(applications.filedAt),
        eq(applications.isDemo, false),
        or(eq(applications.status, "filed"), eq(applications.status, "awaiting-response")),
        isNull(applications.responseLoggedAt)
      )
    );
  return rows.map((row) => ({
    ...toApplication(row),
    userId: row.userId,
    deadlineNotifiedAt: row.deadlineNotifiedAt ?? undefined,
    appealNotifiedAt: row.appealNotifiedAt ?? undefined,
  }));
}

export async function markNotified(
  id: string,
  field: "deadlineNotifiedAt" | "appealNotifiedAt"
): Promise<void> {
  await getDb()
    .update(applications)
    .set({ [field]: new Date() })
    .where(eq(applications.id, id));
}
