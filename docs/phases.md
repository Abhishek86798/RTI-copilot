# RTI Copilot — Build Phases

Sequenced for a hackathon clock. Each phase ends in something demoable — never a half-wired feature. P0 items from [PRD.md](./PRD.md) are the floor; P1/P2 only get picked up if time remains.

**These two documents are the contract.** [PRD.md §5](./PRD.md#5-user-flow) defines the citizen journey in four steps; the build phases below deliver it. Every P0 requirement in the PRD appears in exactly one phase here, and no phase is complete while a requirement it owns is open. If the two disagree, the PRD wins and this file is wrong.

**Journey coverage** — PRD §5 step to the phase that delivers it:

| PRD journey step | Requirements | Phase |
|---|---|---|
| Step 1 — NLP intake | FR-1, FR-2, FR-3, FR-4, FR-4a, FR-13 | Phase 1 ✅ |
| Step 2 — Verification | FR-5, plus applicant details for FR-15 | Phase 1 ✅ / Phase 2b |
| Step 3 — Mock settlement + receipt | FR-6, FR-15, FR-16, FR-17, FR-18, FR-19 | Phase 2a ✅ backend / **Phase 2b** |
| Step 4 — Appeals dashboard | FR-7, FR-9, FR-10, FR-14, FR-20 | Phase 3 ✅ |
| (cross-cutting) | FR-8 email, FR-11, FR-12 | Phase 3 ✅ / Phase 5 |

---

## Phase 0 — Scaffold ✅ Complete

Goal: empty app deployed and reachable, so every later phase ships onto a working pipeline instead of debugging deploy config under time pressure.

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui initialized
- Vercel project linked, first deploy green
- Neon Postgres provisioned via Vercel Marketplace, connection string in env
- Clerk provisioned, sign-in/sign-up routes working but gating nothing yet
- Repo structure: `app/`, `lib/`, `data/` (authority dataset), `docs/`

**Demo checkpoint:** empty homepage live on a Vercel URL, sign-in works.

---

## Phase 1 — Guest-mode intake → draft (core thesis, no auth, no DB) ✅ Complete

Goal: prove the actual product idea — plain language in, itemized legal draft out — before anything else gets built on top of it.

- Free-text grievance form (FR-1)
- Curated authority dataset (`data/authorities.json`) covering pension, land records, police, education, ration for one state + central departments
- NLP routing call via Vercel AI SDK (Gemini primary, Groq fallback — both free, no card): grievance → domain → ranked candidate authorities with confidence (FR-2)
- Authority confirm screen — user accepts or edits the AI's pick (FR-3)
- Legal Translation rewrite: grievance → itemized document request, strips interrogatives/opinions (FR-4)
- 3,000-char portal constraint: live counter, prompt constrained to <2,500 chars, full version flagged for PDF (FR-4a)
- Editable draft screen before export (FR-5)
- Everything in this phase persists to `localStorage` only — this **is** Guest Mode, not a separate build

**Demo checkpoint:** a judge types a grievance and gets a legally-shaped, portal-ready draft in one sitting, no login.

---

## Phase 2 — Filing: the submission portal (PRD Step 3)

Goal: close the hole in the middle of the journey. The app routed, drafted and
tracked, but at the moment of filing it sent the citizen to rtionline.gov.in
and asked them to come back and self-report. The hardest step was the one
handed off.

### Phase 2a — Filing backend ✅ Complete

- ~~Life/liberty detection (FR-13)~~ — **done in Phase 1**: it shares the drafting LLM call, so splitting it would have meant a second round-trip for no gain
- ~~Simulated submission portal with real validation (FR-15)~~ — `POST /api/file`. Enforces what the portal enforces, including the rules it only reveals *after* taking the fee: s.3 citizenship, s.6(1) contact details, the s.7(5) certificate a BPL claim depends on, the 3,000-character field, and the Central-only rule that returns a State application unrefunded. Every problem is returned at once — a form that reveals its objections one reload apart is the experience this product replaces.
- ~~Mock settlement (FR-16)~~ — ₹10 confirmation, or a s.7(5) BPL declaration. No payment gateway is contacted.
- ~~Registration number + server-side clock (FR-17)~~ — portal format `DOPPW/R/E/26/00142`; `/A/` for appeals. The clock starts from the server's timestamp, because the filing date is the one fact an applicant cannot otherwise prove.
- ~~Acknowledgement receipt data (FR-18)~~ — registration number, authority, ministry, fee basis, reply-due date.
- ~~`ministry` on Central authorities~~ — the portal makes citizens pick Ministry before Public Authority, which is precisely the knowledge they lack.

**Verified:** `pnpm check:file` drives the real endpoint and covers every rule above.

### Phase 2b — Filing UI (PRD Step 2 + Step 3 screens) ⬅ **current**

The backend is done and tested; the screens a reviewer actually clicks are not.

- **Applicant details (FR-15):** the form has name, address, email, phone and the BPL toggle. **State and PIN are missing** and the API rejects a filing without them.
- **BPL certificate reference (FR-16):** the toggle exists, but s.7(5) makes the exemption depend on the certificate, not the claim — the API refuses a BPL filing without a reference, and the UI has nowhere to give one.
- **Mock payment screen (FR-16):** ₹10 confirmation, plainly labelled as simulated. Not built.
- **Receipt screen (FR-18):** registration number, fee basis, reply-due date, and the print-ready PDF. Not built.
- **Wire the filing step to `/api/file`:** `components/track/filing-guide.tsx` still links out to the real portal and asks for a self-reported date. That link becomes "file here", and the self-reported path stays only for an application genuinely filed on paper elsewhere (FR-7).
- **Simulation labelling (FR-19):** every screen carrying simulated state says so on the screen, not only in the docs. The existing fixture-banner pattern is the model.
- **Server-side PDF (FR-6)** — *deliberately not doing.* `components/track/application-sheet.tsx` plus the print stylesheet already produce a filed-ready A4 document through the browser's own Save-as-PDF, verified against a real print. `@react-pdf` would re-render the same document, add a dependency and a round trip, and upload a page containing someone's PPO number. Revisit only if a browser renders the sheet wrongly.

**Demo checkpoint:** a citizen completes a filing end to end — details, fee or BPL waiver, registration number, receipt — without leaving the product, and a pension grievance shows a 30-day badge while a medical-emergency one shows 48 hours.

---

## Phase 3 — Tracking + Appeals Engine ✅ Complete

Goal: the second half of the pitch — the product doesn't stop at filing, it follows through.

- ~~"Mark as filed" + date entry, starts the countdown (FR-7)~~ — done, with the registration number captured alongside it
- ~~APIO recognition (FR-20)~~ — done: the proviso to s.5(2) adds five days because the clock starts on receipt by the PIO, not the APIO. Shipped in both languages. A 35-day deadline shown as 30 would send the citizen to appeal early.
- ~~Vercel Cron daily sweep~~ — done. `/api/cron/sweep` runs daily at 09:00 IST (`vercel.ts`), drafts the First Appeal the moment the deadline lapses, emails the citizen once, and records that it did. Demo rows are excluded, so a spoofed clock can never drive a real email.
- ~~Auto-drafted First Appeal when the deadline lapses (FR-9)~~ — done, from a template in `lib/client/filing.ts` rather than an LLM call: a First Appeal is formulaic, every field is already known by then, and a template is exact, instant, and works with no network
- ~~Demo-only "Simulate +31 Days" control (FR-14)~~ — done, gated behind `canSimulate()`, which requires `isDemo` — a genuinely filed application can never have its statutory clock spoofed
- ~~Guest Mode gets the same tracking/appeal logic against `localStorage`~~ — done; `lib/client/guest-storage.ts` holds the same shape Postgres will, so Phase 4 swaps the storage module rather than forking the UI

**Backend, now built:**

| What | Where it plugs in |
|------|-------------------|
| Postgres persistence | ✅ `lib/server/db/applications.ts` mirrors guest-storage's four functions and returns the same `Application` shape. Schema in `lib/server/db/schema.ts`; migrations in `drizzle/`, applied with `pnpm db:push`. Every query filters on `userId`. |
| Vercel Cron daily sweep | ✅ `/api/cron/sweep`, gated behind `CRON_SECRET` — without it the endpoint is a public trigger for emailing every user. Reuses `computeClock()` rather than restating the clock. |
| Resend deadline emails | ✅ `lib/server/email.ts`. Two notices: deadline lapsed, and appeal window closing within 7 days. Falls back to logging when `RESEND_API_KEY` is absent, so the pipeline is testable before a sender domain is verified. |
| Server-side appeal drafting | ✅ The sweep calls the same `buildFirstAppeal()` template the client uses. Still deliberately not a model call — a First Appeal is formulaic and every field is known by then. |

Deadline maths lives in `lib/client/deadlines.ts`, tied clause by clause to the Act (s.7(1), its proviso, the proviso to s.5(2), s.19(1)) rather than approximated. **Reuse it server-side rather than reimplementing** — it is plain TypeScript with no React or browser dependency.

**Demo checkpoint:** file a guest-mode application, hit "Simulate +31 Days," watch the First Appeal draft itself.

**Verified end to end** (`pnpm check:sweep`, against the real database): an application filed 40 days ago becomes overdue, drafts an appeal citing s.19(1) carrying the applicant's details, emails once — and a second sweep stays silent. The re-run is the point: a cron that mails the same person every morning about the same lapse is worse than one that never fires.

---

## Phase 4 — Real accounts (signed-in mode) ✅ Complete

Goal: turn on the production path alongside guest mode, not instead of it.

- ~~Clerk-gated save/track flow, backed by Neon Postgres~~ — done. `lib/client/store.ts` reads `localStorage` as a guest and `/api/applications` when signed in, so the UI reads one type either way and no screen forked.
- ~~Guest → account migration on sign-in~~ — done, and opt-in by design: a guest draft can carry a PPO, FIR or PAN number, so nothing uploads without a click. `components/migrate-prompt.tsx`, in both languages.
- Per-user dashboard: Drafting / Filed / Awaiting Response / Overdue / Appealed / Resolved (FR-10)
- ~~Resend integration (FR-8)~~ — built in Phase 3; needs a verified sender domain and `RESEND_API_KEY` to send rather than log
- Landing page offers both entry points equally: "Try Demo Case" (Guest) and "Sign up" (real)

**Demo checkpoint:** the same flow from Phase 1–3, now also available signed-in with a dashboard and a real reminder email.

---

## Frontend notes (Phases 1–3 UI)

The citizen-facing surface is built out across five screens — intake, authority
confirmation, draft, filing, tracking/appeal — plus a dashboard and an honesty
page at `/how-it-works` that states plainly what is live and what is mocked.

Decisions worth knowing before changing things:

- **`lib/client/api.ts` is the only place the UI talks to the backend.** Paths,
  request shapes, timeout, and the translation of an HTTP failure into a
  sentence a citizen can act on all live there. Adding an endpoint means
  changing that file and nothing else.
- **The fixture fallback is deliberately narrow.** If a call fails, the three
  seeded demo cases fall back to a saved response so the journey still runs;
  text a citizen wrote themselves always surfaces the error instead. Inventing
  an authority match or an RTI draft for real input would be worse than an
  outage. Whenever a fixture is used, a banner says so.
- **Central vs State filing channel.** rtionline.gov.in serves Central
  authorities only and returns a State application *without refunding the fee*
  — so `lib/client/filing.ts` derives the channel from `authority.level` and
  warns before the citizen pays. More than half the directory is state-level.
- **Clerk is loaded behind a flag.** A static import of `@clerk/nextjs` throws
  on every request when no publishable key is set, which took down the guest
  journey too. `lib/client/auth-config.ts` gates it, and `proxy.ts` installs
  the middleware only when both keys are present. A fresh clone with no `.env`
  now runs the whole guest flow.
- **English + Hindi interface.** The chrome is translated; the generated RTI
  application is not, because a PIO expects it in English or the state's
  official language and machine-translating a legal document risks changing
  what was actually requested.
- **Accessibility is checked, not assumed.** All eleven screen states pass axe
  at WCAG 2.1 AA with zero violations. Touch targets are 44px, body text is
  17px on mobile, status is never carried by colour alone, and zoom is never
  suppressed.

---

## Phase 5 — Polish + stretch (only if time remains)

P1/P2 items, picked up in this order if the clock allows:

1. BPL fee-exemption flag on the PDF (FR-11)
2. Hindi translation toggle on the final draft (FR-12)
3. Draft audit trail — diff view between original grievance and generated draft (NFR: auditability)
4. Accessibility pass — screen reader labels, low-bandwidth check on the intake flow

**Cut line:** if the hackathon clock runs out before Phase 5, the product still stands on Phases 0–4 — that's the full P0 surface and both entry modes working end to end.

---

## Known gaps — carry into every phase

These are open weaknesses in what Phase 1 shipped, not future features. Fix them whenever there's slack; both directly cap demo quality.

### ⚠️ Expand `data/authorities.json` — only 5 entries today

The dataset currently covers exactly five domains: pension (EPFO), land records, police, education, ration. Routing is grounded in this file by design — `shortlistAuthorities()` keyword-matches in our own code and the LLM may only rank IDs from that shortlist, so a hallucinated authority is discarded rather than shown. That makes the file, not the model, the accuracy ceiling.

The failure mode: a grievance outside those five domains (municipal water, electricity board, PDS grievance redressal, income tax, passport, RTO…) hits the `else` branch and the LLM is handed all five entries to pick the least-wrong one. It will return something with a confident-looking score, and it will be wrong.

This is pure data entry, no model work. Highest-leverage improvement available — every entry added widens what the demo can survive being asked.

**Update (20 entries):** the core citizen domains are now covered and all 20 route correctly under test. Remaining coverage gaps are the long tail (state-specific boards, universities, PSUs, courts), which matter less for a demo than for real use.

### Deliberately NOT doing: replacing keyword matching with LLM domain classification

Considered and rejected at the current scale. The keyword pre-filter is not there for accuracy — it's there so the model can only ever return an ID we already recognise, which is what makes a hallucinated authority impossible rather than merely unlikely. Replacing it with an LLM classification step would move that guarantee from code into a second model call.

At 20 entries the whole directory fits in the prompt comfortably, so the pre-filter is an optimisation, not a necessity — and routing currently passes 22/22. Revisit if the directory grows past roughly 100 entries (where prompt size starts to matter), or if fixtures start failing because a grievance uses vocabulary no keyword list anticipated. Add misspellings and Hindi/transliterated terms to `keywords` before reaching for a model.

### ⚠️ Improve and validate the system prompts

Current state after Phase 1 testing:

- **Drafting prompt — works well.** Verified live: emotional/interrogative input became itemized document requests with reference numbers preserved verbatim.
- ~~**Life/liberty detection (FR-13) — works, but thinly tested.**~~ **Addressed.** The prompt now encodes the CIC's narrow test (imminent danger, records must be capable of changing the outcome) with explicit non-qualifying examples, and requires the model to state *why* it flagged. Covered by `data/fr13-fixtures.json` — 7 cases including five false-positive traps — run via `node scripts/check-fr13.mjs`. Expand the fixture set when new domains are added.
- **Confidence scores are uncalibrated.** The number the model emits (`0.98`) is a generated token, not a probability. Fine as a coarse UI signal, but it must not be presented as a real accuracy figure, and thresholds keyed off it are guesswork.

Both calls now run at `temperature: 0`. They are classification and extraction, not creative writing, and sampling made boundary cases non-deterministic — one fixture flipped between true and false across 6 identical runs before this was fixed.

**Both prompts are now regression-tested.** With a dev server running:

```
pnpm check:prompts     # routing (22 cases) + FR-13 (7 cases)
```

`data/routing-fixtures.json` covers all 20 domains, three confusable pairs (the three pension types, water vs municipal, panchayat vs MGNREGA), and two out-of-scope grievances that must be flagged uncertain rather than forced into a match. Add a fixture whenever an authority is added or a routing mistake is found.

---

## Out of scope for any phase

Carried from [PRD.md §6](./PRD.md#6-scope-for-the-hackathon-build-mvp) — do not build these even if time allows, they're post-hackathon:

- Direct e-filing / write API to rtionline.gov.in
- Online fee payment collection
- Full 36-state + all-ministry authority directory
- Second Appeal / Section 18 complaint drafting
- SMS/WhatsApp reminders
