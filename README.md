# RTI Copilot

An NLP-powered public authority router and legal drafter for India's Right to Information Act, 2005. Built for the **Build What Moves India** hackathon.

- [Product Requirements Document](docs/PRD.md)
- [Build Phases](docs/phases.md)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and fill in Neon/Clerk/Resend credentials as each phase requires them (see [docs/phases.md](docs/phases.md)).

## Stack

Next.js (App Router) · Tailwind · shadcn/ui · Vercel AI SDK/Gateway · Neon Postgres · Clerk · Resend · Vercel Cron

Full rationale and free-tier cost notes in [docs/PRD.md §9](docs/PRD.md#9-tech-stack-overview).
