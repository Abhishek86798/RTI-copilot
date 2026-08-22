import authorities from "@/data/authorities.json";

export type Authority = {
  id: string;
  domain: string;
  keywords: string[];
  authorityName: string;
  pioDesignation: string;
  filingAddress: string;
  level: "central" | "state";
};

export function getAllAuthorities(): Authority[] {
  return authorities as Authority[];
}

export function getAuthorityById(id: string): Authority | undefined {
  return getAllAuthorities().find((a) => a.id === id);
}

/**
 * Keyword pre-filter so LLM routing picks from a shortlist grounded in the
 * curated dataset instead of hallucinating an authority name from scratch.
 */
export function shortlistAuthorities(grievance: string, limit = 5): Authority[] {
  const text = grievance.toLowerCase();
  const scored = getAllAuthorities().map((authority) => {
    const hits = authority.keywords.filter((kw) => text.includes(kw.toLowerCase())).length;
    return { authority, hits };
  });

  const matched = scored.filter((s) => s.hits > 0).sort((a, b) => b.hits - a.hits);
  const candidates = matched.length > 0 ? matched.map((s) => s.authority) : getAllAuthorities();

  return candidates.slice(0, limit);
}
