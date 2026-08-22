import type { VercelConfig } from "@vercel/config/v1";

/**
 * Daily deadline sweep.
 *
 * 03:30 UTC is 09:00 IST — a notice that someone's RTI deadline has lapsed
 * should land at the start of their day, not overnight.
 */
export const config: VercelConfig = {
  crons: [{ path: "/api/cron/sweep", schedule: "30 3 * * *" }],
};
