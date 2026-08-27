import raw from "@/data/authorities.json";

import type { Authority } from "./types";

/**
 * The public authority directory, for the browser.
 *
 * The real Submit Request form opens with two dropdowns — Ministry, then the
 * Public Authority inside it — and that pair is the single hardest thing about
 * filing an RTI, because it assumes the applicant already knows India's
 * administrative structure. Answering it for them is what this product is for.
 *
 * But the real form also lets you override the choice, and so must this one.
 * A routing guess the applicant cannot correct is worse than a dropdown they
 * struggled with: it takes the one decision that determines whether the
 * request reaches anyone and hides it. So the dropdowns are here, pre-selected
 * from routing, and changeable.
 *
 * `keywords` is stripped on the way through. It exists only for the server's
 * pre-filter and is the bulk of the file; shipping it to the browser would
 * send a few kilobytes of matching vocabulary nobody here reads.
 */
type RawAuthority = Authority & { keywords?: string[] };

export const AUTHORITIES: Authority[] = (raw as RawAuthority[]).map((entry) => ({
  id: entry.id,
  domain: entry.domain,
  authorityName: entry.authorityName,
  pioDesignation: entry.pioDesignation,
  appellateAuthority: entry.appellateAuthority,
  ministry: entry.ministry,
  filingAddress: entry.filingAddress,
  verifyAt: entry.verifyAt,
  level: entry.level,
  notes: entry.notes,
}));

/**
 * Ministries, in the order the directory lists them, each with the authorities
 * that sit under it.
 *
 * State authorities have no ministry — they answer to a state government, not
 * to the Centre — so they are grouped under a heading of their own rather than
 * dropped. The real portal simply does not list them; ours shows them because
 * routing can still land on one, and saying so is more useful than pretending
 * the authority does not exist.
 */
export type MinistryGroup = { ministry: string; authorities: Authority[] };

export const STATE_GROUP_LABEL = "State public authorities";

export function ministryGroups(): MinistryGroup[] {
  const groups = new Map<string, Authority[]>();

  for (const authority of AUTHORITIES) {
    const key = authority.ministry ?? STATE_GROUP_LABEL;
    const existing = groups.get(key);
    if (existing) existing.push(authority);
    else groups.set(key, [authority]);
  }

  return [...groups.entries()]
    .map(([ministry, authorities]) => ({
      ministry,
      authorities: [...authorities].sort((a, b) =>
        a.authorityName.localeCompare(b.authorityName)
      ),
    }))
    .sort((a, b) => {
      // State authorities last: this portal is a Central one, and the grouping
      // should say so without hiding them.
      if (a.ministry === STATE_GROUP_LABEL) return 1;
      if (b.ministry === STATE_GROUP_LABEL) return -1;
      return a.ministry.localeCompare(b.ministry);
    });
}

export function authorityById(id: string): Authority | undefined {
  return AUTHORITIES.find((authority) => authority.id === id);
}

/** The group heading an authority belongs to. */
export function ministryOf(authority: Authority): string {
  return authority.ministry ?? STATE_GROUP_LABEL;
}
