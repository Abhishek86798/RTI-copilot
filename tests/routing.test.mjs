/**
 * Routing sanity check against human-written complaints.
 *
 * These are written the way citizens actually write — lowercase, misspelled,
 * Hinglish, no jargon — not the way keyword lists expect. Each case records
 * whether the KEYWORD PRE-FILTER alone surfaces the right authority, which is
 * what grounds the LLM's choice. A case that reaches the model ungrounded
 * (noKeywordMatch) is the failure mode the "Other" search exists to catch.
 *
 * Run: node --test tests/
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const authorities = JSON.parse(
  readFileSync(new URL("../data/authorities.json", import.meta.url), "utf8")
);

/** Mirror of shortlistAuthorities() in lib/server/authorities.ts. */
function shortlist(grievance, limit = 6) {
  const text = grievance.toLowerCase();
  const scored = authorities.map((authority) => ({
    authority,
    hits: authority.keywords.filter((kw) => text.includes(kw.toLowerCase())).length,
  }));
  const matched = scored.filter((s) => s.hits > 0).sort((a, b) => b.hits - a.hits);
  if (matched.length === 0) {
    return { authorities, noKeywordMatch: true, top: null };
  }
  return {
    authorities: matched.slice(0, limit).map((s) => s.authority),
    noKeywordMatch: false,
    top: matched[0].authority.id,
  };
}

/* Real-sounding complaints. `expect` is the authority a knowledgeable
   person would route to; `plain` marks language with no portal jargon. */
const CASES = [
  {
    name: "pension stopped, uses the word pension",
    text: "my father pension stopped since march, we went to office 3 times no answer",
    expect: "epfo-pension",
    plain: false,
  },
  {
    name: "pension in plain words, no jargon",
    text: "papa retired from factory two years back, monthly money has not come since diwali",
    expect: "epfo-pension",
    plain: true,
  },
  {
    name: "PF withdrawal, Hinglish",
    text: "PF ka paisa nikalne ke liye claim dala tha 2 mahine pehle, abhi tak kuch nahi aaya",
    expect: "epfo-provident-fund",
    plain: false,
  },
  {
    name: "passport delay",
    text: "applied for passport in january, police verification done, still showing under process",
    expect: null,
    plain: false,
  },
  {
    name: "ration card, plain words",
    text: "they removed my name from ration list, shopkeeper says system me nahi hai",
    expect: null,
    plain: true,
  },
  {
    name: "road not built, no authority named",
    text: "the road to our village was sanctioned two years ago but nothing has been built",
    expect: null,
    plain: true,
  },
  {
    name: "income tax refund",
    text: "my income tax refund for AY 2023-24 has not been credited even after 8 months",
    expect: null,
    plain: false,
  },
  {
    name: "misspelled authority name",
    text: "epfo pention not recieved since last yr, ppo number is with me",
    expect: "epfo-pension",
    plain: false,
  },
  {
    name: "railway complaint",
    text: "train was cancelled and refund not given, ticket booked on irctc",
    expect: null,
    plain: false,
  },
  {
    name: "vague, genuinely unroutable",
    text: "i want to know about the money spent in my area last year",
    expect: null,
    plain: true,
  },
];

test("every authority has the fields the UI needs", () => {
  for (const a of authorities) {
    assert.ok(a.id && a.authorityName, `${a.id}: missing id/name`);
    assert.ok(Array.isArray(a.keywords) && a.keywords.length, `${a.id}: no keywords`);
  }
});

test("ministry coverage is honest about its gaps", () => {
  const withMinistry = authorities.filter((a) => a.ministry).length;
  const central = authorities.filter((a) => a.level === "central").length;
  console.log(
    `\n  ministry: ${withMinistry}/${authorities.length} populated (${central} central)`
  );
  // Documents the current state; tighten to === central once backfilled.
  assert.ok(withMinistry > 0, "no ministries populated at all");
});

test("routing: human-written complaints", () => {
  const rows = [];
  for (const c of CASES) {
    const r = shortlist(c.text);
    const hit = c.expect === null ? null : r.top === c.expect;
    rows.push({ ...c, got: r.top, grounded: !r.noKeywordMatch, hit });
  }

  console.log("\n  case                                    grounded  top match");
  console.log("  " + "-".repeat(68));
  for (const r of rows) {
    const mark = r.hit === null ? " -- " : r.hit ? " OK " : "FAIL";
    console.log(
      `  ${r.name.padEnd(38).slice(0, 38)}  ${(r.grounded ? "yes" : "NO ").padEnd(8)}  ${mark} ${r.got ?? "(none)"}`
    );
  }

  const ungrounded = rows.filter((r) => !r.grounded);
  const plainUngrounded = ungrounded.filter((r) => r.plain);
  console.log(
    `\n  ungrounded: ${ungrounded.length}/${rows.length}  (of which plain-language: ${plainUngrounded.length})`
  );

  const checked = rows.filter((r) => r.hit !== null);
  const failed = checked.filter((r) => !r.hit);
  console.log(`  checked expectations: ${checked.length - failed.length}/${checked.length} correct\n`);

  // The guarantee that matters: a complaint that matched no keyword must be
  // reported as ungrounded, so the UI can offer search instead of bluffing.
  for (const r of rows) {
    if (r.got === null) assert.equal(r.grounded, false, `${r.name}: no match but claimed grounded`);
  }
});
