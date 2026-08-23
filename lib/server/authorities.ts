import authorities from "@/data/authorities.json";

export type Authority = {
  id: string;
  domain: string;
  keywords: string[];
  authorityName: string;
  pioDesignation: string;
  /** Who a First Appeal goes to under Section 19(1) — always an officer senior to the PIO within the same public authority. Used by the Phase 3 appeals engine. */
  appellateAuthority: string;
  filingAddress: string;
  /** Official source the user should check to confirm the exact jurisdictional office. */
  verifyAt?: string;
  level: "central" | "state";
  /**
   * The Ministry this authority sits under on rtionline.gov.in. The portal
   * makes citizens pick Ministry first, then Public Authority within it —
   * knowing which Ministry runs EPFO is precisely the knowledge they lack.
   * Only Central authorities have one; the portal does not serve State bodies.
   */
  ministry?: string;
  /** Domain-specific caveats worth surfacing (exemptions, coverage limits). */
  notes?: string;
};

export function getAllAuthorities(): Authority[] {
  return authorities as Authority[];
}

export function getAuthorityById(id: string): Authority | undefined {
  return getAllAuthorities().find((a) => a.id === id);
}

export type Shortlist = {
  authorities: Authority[];
  /** True when no keyword matched and the whole directory was passed through — the model is choosing without any grounding signal, so its confidence should be treated as weak. */
  noKeywordMatch: boolean;
};

/**
 * Keyword pre-filter so LLM routing picks from a shortlist grounded in the
 * curated dataset instead of hallucinating an authority name from scratch.
 *
 * When nothing matches we pass the full directory rather than an arbitrary
 * slice of it: truncating by file order would silently hide most authorities
 * from the model and bias every unmatched grievance toward whichever entries
 * happen to sit at the top of the JSON.
 */
export function shortlistAuthorities(grievance: string, limit = 6): Shortlist {
  const text = grievance.toLowerCase();
  const scored = getAllAuthorities().map((authority) => {
    const hits = authority.keywords.filter((kw) => text.includes(kw.toLowerCase())).length;
    return { authority, hits };
  });

  const matched = scored.filter((s) => s.hits > 0).sort((a, b) => b.hits - a.hits);

  if (matched.length === 0) {
    return { authorities: getAllAuthorities(), noKeywordMatch: true };
  }

  return { authorities: matched.slice(0, limit).map((s) => s.authority), noKeywordMatch: false };
}
