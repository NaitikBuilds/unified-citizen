# CIVIX — Unified Citizen Governance Platform

AI-powered citizen grievance management platform — citizens submit and track grievances, government departments resolve them, and administrators oversee the whole system with SLAs, escalation and audit trails.

[![Backend CI](https://github.com/NaitikBuilds/unified-citizen/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/NaitikBuilds/unified-citizen/actions/workflows/backend-ci.yml)
[![Live Demo](https://img.shields.io/badge/Live_Demo-2EA043?style=flat-square&logo=vercel&logoColor=white)](https://civix-brown-ten.vercel.app)
![TypeScript](https://img.shields.io/badge/TypeScript-24292F?style=flat-square&logo=typescript&logoColor=3178C6)
![Express](https://img.shields.io/badge/Express-24292F?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-24292F?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-24292F?style=flat-square&logo=postgresql&logoColor=4169E1)

> **Status:** active student/hackathon project under development — **web app live on [Vercel](https://civix-brown-ten.vercel.app)**. Not a production government system.

## Problem

Grievance redressal today is fragmented: citizens don't know which department handles their complaint, submissions get lost in queues, there's no visibility into status or accountability, and manual triage can't keep up with volume.

## Solution

CIVIX is a single platform with dedicated portals for every role. When a citizen submits a grievance, an LLM pipeline classifies it, routes it to the right department, assigns priority, and generates a summary — with deterministic keyword fallbacks when AI is unavailable. Officers work a queue with SLA timers, and every state change is auditable.

## Key Features

**Four role-based portals**

| Portal | Capabilities |
| --- | --- |
| Citizen | Submit/track grievances, attachments, status timeline, notifications, feedback, reopen |
| Officer | Assigned queue, status updates, comments, resolution proof, department analytics |
| Dept Admin | Department grievances, assignments, user management |
| Super Admin | System-wide analytics, audit log viewer, departments, users, all grievances |

**AI pipeline** (`@google/genai` / Gemini, structured with Zod schemas)

- Grievance **classification** → category, department, priority (`LOW`–`CRITICAL`), severity, sentiment, **confidence score**, summary, explanation
- **Department routing** and priority detection
- **Duplicate detection** before a new grievance is created
- **Spam detection** to filter junk submissions
- **AI chatbot** grounded in the citizen's own grievance context
- Writing assistant: formal grievance email generation + official contact lookup
- Deterministic **keyword-based fallback** when the LLM is unavailable or output fails validation

**Platform engineering**

- JWT auth (short-lived access tokens + refresh rotation) and Google OAuth
- Role-based access control enforced per-route (backend-authoritative)
- Zod validation on every request; centralized error handling
- Rate limiting (`express-rate-limit`) and Helmet security headers
- File attachments via Multer with cleanup on grievance deletion
- SLA policies with tracking, escalation levels and citizen feedback
- Full **audit logging** of governance actions
- In-app notifications across grievance events
- 11 Vitest test suites; CI runs typecheck + build + Prisma migrations + tests against a real PostgreSQL 16 service

## Architecture

```text
┌──────────────────────────── apps/web — React SPA (Vercel-ready) ───────────────────────────┐
│  React 19 · TypeScript · Vite · Tailwind CSS · daisyUI                                     │
│  Zustand stores · Axios · React Router · Leaflet maps · Recharts analytics · Lucide icons   │
│  Pages: public (landing, auth, chat, profile) · citizen · officer · dept-admin · super-admin │
└─────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                              │ REST (JSON) · Bearer JWT
┌─────────────────────────────────────────────▼──────────────────────────────────────────────┐
│  apps/api — Express + TypeScript                                                           │
│  routes → middlewares (auth · RBAC · validate · rate-limit · upload) → controllers          │
│  domain services: grievance status · notifications · audit · escalation · JWT               │
│  ai/: Gemini provider → prompts → Zod schemas → services                                   │
│       (classification · duplicate-detection · spam-detection · chatbot · analysis)          │
└─────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                              │ Prisma 7 (driver adapter @prisma/adapter-pg)
┌─────────────────────────────────────────────▼──────────────────────────────────────────────┐
│  PostgreSQL — 14 models: User · Department · Grievance · Assignment · AIClassification      │
│  Comment · Attachment · Notification · AuditLog · RefreshToken · SLAPolicy · SLA            │
│  Feedback · Escalation    (+ enums: UserRole, GrievanceStatus, SLAStatus, EscalationLevel…) │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

**Frontend**

![React](https://img.shields.io/badge/React-24292F?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-24292F?style=flat-square&logo=typescript&logoColor=3178C6)
![Vite](https://img.shields.io/badge/Vite-24292F?style=flat-square&logo=vite&logoColor=646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-24292F?style=flat-square&logo=tailwindcss&logoColor=06B6D4)
![daisyUI](https://img.shields.io/badge/daisyUI-24292F?style=flat-square&logo=daisyui&logoColor=1AD1A5)
![Zustand](https://img.shields.io/badge/Zustand-24292F?style=flat-square&logo=zustand&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-24292F?style=flat-square&logo=reactrouter&logoColor=CA4245)
![Leaflet](https://img.shields.io/badge/Leaflet-24292F?style=flat-square&logo=leaflet&logoColor=199900)
![Recharts](https://img.shields.io/badge/Recharts-24292F?style=flat-square&logo=chakraui&logoColor=white)

**Backend & Database**

![Node.js](https://img.shields.io/badge/Node.js-24292F?style=flat-square&logo=nodedotjs&logoColor=5FA04E)
![Express](https://img.shields.io/badge/Express-24292F?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-24292F?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-24292F?style=flat-square&logo=postgresql&logoColor=4169E1)
![Zod](https://img.shields.io/badge/Zod-24292F?style=flat-square&logo=zod&logoColor=3E67B1)

*Plus: Helmet, express-rate-limit, Multer, bcryptjs · committed Prisma migrations*

**AI / GenAI**

![Google Gemini](https://img.shields.io/badge/Google_Gemini-24292F?style=flat-square&logo=googlegemini&logoColor=8E75B2)

*Structured outputs validated with Zod · deterministic keyword fallbacks when the LLM is unavailable*

**Auth**

![JWT](https://img.shields.io/badge/JWT_Auth-24292F?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google_OAuth-24292F?style=flat-square&logo=google&logoColor=EA4335)

*Role-based access control (RBAC) enforced per-route · short-lived access tokens with refresh rotation*

**Testing / CI**

![Vitest](https://img.shields.io/badge/Vitest-24292F?style=flat-square&logo=vitest&logoColor=729B1B)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-24292F?style=flat-square&logo=githubactions&logoColor=2088FF)
![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL_16_service-24292F?style=flat-square&logo=postgresql&logoColor=4169E1)

## Project Structure

```text
unified-citizen/
├── apps/
│   ├── web/                  # React + Vite SPA (role-based pages)
│   │   └── src/pages/{public,citizen,officer,dept-admin,super-admin}
│   └── api/                  # Express + TypeScript REST API
│       └── src/
│           ├── routes/       # auth, grievances, chat, departments, notifications, users
│           ├── controllers/  # request handlers
│           ├── middlewares/  # auth, rbac, validate, rate-limit, upload, errors
│           ├── services/     # domain services (status, escalation, audit, …)
│           └── ai/           # Gemini provider, prompts, Zod schemas, AI services
├── prisma/                   # schema.prisma (14 models) + committed migrations
├── docs/API.md               # Backend API reference (implemented endpoints only)
└── .github/workflows/        # Backend CI (typecheck · build · prisma · vitest)
```

## How It Works

1. **Citizen submits a grievance** (text, category hints, optional location) — the API first runs **spam detection** and **duplicate detection**.
2. The **AI classification service** sends structured prompts to Gemini and validates the response with Zod: category, target department, priority, severity, sentiment, confidence and a summary.
3. If the LLM is unavailable or output fails validation, a **keyword-based fallback** classifies deterministically instead of failing the request.
4. The grievance is **routed to the department**; officers/admins assign it, and **SLA timers** start per the department's policy.
5. Status changes, comments, attachments and assignments generate **notifications**; every governance action lands in the **audit log**.
6. Breached SLAs **escalate** through defined levels; citizens can add feedback or reopen after resolution.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (local or Docker)
- A [Gemini API key](https://aistudio.google.com/) (optional — the keyword fallback keeps the app functional without it)

### Installation

```bash
# 1. Clone
git clone https://github.com/NaitikBuilds/unified-citizen.git
cd unified-citizen

# 2. Install workspace dependencies (npm workspaces)
npm install

# 3. Environment
cp .env.example .env        # fill in the values below
```

### Environment Variables

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/unified_citizen"
JWT_SECRET="replace-with-a-long-random-string"
JWT_REFRESH_SECRET="replace-with-a-different-long-random-string"
FRONTEND_URL="http://localhost:5173"
PORT=5000
GEMINI_API_KEY="your-gemini-api-key-here"
```

### Run Locally

```bash
# Apply the committed Prisma migrations
npx prisma migrate deploy        # or: npx prisma migrate dev

# Terminal 1 — API on http://localhost:5000 (base path: /api/v1)
npm run dev:api

# Terminal 2 — Web on http://localhost:5173
npm run dev:web

# Quality checks
npm run typecheck                  # both workspaces
npm run test --workspace=apps/api  # Vitest suites
```

## API Documentation

The full backend reference lives in [`docs/API.md`](docs/API.md) — it documents only endpoints that actually exist in the codebase, covering auth flows, the grievance lifecycle, attachments, feedback, escalations, and the AI-assist endpoints (`/analyze`, `/generate-email`, `/get-official-contacts`).

Base URL: `http://localhost:5000/api/v1` · Bearer JWT auth · CUID identifiers · consistent `{ success, error }` error envelope.

## Screenshots

> **TODO:** add real screenshots here — citizen dashboard, grievance submission with AI analysis preview, officer queue, super-admin analytics/audit pages. ([Live demo](https://civix-brown-ten.vercel.app) — capture directly from it.)

| Citizen portal | AI analysis preview |
| --- | --- |
| *screenshot pending* | *screenshot pending* |

| Officer queue | Super-admin analytics |
| --- | --- |
| *screenshot pending* | *screenshot pending* |

## Deployment

**🌐 Live demo:** [civix-brown-ten.vercel.app](https://civix-brown-ten.vercel.app)

- **Web app:** deployed on **Vercel** using the `vercel.json` SPA rewrites.
- **API:** run it locally (see [Getting Started](#getting-started)) or deploy to any Node host — the live frontend expects a reachable API base URL. Public API deployment is on the roadmap.
- CI validates typecheck, build, migrations and tests on every push.

## Roadmap

- [x] Web app deployed on Vercel — [live demo](https://civix-brown-ten.vercel.app)
- [ ] Public API deployment so the live demo is fully self-serve
- [ ] Human-review queue for low-confidence AI classifications
- [ ] Email/SMS notification channels
- [ ] Regional-language support for grievance submission
- [ ] Analytics: department performance and SLA-compliance dashboards

## Contributors

- [Naitik Singh](https://github.com/NaitikBuilds)
- [Aditya Upadhyay](https://github.com/NaitikBuilds/unified-citizen/graphs/contributors)
- [Owais Khan](https://github.com/NaitikBuilds/unified-citizen/graphs/contributors)

Built as an internal hackathon/SIH-style team project.

## License

No license yet — an MIT license will be added before the first public release.
