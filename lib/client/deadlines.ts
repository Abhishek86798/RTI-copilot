/**
 * Statutory clock for the RTI Act, 2005.
 *
 * The PRD treats deadline maths as a hard-accuracy requirement rather than an
 * approximation, so every number below is tied to the clause it comes from and
 * nothing is rounded for convenience. Getting this wrong tells a citizen they
 * still have time to appeal when the window has already closed.
 *
 * Clauses used:
 *  - s.7(1)            30 calendar days to decide on a request.
 *  - proviso to s.7(1) 48 hours where life or liberty of a person is concerned.
 *  - proviso to s.5(2) +5 days when the application is lodged through an
 *                      Assistant PIO, because the clock starts on receipt by
 *                      the PIO, not by the APIO.
 *  - s.19(1)           First Appeal within 30 days of the decision, or of the
 *                      expiry of the s.7(1) period where no decision came.
 */

export const RESPONSE_DAYS = 30;
export const APIO_EXTRA_DAYS = 5;
export const LIFE_LIBERTY_HOURS = 48;
export const APPEAL_WINDOW_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

export type ClockInput = {
  /** ISO date the citizen says the application was lodged. */
  filedAt: string;
  /** Section 7(1) proviso applies — 48 hours instead of 30 days. */
  lifeOrLibertyFlag: boolean;
  /** Lodged through an Assistant PIO, which adds 5 days under s.5(2). */
  viaApio: boolean;
  /**
   * Demo-only fast-forward in days (FR-14). Never set on a genuinely filed
   * application; see `canSimulate()` in `lib/client/guest-storage.ts`.
   */
  simulatedDaysElapsed?: number;
};

export type Clock = {
  filedAt: Date;
  responseDeadline: Date;
  appealDeadline: Date;
  /** "now", shifted by any demo fast-forward. */
  effectiveNow: Date;
  msRemaining: number;
  daysRemaining: number;
  hoursRemaining: number;
  isOverdue: boolean;
  /** Inside the s.19(1) window, so a First Appeal can still be lodged. */
  canAppeal: boolean;
  /** Past the s.19(1) window — appeal now needs a condonation-of-delay plea. */
  appealWindowClosed: boolean;
  /** Which rule produced `responseDeadline`, for display. */
  basis: "life-liberty-48h" | "apio-35d" | "standard-30d";
  totalWindowMs: number;
  /** 0..1 share of the response window consumed, for the progress meter. */
  elapsedFraction: number;
};

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * MS_PER_HOUR);
}

export function computeClock(input: ClockInput, now: Date = new Date()): Clock {
  const filedAt = new Date(input.filedAt);

  let responseDeadline: Date;
  let basis: Clock["basis"];

  if (input.lifeOrLibertyFlag) {
    responseDeadline = addHours(filedAt, LIFE_LIBERTY_HOURS);
    basis = "life-liberty-48h";
  } else if (input.viaApio) {
    responseDeadline = addDays(filedAt, RESPONSE_DAYS + APIO_EXTRA_DAYS);
    basis = "apio-35d";
  } else {
    responseDeadline = addDays(filedAt, RESPONSE_DAYS);
    basis = "standard-30d";
  }

  // s.19(1) runs from the expiry of the response window, not from filing.
  const appealDeadline = addDays(responseDeadline, APPEAL_WINDOW_DAYS);

  const effectiveNow = input.simulatedDaysElapsed
    ? addDays(now, input.simulatedDaysElapsed)
    : now;

  const msRemaining = responseDeadline.getTime() - effectiveNow.getTime();
  const isOverdue = msRemaining <= 0;
  const totalWindowMs = responseDeadline.getTime() - filedAt.getTime();
  const elapsed = effectiveNow.getTime() - filedAt.getTime();

  return {
    filedAt,
    responseDeadline,
    appealDeadline,
    effectiveNow,
    msRemaining,
    // Ceil so a deadline 0.2 days away still reads "1 day left", never "0 days
    // left" on a day the citizen can still act.
    daysRemaining: Math.ceil(msRemaining / MS_PER_DAY),
    hoursRemaining: Math.ceil(msRemaining / MS_PER_HOUR),
    isOverdue,
    canAppeal: isOverdue && effectiveNow.getTime() <= appealDeadline.getTime(),
    appealWindowClosed: effectiveNow.getTime() > appealDeadline.getTime(),
    basis,
    totalWindowMs,
    elapsedFraction: Math.min(1, Math.max(0, elapsed / totalWindowMs)),
  };
}

/** Formatted for Indian readers: 22 August 2026, not 8/22/2026. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** `yyyy-mm-dd` in the user's local zone, for `<input type="date">`. */
export function toDateInputValue(date: Date = new Date()): string {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

/**
 * Parse a `yyyy-mm-dd` value from `<input type="date">` as local midnight.
 *
 * `new Date("2026-08-22")` is specified to parse as UTC midnight, which in IST
 * is 05:30 on the 22nd — so every deadline computed from a filing date came
 * out five and a half hours early. Small, but this is the one number in the
 * product that has to be right, and near a boundary it changes the day.
 */
export function parseDateInput(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Describes the remaining time as structured data rather than a sentence.
 *
 * This module stays free of the translation layer — it is pure date maths and
 * is unit-testable on its own — so it returns what to say and the component
 * decides how to say it, in the reader's language. It switches to hours inside
 * the last two days so a 48-hour life-or-liberty case never collapses into a
 * useless "1 day".
 */
export type Remaining =
  | { kind: "overdue-today" }
  | { kind: "overdue"; days: number }
  | { kind: "hours"; hours: number }
  | { kind: "days"; days: number };

export function describeRemaining(clock: Clock): Remaining {
  if (clock.isOverdue) {
    // floor(abs(x)), not abs(floor(x)): floor(-1.6) is -2, which reported a
    // deadline 1.6 days gone as "2 days overdue".
    const days = Math.floor(Math.abs(clock.msRemaining) / MS_PER_DAY);
    return days === 0 ? { kind: "overdue-today" } : { kind: "overdue", days };
  }
  if (clock.msRemaining < 2 * MS_PER_DAY) {
    return { kind: "hours", hours: clock.hoursRemaining };
  }
  return { kind: "days", days: clock.daysRemaining };
}

/** i18n key naming the rule that produced the response deadline. */
export function basisKey(basis: Clock["basis"]): "basis.48h" | "basis.apio" | "basis.standard" {
  switch (basis) {
    case "life-liberty-48h":
      return "basis.48h";
    case "apio-35d":
      return "basis.apio";
    case "standard-30d":
      return "basis.standard";
  }
}
