# RTI Copilot — Product Requirements Document

**Track:** Build What Moves India (Hackathon)
**Status:** Draft v0.2
**Date:** 2026-08-22

---

## 1. Overview

RTI Copilot is a plain-language intake layer for India's Right to Information Act, 2005. A citizen describes their grievance in everyday language; the product identifies the correct Public Authority, rewrites the grievance into an itemized, non-interrogative request for records, and tracks the statutory clock so the citizen doesn't miss the window to escalate.

The wedge is narrow on purpose — two boring, fixable failure modes cause most rejected/misdirected RTI filings:
1. **Wrong authority** — triggers a Section 6(3) transfer, resetting the clock.
2. **Wrong phrasing** — asking "why" instead of asking for a document; authorities can legally reject requests for opinions/explanations under Section 2(f).

Fixing those two failure modes is the entire MVP.

---

## 2. Problem

The RTI Online portal presents a cascading dropdown (Ministry → Department → Public Authority) that assumes the filer already knows India's administrative structure. First-time filers don't.

**Example — fails today:**
> "Why was my father's pension stopped without any notice? This is completely unfair and someone needs to explain what happened."

**Example — accepted on filing:**
> "Provide certified copies of: (1) the order/noting discontinuing pension PPO No. XXXX effective [date], (2) all file notings between [dates] relating to the discontinuation, (3) the name and designation of the officer who authorised it."

Most first-time filers write like the first example and never learn why no reply comes.

---

## 3. Users & Personas

- **Primary — First-time filer.** Has a specific personal grievance (pension, land record, ration card, FIR status), no RTI experience, motivated by frustration not process knowledge. Needs routing + translation in one sitting or abandons.
- **Secondary — Repeat filer / activist.** Files periodically, understands the Act loosely, wants speed and an appeals safety net more than hand-holding on phrasing.

---

## 4. Solution

Three capabilities, applied in sequence to every submission:

1. **NLP Routing** — parses the free-text grievance, extracts the governing scheme/domain (pension, land, police, education, ration, etc.), and maps it to the correct Public Authority + PIO address on file, avoiding Section 6(3) transfers.
2. **Legal Translation** — rewrites the emotional/interrogative complaint into an itemized request for specific documents, file notings, and orders — the form the Act actually compels a reply to.
3. **Appeals Engine** — starts a 30-day statutory clock (35 days if routed via an APIO) on submission, and auto-drafts the First Appeal to the designated Appellate Authority if the deadline lapses with no response.

---

## 5. User Flow

1. **Describe** — free-text box: "What happened?" No dropdowns.
2. **Confirm authority** — AI proposes Public Authority + PIO; user confirms or edits.
3. **Review draft** — itemized RTI application shown side-by-side with original text, live character counter against the 3,000-char portal limit.
4. **File** — export as PDF/print, or use alongside RTI Online with fee details.
5. **Track** — 30-day countdown; auto First Appeal draft on lapse.

### Entry modes

- **Guest / Demo Mode** — no signup. State persists to `localStorage` only. Full flow works: Intake → Draft → File → (demo-only) Fast-forward → Appeal. Exists specifically so a hackathon judge can run the entire flow in under 10 seconds without typing an email or password.
- **Signed-in mode** — Clerk auth, Postgres-backed. Persists across devices, powers the real dashboard and real email reminders. This is the production path, not a fallback.

Both modes ship. Guest mode is not a stripped demo skin bolted on afterward — it's the same UI and same drafting/routing logic, just backed by `localStorage` instead of Postgres, so building it doesn't fork the app in two.

---

## 6. Scope for the Hackathon Build (MVP)

Core thesis to prove end to end: **plain language in → correctly routed, legally valid application out → tracked to appeal.**

### In scope
- Single free-text intake form; **Guest Mode** (localStorage, no signup) and **real signup/login** (Clerk + Postgres) both available from the landing page.
- Authority routing over a curated static dataset of common central departments + one state (not the full live RTI Online directory).
- LLM-based rewrite into itemized, document-specific request language, constrained to fit the RTI Online portal's 3,000-character box (see FR-4a).
- Editable draft before export — user always has final say.
- PDF export formatted per RTI Rules (applicant details, authority, itemized request, fee declaration line) — carries the full version when the on-portal draft is trimmed for length.
- Life/liberty urgency detection surfacing the Section 7(1) 48-hour window (see FR-13).
- Manual "mark as filed" + date, driving a 30-day countdown.
- Auto-generated First Appeal draft, triggered on deadline lapse or manual "no response" flag.
- Demo-only "Simulate +31 Days" control to fast-forward the countdown and show the appeal auto-trigger without waiting a real month (see FR-14).

