/* Replays the two measured runs through the new floor. No API calls: the
   scores are already observed, and re-running live only adds a third noisy
   sample against a 5 req/min quota. */
const FLOOR = 0.6;

const RUNS = {
  "run 1 (Gemini)": [
    ["pension, uses 'pension'", "epfo-pension", 0.70, true],
    ["pension, plain words", "epfo-pension", 0.75, true],
    ["PF withdrawal, Hinglish", "epfo-provident-fund", 0.85, true],
    ["passport delay", "passport-office", 0.85, true],
    ["ration card, plain", "ration-pds", 0.85, true],
    ["road not built", "gram-panchayat", 0.50, false],
    ["income tax refund", "income-tax", 0.95, true],
    ["misspelled authority", "epfo-pension", 0.95, true],
    ["railway refund", "railways", 0.95, true],
    ["vague", "mp-mla-local-area-funds", 0.50, false],
  ],
  "run 2 (Groq fallback)": [
    ["pension, uses 'pension'", "epfo-pension", 0.50, true],
    ["pension, plain words", "epfo-pension", 0.75, true],
    ["PF withdrawal, Hinglish", "epfo-provident-fund", 0.90, true],
    ["passport delay", "passport-office", 0.85, true],
    ["ration card, plain", "ration-pds", 0.85, true],
    ["road not built", "gram-panchayat", 0.55, false],
    ["income tax refund", "income-tax", 0.95, true],
    ["misspelled authority", "epfo-pension", 0.95, true],
    ["railway refund", "railways", 0.95, true],
    ["vague", "municipal-corporation", 0.50, false],
  ],
};

for (const [label, rows] of Object.entries(RUNS)) {
  console.log(`\n  ${label}   (floor ${FLOOR}, was 0.5)`);
  console.log("  " + "-".repeat(70));
  let goodFlagged = 0, badFlagged = 0, badMissed = 0;
  for (const [name, id, conf, acceptable] of rows) {
    const was = conf < 0.5, now = conf < FLOOR;
    const change = was === now ? "" : "  ← NEWLY FLAGGED";
    console.log(
      `  ${name.padEnd(26)} ${conf.toFixed(2)}  ${(now ? "LOW" : "   ")}  ${acceptable ? "ok " : "BAD"}${change}`
    );
    if (now && acceptable) goodFlagged++;
    if (now && !acceptable) badFlagged++;
    if (!now && !acceptable) badMissed++;
  }
  console.log(`\n  bad routes caught:      ${badFlagged}/${badFlagged + badMissed}`);
  console.log(`  good routes now warned: ${goodFlagged}  (cost of the floor)`);
}

console.log(`
  ── note ──
  "acceptable" marks whether the authority is a defensible destination, not
  whether confidence was right. gram-panchayat and municipal-corporation are
  State bodies; mp-mla-local-area-funds answers a question the citizen did not
  quite ask. Those are the routes a floor should catch.
`);
