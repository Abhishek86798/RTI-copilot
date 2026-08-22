import type {
  Applicant,
  ApplicationStatus,
  Authority,
  FilingChannel,
} from "./types";
import { EMPTY_APPLICANT } from "./types";
import { computeClock } from "./deadlines";

/**
 * Guest-mode store: the whole citizen journey in `localStorage`.
 *
 * This is not a stripped demo skin. It is the same state shape the signed-in
 * path will persist to Postgres, so the UI reads one type either way and the
 * Clerk/Neon work is a swap of this module's four functions, not a fork of the
 * app. Nothing here leaves the browser.
 */

const STORAGE_KEY = "rti-copilot:applications";
const STORAGE_VERSION = 2;

export type AppealDraft = {
  draftedAt: string;
  /** Grounds under s.19(1) — deemed refusal, or the refusal actually received. */
  grounds: "deemed-refusal" | "unsatisfactory-response";
  text: string;
  filedAt?: string;
  registrationNumber?: string;
};

export type Application = {
  id: string;
  createdAt: string;
  updatedAt: string;

  /* Intake */
  grievance: string;

  /*
   * Full authority snapshot, not just an id. The tracker needs the appellate
   * officer and the central/state level long after routing ran, and a guest
   * session has no server to ask again.
   */
  authority: Authority;
  extractedReferences: string[];

  /* Draft */
  items: string[];
  fullText: string;
  portalText: string;
  lifeOrLibertyFlag: boolean;
  lifeOrLibertyReason: string;

  /* Filing */
  applicant: Applicant;
  status: ApplicationStatus;
  filingChannel?: FilingChannel;
  filedAt?: string;
  /** Registration number the portal issues — the only proof of filing. */
  registrationNumber?: string;
  viaApio: boolean;

  /* Response + appeal */
  responseLoggedAt?: string;
  responseNote?: string;
  appeal?: AppealDraft;

  /** FR-14 demo fast-forward, in days. Only ever set on demo applications. */
  simulatedDaysElapsed?: number;
  /**
   * True when the application came from a seeded demo case rather than the
   * citizen's own text. Gates the "Simulate +31 days" control so the statutory
   * clock can never be spoofed on something genuinely filed.
   */
  isDemo: boolean;
};

type Envelope = {
  version: number;
  applications: Application[];
};

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

/** Subscribe to store changes. Pairs with `useSyncExternalStore`. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    // Keep two open tabs in step.
    window.addEventListener("storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

function read(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Envelope;
    // A shape from an older build is discarded rather than half-migrated;
    // guest data is a working draft, not a record of account.
    if (parsed.version !== STORAGE_VERSION) return [];
    return Array.isArray(parsed.applications) ? parsed.applications : [];
  } catch {
    return [];
  }
}

function write(applications: Application[]) {
  if (typeof window === "undefined") return;
  try {
    const envelope: Envelope = { version: STORAGE_VERSION, applications };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Private browsing, or the quota is full. The in-memory session still
    // works for this visit, so failing silently beats blocking the journey.
  }
  emit();
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

/**
 * Cached so `useSyncExternalStore` gets a referentially stable snapshot and
 * does not loop. Invalidated on every write.
 */
let snapshot: Application[] = [];
let snapshotRaw: string | null = null;

export function listApplications(): Application[] {
  if (typeof window === "undefined") return snapshot;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshot = read();
  }
  return snapshot;
}

export function getApplication(id: string): Application | undefined {
  return listApplications().find((a) => a.id === id);
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

export type NewApplicationInput = {
  grievance: string;
  authority: Authority;
  extractedReferences: string[];
  items: string[];
  fullText: string;
  portalText: string;
  lifeOrLibertyFlag: boolean;
  lifeOrLibertyReason: string;
  isDemo: boolean;
};

export function createApplication(input: NewApplicationInput): Application {
  const now = new Date().toISOString();
  const application: Application = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    applicant: { ...EMPTY_APPLICANT },
    status: "drafting",
    viaApio: false,
    ...input,
  };
  write([application, ...listApplications()]);
  return application;
}

export function updateApplication(
  id: string,
  patch: Partial<Omit<Application, "id" | "createdAt">>
): Application | undefined {
  const all = listApplications();
  const index = all.findIndex((a) => a.id === id);
  if (index < 0) return undefined;

  const next: Application = {
    ...all[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const copy = [...all];
  copy[index] = next;
  write(copy);
  return next;
}

export function deleteApplication(id: string) {
  write(listApplications().filter((a) => a.id !== id));
}

export function clearAll() {
  write([]);
}

/* ------------------------------------------------------------------ */
/* Derived status                                                      */
/* ------------------------------------------------------------------ */

/**
 * Status is derived from the clock, not stored, for everything except the two
 * states only a human can assert: a response arrived, or an appeal was lodged.
 * Storing "overdue" would mean an application sitting in localStorage silently
 * goes stale and shows the wrong badge when the tab is reopened a month later.
 */
export function deriveStatus(application: Application): ApplicationStatus {
  if (application.status === "resolved") return "resolved";
  if (application.appeal?.filedAt) return "appealed";
  if (application.status === "drafting" || !application.filedAt) return "drafting";

  const clock = computeClock({
    filedAt: application.filedAt,
    lifeOrLibertyFlag: application.lifeOrLibertyFlag,
    viaApio: application.viaApio,
    simulatedDaysElapsed: application.simulatedDaysElapsed,
  });

  if (clock.isOverdue) return "overdue";
  return "awaiting-response";
}

/**
 * FR-14: the fast-forward is only ever offered on a seeded demo case. On an
 * application a citizen genuinely filed, spoofing the clock would misstate
 * their real appeal window — the one number in the product that has to be true.
 */
export function canSimulate(application: Application): boolean {
  return application.isDemo && Boolean(application.filedAt);
}
