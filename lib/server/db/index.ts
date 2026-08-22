import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Lazy, because guest mode must work with no database at all.
 *
 * A module-level connection would throw at import time on a clone with no
 * DATABASE_URL and take the guest journey down with it — the same failure the
 * Clerk guard in proxy.ts exists to prevent.
 */
let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — signed-in persistence is unavailable.");
  }
  cached ??= drizzle(neon(process.env.DATABASE_URL), { schema });
  return cached;
}

export { schema };
