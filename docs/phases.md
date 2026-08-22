# RTI Copilot — Build Phases

Sequenced for a hackathon clock. Each phase ends in something demoable — never a half-wired feature. P0 items from [PRD.md](./PRD.md) are the floor; P1/P2 only get picked up if time remains after Phase 4.

---

## Phase 0 — Scaffold

Goal: empty app deployed and reachable, so every later phase ships onto a working pipeline instead of debugging deploy config under time pressure.

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui initialized
- Vercel project linked, first deploy green
- Neon Postgres provisioned via Vercel Marketplace, connection string in env
- Clerk provisioned, sign-in/sign-up routes working but gating nothing yet
- Repo structure: `app/`, `lib/`, `data/` (authority dataset), `docs/`

**Demo checkpoint:** empty homepage live on a Vercel URL, sign-in works.

---

## Phase 1 — Guest-mode intake → draft (core thesis, no auth, no DB)

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

## Phase 2 — Life/liberty detection + PDF export

Goal: round out the drafting experience with the two remaining P0 drafting features.

- Life/liberty marker detection in the NLP extractor; urgent badge "Flagged under Section 7(1): 48-Hour Statutory Window Applicable" (FR-13)
- Server-side PDF generation matching standard RTI application format — applicant details, authority, itemized request, fee line (FR-6)
- PDF always carries the full (unconstrained) draft even when the on-screen/portal version was trimmed for length

**Demo checkpoint:** a pension grievance shows a normal 30-day badge; a medical-emergency grievance shows the 48-hour badge; both export a clean PDF.

---

## Phase 3 — Tracking + Appeals Engine

Goal: the second half of the pitch — the product doesn't stop at filing, it follows through.

- "Mark as filed" + date entry, starts the 30-day (or 48-hour, from Phase 2) countdown (FR-7)
- Vercel Cron daily sweep checking open applications against their deadline
- Auto-drafted First Appeal when the deadline lapses without a logged response, addressed to the Appellate Authority (FR-9)
- **Demo-only "Simulate +31 Days" control** — fast-forwards an application's clock so the appeal auto-trigger can be shown live, clearly labeled as a demo aid and never reachable on a real filed application (FR-14)
- Guest Mode gets the same tracking/appeal logic, running entirely against `localStorage` state

**Demo checkpoint:** file a guest-mode application, hit "Simulate +31 Days," watch the First Appeal draft itself.

---

## Phase 4 — Real accounts (signed-in mode)

Goal: turn on the production path alongside guest mode, not instead of it.

- Clerk-gated save/track flow, backed by Neon Postgres (applications, users, deadline state)
- Per-user dashboard: Drafting / Filed / Awaiting Response / Overdue / Appealed / Resolved (FR-10)
- Resend integration: deadline-approaching and deadline-lapsed emails (FR-8)
- Landing page offers both entry points equally: "Try Demo Case" (Guest) and "Sign up" (real)

**Demo checkpoint:** the same flow from Phase 1–3, now also available signed-in with a dashboard and a real reminder email.

---

## Phase 5 — Polish + stretch (only if time remains)

P1/P2 items, picked up in this order if the clock allows:

1. BPL fee-exemption flag on the PDF (FR-11)
2. Hindi translation toggle on the final draft (FR-12)
3. Draft audit trail — diff view between original grievance and generated draft (NFR: auditability)
4. Accessibility pass — screen reader labels, low-bandwidth check on the intake flow

**Cut line:** if the hackathon clock runs out before Phase 5, the product still stands on Phases 0–4 — that's the full P0 surface and both entry modes working end to end.

---

## Out of scope for any phase

Carried from [PRD.md §6](./PRD.md#6-scope-for-the-hackathon-build-mvp) — do not build these even if time allows, they're post-hackathon:

- Direct e-filing / write API to rtionline.gov.in
- Online fee payment collection
- Full 36-state + all-ministry authority directory
- Second Appeal / Section 18 complaint drafting
- SMS/WhatsApp reminders
