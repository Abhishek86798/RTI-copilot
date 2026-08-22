const STORAGE_KEY = "rti-copilot:guest-applications";

export type GuestApplication = {
  id: string;
  createdAt: string;
  grievance: string;
  authorityId: string;
  authorityName: string;
  extractedReferences: string[];
  items: string[];
  fullText: string;
  portalText: string;
  lifeOrLibertyFlag: boolean;
  status: "drafting" | "filed";
  filedAt?: string;
};

function readAll(): GuestApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GuestApplication[]) : [];
  } catch {
    return [];
  }
}

function writeAll(apps: GuestApplication[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export function saveGuestApplication(app: GuestApplication) {
  const apps = readAll();
  const existingIndex = apps.findIndex((a) => a.id === app.id);
  if (existingIndex >= 0) {
    apps[existingIndex] = app;
  } else {
    apps.unshift(app);
  }
  writeAll(apps);
}

export function listGuestApplications(): GuestApplication[] {
  return readAll();
}

export function getGuestApplication(id: string): GuestApplication | undefined {
  return readAll().find((a) => a.id === id);
}