### Out of scope (post-hackathon)
- Direct e-filing / API integration with rtionline.gov.in (no public write API exists today).
- Online fee payment (₹10 IPO/court fee) collection or remittance.
- Full 36-state + all-ministry authority directory.
- Second Appeal to the Information Commission, and Section 18 complaint drafting.
- Multi-language UI beyond English + Hindi.
- SMS/WhatsApp reminders (email only for MVP).

---

## 7. Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Accept free-text grievance (min 15 words); extract intent, subject domain, dates/reference numbers. | P0 |
| FR-2 | Map extracted domain to ranked candidate Public Authorities with confidence scores; auto-select above threshold, else prompt user to disambiguate. | P0 |
| FR-3 | Display resolved Public Authority, PIO designation, and filing address before drafting proceeds. | P0 |
| FR-4 | Rewrite grievance into numbered list of specific document/record/file-noting requests; strip opinion and interrogatives. | P0 |
| FR-4a | Enforce a live character counter against the RTI Online portal's 3,000-char field limit; LLM prompt is constrained to produce a concise, bulleted draft strictly under 2,500 characters, with the full (unconstrained) version always available as a PDF attachment. | P0 |
| FR-5 | Let user edit any generated line before finalizing. | P0 |
| FR-6 | Generate print-ready PDF matching standard RTI application format. | P0 |
| FR-7 | Record filing date/mode; start 30-calendar-day statutory response timer. | P0 |
| FR-8 | Notify user (in-app + email) as deadline approaches and on lapse. | P1 |
| FR-9 | Auto-draft First Appeal to Appellate Authority when deadline lapses without logged response. | P0 |
| FR-10 | Per-user dashboard with status: Drafting / Filed / Awaiting Response / Overdue / Appealed / Resolved. | P1 |
| FR-11 | Support BPL fee-exemption flag, removing fee line from generated PDF. | P2 |
| FR-12 | Hindi translation toggle for final draft (routing/drafting logic stays English-first internally). | P2 |
| FR-13 | NLP extractor scans the grievance for life/liberty markers (e.g. medical emergency, custody, imminent eviction, denial of urgent treatment). If detected, display an urgent badge: "Flagged under Section 7(1): 48-Hour Statutory Window Applicable," and shorten the tracked deadline from 30 days to 48 hours accordingly. | P0 |
| FR-14 | **Demo-only** control ("Simulate +31 Days") that fast-forwards an application's tracked clock past the response deadline, so the First Appeal auto-draft (FR-9) can be demonstrated without waiting out the real statutory window. Visibly labeled as a demo/testing aid, never exposed as a real dashboard action once an application is genuinely filed with real dates. | P0 |

---

## 8. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Accuracy | Routing confidence must always be surfaced, never silently guessed — misrouting is the exact failure this product exists to prevent. |
| Latency | Draft generation (routing + rewrite) returns in under 8 seconds to prevent abandonment. |
| Data privacy | Grievances contain sensitive personal data (health, pension, FIR). Encrypt drafts at rest; never train external models on submissions without opt-in. |
| Availability | Draft path must survive demo-day traffic; target 99% uptime during judging, graceful degradation over hard failure. |
| Accessibility | Usable via screen reader and on low-end Android/slow 3G. |
| Auditability | Every draft retains a diff against the user's original text — trust depends on this being inspectable, not a black box. |
| Legal accuracy | Deadline math (30/35 days response, 30 days to First Appeal) hardcoded to the Act's actual clauses, not approximated. |

---

## 9. Tech Stack Overview

Optimized for a hackathon build window: ship on Vercel, minimize infra glue, keep the AI path swappable. **Every layer below runs on a free tier — nothing in this stack requires payment to build or demo this project.** Limits checked as of Aug 2026:

