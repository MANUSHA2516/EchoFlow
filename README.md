# EchoFlow

**An Intelligent Patient Queue Management and Prediction System for Echocardiography Units**

EchoFlow is a production-style university research system for a Sri Lankan public-hospital ECHO / ECO unit. It provides three coordinated applications—**EchoFlow Patient**, **EchoFlow Staff**, and **EchoFlow Admin**—backed by a NestJS API, MongoDB, Socket.IO real-time updates, and a FastAPI machine-learning service for **operational** wait-time and queue-volume prediction.

> The ML component predicts waiting time, influx, and peak periods. It does **not** diagnose cardiac conditions, interpret echocardiogram images, or recommend treatment.

## Documentation sources

Primary requirements and UI references (do not modify):

- `Research Proposal.pdf`
- `Result - Patient (User).docx.pdf`
- `Result - Staff.docx.pdf`
- `Result - Admin NEW.pdf`

Implementation plan: [`docs/implementation-plan.md`](docs/implementation-plan.md)

## Architecture

```text
Patient (Expo / React Native) · Staff / Admin (Next.js)
        │  REST + Socket.IO
        ▼
   NestJS API  ──► MongoDB
        │
        └──► FastAPI ML (RF / XGBoost)
```

## Repository structure

```text
apps/patient   EchoFlow Patient (Expo React Native mobile app)
apps/staff     EchoFlow Staff portal (Next.js)
apps/admin     EchoFlow Admin portal (Next.js)
services/api   NestJS + MongoDB + Socket.IO
services/ml    FastAPI prediction service
packages/      Shared types, UI primitives, config, tsconfig, eslint
docs/          Implementation plan and analysis notes
```

## Technology stack

| Area | Choice |
| --- | --- |
| Monorepo | pnpm workspaces + Turborepo |
| Frontends | Patient: Expo React Native; Staff/Admin: Next.js, Tailwind, Lucide, Recharts, RHF + Zod, TanStack Query |
| API | NestJS, Mongoose, Socket.IO, JWT |
| Database | **MongoDB** (local; not Postgres/MySQL) |
| ML | Python, FastAPI, pandas, scikit-learn, XGBoost |

> The research proposal’s Table 3.3 mentioned Flutter / Express / MySQL. This repository follows the project implementation mandate (Next.js ×3, NestJS, MongoDB). See discrepancies in the implementation plan.

## Requirements

- Node.js ≥ 20
- pnpm 9.x
- MongoDB 7 (local `mongod` or Docker)
- Python **3.12** recommended for the ML service (create the venv with 3.12; system 3.14 may lack wheels for pandas/scikit-learn)

## Local setup

```bash
cp .env.example .env
pnpm install
pnpm --filter @echoflow/types build
pnpm --filter @echoflow/config build
pnpm --filter @echoflow/ui build

# Terminal A — MongoDB
mongod --dbpath /tmp/echoflow-mongo --port 27017

# Terminal B — API
pnpm db:seed
pnpm --filter @echoflow/api dev

# Terminal C — ML
cd services/ml
python3.12 -m venv .venv 2>/dev/null || python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontends
pnpm --filter @echoflow/patient start   # Expo (w/a/i)
pnpm --filter @echoflow/staff dev       # :3001
pnpm --filter @echoflow/admin dev       # :3002
```

Patient prefers the live API (`EXPO_PUBLIC_FORCE_DEMO=false` by default) and falls back to in-app demo data if the API is unreachable.

### Demo logins

| App | Credentials |
| --- | --- |
| Patient | NIC `200012345678` · phone `712345678` · OTP `123456` |
| Staff | Staff ID `ECHO-STF-001` · password `EchoFlow!demo` |
| Admin | Admin ID `ECHO-ADM-014` · password `EchoFlow!demo` · 2FA `123456` |

Or with Turbo: `pnpm dev` (runs workspace `dev` scripts in parallel).

## Environment variables

See [`.env.example`](.env.example). Never commit `.env` or real JWT / OTP / DB credentials.

## Demo / synthetic data

Seed and ML datasets are **fictional demonstration data**. Mockup KPI values (wait minutes, accuracy %, ticket numbers, names) are UI samples unless a thesis chapter explicitly reports measured evaluation. Synthetic ML metrics must not be presented as clinical validation.

## Docker

```bash
docker compose up --build
```

Starts MongoDB, NestJS API, and the FastAPI ML service. Frontends typically run locally during development.

## Development commands

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install workspace deps |
| `pnpm build` | Build all packages/apps |
| `pnpm lint` | Lint |
| `pnpm typecheck` | TypeScript checks |
| `pnpm test` | Tests (expanded in later phases) |
| `pnpm db:seed` | Seed MongoDB (filled in Phase 2+) |
| `pnpm format` | Prettier |

## Testing

Progressive: API unit/service/e2e, critical frontend flows, then full patient/staff/admin journeys (see implementation plan Phase 13).

## Current phase status

- **Phase 0–2:** Complete — plan, monorepo, Mongo schemas + seed
- **Patient / Staff / Admin UIs:** Complete — PDF-aligned screens with demo fallback
- **API (NestJS):** Complete — auth (patient OTP / staff / admin 2FA), patients, queues/tickets, rooms, staff, admin/audit/settings, notifications, predictions proxy, Socket.IO gateway
- **ML (FastAPI):** Complete — wait-time / inflow / peak / model-info endpoints (synthetic provenance)
- **Wiring:** Patient prefers live API (falls back to demo if API down); Staff/Admin login hits live API with offline demo fallback
- **Verified locally:** Mongo seed + API smoke tests (health, patient/staff/admin login, dashboard ticket A-014, queue today)

## License / academic use

University research project artefact. Patient data in seeds is fictional.
