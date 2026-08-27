import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { Applicant, ApplicationStatus, Authority } from "@/lib/client/types";
import type { AppealDraft } from "@/lib/client/guest-storage";

/**
 * Signed-in persistence for the same shape guest mode keeps in localStorage.
 *
 * `lib/client/guest-storage.ts`'s `Application` type is the contract; this
 * table mirrors it field for field so the UI reads one type either way. Where a
 * value is a nested object the client already owns the type, it is stored as
 * jsonb and typed with `.$type<T>()` rather than restated as columns — two
 * declarations of one shape is the drift that has already caused two bugs here.
 *
 * Dates are `timestamptz`. The client sends ISO strings; Postgres stores an
 * instant. A naive `timestamp` would repeat the UTC-vs-IST bug that
 * `parseDateInput()` exists to prevent.
 */
export const applications = pgTable(
  "applications",
  {
    id: text("id").primaryKey(),
    /** The signed-in citizen's verified email. Guest rows never reach this table. */
    userId: text("user_id").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),

    grievance: text("grievance").notNull(),
    authority: jsonb("authority").$type<Authority>().notNull(),
    extractedReferences: jsonb("extracted_references").$type<string[]>().notNull().default([]),

    items: jsonb("items").$type<string[]>().notNull().default([]),
    fullText: text("full_text").notNull().default(""),
    portalText: text("portal_text").notNull().default(""),
    lifeOrLibertyFlag: boolean("life_or_liberty_flag").notNull().default(false),
    lifeOrLibertyReason: text("life_or_liberty_reason").notNull().default(""),

    applicant: jsonb("applicant").$type<Applicant>().notNull(),
    status: text("status").$type<ApplicationStatus>().notNull().default("drafting"),
    filingChannel: text("filing_channel"),
    filedAt: timestamp("filed_at", { withTimezone: true }),
    registrationNumber: text("registration_number"),
    viaApio: boolean("via_apio").notNull().default(false),

    responseLoggedAt: timestamp("response_logged_at", { withTimezone: true }),
    responseNote: text("response_note"),
    appeal: jsonb("appeal").$type<AppealDraft>(),

    simulatedDaysElapsed: integer("simulated_days_elapsed"),
    isDemo: boolean("is_demo").notNull().default(false),

    /**
     * Set by the cron sweep when a deadline notice is sent, so a restart or a
     * double-run never emails the same person twice about the same lapse.
     */
    deadlineNotifiedAt: timestamp("deadline_notified_at", { withTimezone: true }),
    appealNotifiedAt: timestamp("appeal_notified_at", { withTimezone: true }),
  },
  (table) => [
    index("applications_user_id_idx").on(table.userId),
    // The sweep scans open, filed applications only.
    index("applications_sweep_idx").on(table.status, table.filedAt),
  ]
);

export type ApplicationRow = typeof applications.$inferSelect;
export type NewApplicationRow = typeof applications.$inferInsert;
