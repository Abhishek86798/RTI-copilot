/**
 * Measures the REAL end-to-end miss rate: the same 10 human-written
 * complaints from routing.test.mjs, routed through the production
 * routeGrievance() against the live model.
 *
 * routing.test.mjs measures keyword GROUNDING. This measures what the citizen
 * actually sees, which is the number that should decide whether the "Other"
 * search fallback is P0 or a P2 safety valve.
 */
import "./env.mjs";
import { routeGrievance, CONFIDENCE_FLOOR } from "@/lib/server/ai";
import { shortlistAuthorities } from "@/lib/server/authorities";

type Case = { name: string; text: string; expect: string | null; plain: boolean };

const CASES: Case[] = [
  { name: "pension, uses 'pension'", text: "my father pension stopped since march, we went to office 3 times no answer", expect: "epfo-pension", plain: false },
  { name: "pension, plain words", text: "papa retired from factory two years back, monthly money has not come since diwali", expect: "epfo-pension", plain: true },
  { name: "PF withdrawal, Hinglish", text: "PF ka paisa nikalne ke liye claim dala tha 2 mahine pehle, abhi tak kuch nahi aaya", expect: "epfo-provident-fund", plain: true },
  { name: "passport delay", text: "applied for passport in january, police verification done, still showing under process", expect: null, plain: false },
  { name: "ration card, plain", text: "they removed my name from ration list, shopkeeper says system me nahi hai", expect: null, plain: true },
  { name: "road not built", text: "the road to our village was sanctioned two years ago but nothing has been built", expect: null, plain: true },
  { name: "income tax refund", text: "my income tax refund for AY 2023-24 has not been credited even after 8 months", expect: null, plain: false },
  { name: "misspelled authority", text: "epfo pention not recieved since last yr, ppo number is with me", expect: "epfo-pention".replace("pention", "pension"), plain: false },
  { name: "railway refund", text: "train was cancelled and refund not given, ticket booked on irctc", expect: null, plain: false },
  { name: "vague", text: "i want to know about the money spent in my area last year", expect: null, plain: true },
];

type Row = Case & { grounded: boolean; got: string; conf: number; low: boolean; reason: string };
const rows: Row[] = [];

for (const c of CASES) {
  const { noKeywordMatch } = shortlistAuthorities(c.text);
  try {
    const r = await routeGrievance(c.text);
    const top = r.candidates[0];
    rows.push({ ...c, grounded: !noKeywordMatch, got: top?.authority.id ?? "(none)", conf: top?.confidence ?? 0, low: r.lowConfidence, reason: top?.reason ?? "" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    rows.push({ ...c, grounded: !noKeywordMatch, got: "ERROR", conf: 0, low: true, reason: msg.slice(0, 70) });
  }
}

console.log("\n     case                        grnd  top authority          conf  flag");
console.log("     " + "-".repeat(74));
for (const r of rows) {
  const mark = r.expect === null ? " " : r.got === r.expect ? "*" : "x";
  console.log(`   ${mark} ${r.name.padEnd(26).slice(0, 26)} ${r.grounded ? "yes" : "NO "}   ${r.got.padEnd(21).slice(0, 21)} ${r.conf.toFixed(2)}  ${r.low ? "LOW" : ""}`);
}

const ungrounded = rows.filter((r) => !r.grounded);
const recovered = ungrounded.filter((r) => !r.low && r.got !== "(none)" && r.got !== "ERROR");
const checked = rows.filter((r) => r.expect !== null);
const correct = checked.filter((r) => r.got === r.expect);
const plain = rows.filter((r) => r.plain);

console.log("\n  ── results ──");
console.log(`  keyword-ungrounded:         ${ungrounded.length}/${rows.length}`);
console.log(`  ...recovered by model:      ${recovered.length}/${ungrounded.length}`);
console.log(`  expectations correct:       ${correct.length}/${checked.length}`);
console.log(`  plain-language flagged LOW: ${plain.filter((r) => r.low).length}/${plain.length}`);
console.log(`  total flagged LOW:          ${rows.filter((r) => r.low).length}/${rows.length}  (floor ${CONFIDENCE_FLOOR})`);
console.log(`  errors:                     ${rows.filter((r) => r.got === "ERROR").length}/${rows.length}`);

console.log("\n  ── model reasons ──");
for (const r of rows) console.log(`  ${r.name}\n    → ${r.got} (${r.conf.toFixed(2)}) ${r.low ? "[LOW] " : ""}${r.reason}`);