| Layer | Choice | Why | Cost at hackathon scale |
|-------|--------|-----|--------------------------|
| Frontend | Next.js (App Router) + shadcn/ui | Single deployable, fast to build a clean intake/dashboard UI. | Free — Vercel Hobby plan. |
| Hosting | Vercel (Hobby plan) | Free hosting, SSL, CDN, functions, cron, analytics within published caps; Hobby accounts cannot be charged at all (no surprise bill). | Free. |
| AI / LLM | Vercel AI SDK + AI Gateway | Model-agnostic routing/rewrite calls, streaming, provider fallback — no vendor lock during judged demo. | Free — every Vercel account gets $5/month in AI Gateway credit, refreshing every 30 days, enough for demo-scale usage. |
| Authority dataset | Structured JSON/Postgres seed table | Curated Public Authority + PIO directory, queried before any LLM call — routing correctness shouldn't depend on model recall of Indian bureaucracy. | Free — no separate service, lives in the same Postgres/JSON. |
| Database | Postgres (Neon via Vercel Marketplace) | Applications, users, deadline state — relational fits status tracking directly. | Free — Neon free tier: 100 CU-hours/month, 0.5 GB storage, well above hackathon usage. |
| Auth | Clerk | Real signup/login for the production path; native Vercel Marketplace integration. | Free — Clerk free tier covers up to 50,000 monthly retained users. |
| Deadline jobs | Vercel Cron | Daily sweep over open applications; flags lapsed deadlines, triggers First Appeal draft + email. | Free — Hobby plan supports up to 100 cron jobs/project (min. once-daily cadence, which is all this needs). |
| PDF generation | Server-side HTML → PDF (e.g. @react-pdf) | Deterministic layout matching standard RTI format. | Free — library runs in-process, no external service. |
| Email | Resend | Deadline reminders and appeal-ready notifications, only for signed-in mode. | Free — Resend free tier: 3,000 emails/month, 100/day. Fine for a hackathon; would need a paid tier at real production volume. |
| Guest mode storage | Browser `localStorage` | Zero-friction "Try Demo Case" path for judges — no signup, no DB write, no rate-limit exposure during evaluation. | Free — no backend involved at all. |

None of these need a credit card to start. The one limit worth knowing about beyond the hackathon: Resend's 100-email/day cap is the first thing that would need upgrading at real scale — irrelevant for a demo, but flagged here so it isn't a surprise later.

---

## 10. Data & Legal Notes

Statutory anchors this product must get right:
- **Section 6(1)** — right to request information without giving reasons.
- **Section 6(3)** — misdirected applications must be transferred within 5 days; this is the delay RTI Copilot's routing exists to avoid.
- **Section 7(1)** — 30-day response window (48 hours if life/liberty is concerned). RTI Copilot detects life/liberty markers in the grievance text (FR-13) and surfaces this exception explicitly rather than leaving it to the user to know the clause exists.
- **Section 19(1)** — First Appeal within 30 days of refusal or of the response deadline lapsing.

RTI Copilot drafts documents; it is not legal advice. Every generated draft should visibly note that the user is responsible for reviewing content before filing, and that the product does not guarantee a response from any authority.

---

## 11. Risks & Open Questions

- **Misrouting liability.** A wrong authority match still causes real delay for a real citizen. Mitigate with visible confidence scores and a mandatory user-confirm step — never auto-submit routing silently.
- **Authority directory coverage.** A hand-curated dataset will miss less-common departments. Scope the demo to well-covered domains (pension, land records, police, education, ration) and be upfront about gaps.
- **Over-legalizing the request.** Rewriting can strip context the authority needs (e.g. a PPO number). Extract and preserve all reference numbers/dates verbatim, never paraphrase identifiers.
- **No live e-filing.** "Filed" status depends on user self-report — the appeals clock is only as accurate as that input.
- **Auth as a demo blocker.** Requiring signup before a judge can see the tracking dashboard adds friction and creates a single point of failure if Clerk or Resend rate-limits during demo day. Mitigated by Guest Mode (FR-14 context, Section 5) running the entire flow off `localStorage` with zero external calls.
- **Demo-only controls leaking into production.** "Simulate +31 Days" (FR-14) must be clearly scoped to demo/guest sessions and never reachable on a real filed application — otherwise it undermines the legal-accuracy NFR by letting anyone spoof the statutory clock.

---

## 12. Success Metrics

| Metric | Target for demo/MVP |
|--------|---------------------|
| Routing accuracy on covered domains | ≥ 90% |
| Draft-to-export completion rate | ≥ 70% of started sessions |
| Time from grievance text to reviewable draft | < 10 seconds |
| First Appeals correctly auto-triggered on lapse | 100% of eligible cases |
