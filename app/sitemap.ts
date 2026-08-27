import type { MetadataRoute } from "next";

/**
 * `/sitemap.xml`, for crawlers. The human-readable index GIGW requires is a
 * separate page at `/sitemap`.
 *
 * Only the public, linkable routes are listed. `/applications/[id]` is
 * deliberately absent: those ids are per-browser and the pages hold someone's
 * pension or FIR details, so they are not addressable content to be indexed.
 */
const ROUTES = [
  { path: "", priority: 1, frequency: "monthly" as const },
  { path: "apply", priority: 0.9, frequency: "monthly" as const },
  { path: "manual", priority: 0.7, frequency: "monthly" as const },
  { path: "faq", priority: 0.7, frequency: "monthly" as const },
  { path: "payment-reconciliation", priority: 0.6, frequency: "yearly" as const },
  { path: "contact", priority: 0.6, frequency: "yearly" as const },
  { path: "how-it-works", priority: 0.6, frequency: "monthly" as const },
  { path: "accessibility", priority: 0.5, frequency: "yearly" as const },
  { path: "policies", priority: 0.4, frequency: "yearly" as const },
  { path: "sitemap", priority: 0.3, frequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rti-copilot.vercel.app";
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: route.path ? `${base}/${route.path}` : base,
    lastModified,
    changeFrequency: route.frequency,
    priority: route.priority,
  }));
}
