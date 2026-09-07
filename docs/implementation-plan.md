# EchoFlow — Implementation Plan

**Product:** EchoFlow — An Intelligent Patient Queue Management and Prediction System for Echocardiography Units  
**Sources of truth (read in full, screenshots inspected):**

1. `Research Proposal.pdf` (40 pp) — research problem, objectives, FR1–FR12, architecture intent, ML methodology, ethics  
2. `Result - Patient (User).docx.pdf` (18 pp, 14 screens) — patient UI + behaviour  
3. `Result - Staff.docx.pdf` (12 pp, 11 screens) — staff UI + behaviour  
4. `Result - Admin NEW.pdf` (29 pp) — admin UI + supporting states; corrects several scope-list assumptions  

**Working extracts** (derived, not academic source): `docs/_extract/` text dumps and rendered page PNGs for screenshot inspection.  
**Prior inventory:** `docs/analysis-patient.md` (patient-only deep dive; summarised and reconciled here).

**Governing rule:** Prefer Patient / Staff / Admin result documents for screens, terminology, and interaction design. Prefer the Research Proposal for research scope, FR table, ML methodology, and ethical boundaries. Where they conflict, prefer result UI for implementation and record the discrepancy in §11.

**Branding:** Application chrome uses **EchoFlow**, **EchoFlow Patient**, **EchoFlow Staff**, **EchoFlow Admin**. Retain unit context labels such as ECHO / ECO Unit, General Hospital where mockups show hospital context.

**Sample-data rule:** All KPI values, wait times, model accuracy figures, ticket numbers, names, and chart series in mockups are **demonstration/sample data** unless a document explicitly states measured evaluation results. Chapter 5 of the Research Proposal confirms dashboard/report figures are illustrative, not clinical outcomes. Do not invent research findings.

**ML clinical boundary:** Predict operational waiting time, queue load, influx, and peak periods only. Do **not** diagnose cardiac conditions, interpret echo images, or recommend treatment.

---

## 1. Requirements Summary

### 1.1 System purpose

Digitally manage patient registration and queueing for a Sri Lankan public-hospital Echocardiography (ECO / ECHO) unit; prioritise urgent / on-site cases under documented operational rules; predict waiting time and queue volume with ML; give patients live ticket/position visibility; give staff live queue control; give administrators room, staff, audit, and settings oversight.

### 1.2 Research problem (from proposal)

Manual paper registration; long/unpredictable queues; no formal digital ticketing; simultaneous arrivals without slots; difficulty prioritising urgent cases; limited doctors/machines; poor wait communication; no real-time monitoring; reactive staffing; paper reporting without historical analysis.

### 1.3 Actors and roles

| Actor | Portal | Auth identity | Notes |
| --- | --- | --- | --- |
| **Patient** | EchoFlow Patient (mobile-first PWA) | NIC + phone + SMS OTP (no password) | End-user / registered patient |
| **Staff** | EchoFlow Staff (desktop/tablet web) | Staff ID + password; optional hospital SSO placeholder; password reset | Front-desk, nurses, technicians, medical officers |
| **Administrator** | EchoFlow Admin (desktop/tablet web) | Admin ID + password + 2FA code where required | Super Admin; configures rooms, staff, permissions, AI/security |

**Staff role levels (Admin Settings matrix):** Technician, Room Lead, Super Admin.  
**Operational priority flags on tickets:** Normal / Urgent (staff-authorised). Separate from medical diagnosis.  
**On-site priority:** Staff-scanned expiring QR + presence check (demo geofence in development) may advance queue position; patients cannot self-mark urgent.

### 1.4 Patient features

- NIC-based registration and login; OTP verification; verification success; phone update with OTP  
- Home dashboard: ticket, predicted wait, currently serving, patients ahead, join/history/profile shortcuts, check-in QR callout, notifications bell  
- Join today’s queue (reason, preferred slot, optional notes, slot wait estimate)  
- Live ticket; leave queue; live queue tracking timeline; visit history  
- Profile / edit profile (NIC locked); check-in QR with expiry/refresh; notifications feed  

### 1.5 Staff features

- Sign-in; forgot/reset password (15-minute single-use link); SSO placeholder  
- Today’s Overview KPIs + predicted inflow chart + quick actions  
- Queue Management: call/skip/mark done, now-serving card, waiting list, urgent Call next, add walk-in  
- Queue Prediction: ML KPIs, hourly forecast, feature importance, model info  
- Patient Search / Detail (history + consultation note); Reports (CSV/PDF export); Register New Patient modal  
- My Profile / Edit Profile (work fields admin-locked)  

### 1.6 Administrator features

- Dedicated Admin Sign-In with 2FA field  
- Today’s Unit Overview: KPIs, AI insight, room status / live queue snippet, system alerts  
- Echo Rooms grid; Add Echo Room modal (combined Register Station)  
- Staff Accounts; Add Staff Member; Add Technician (shift quick-add); Access & Role modal  
- Audit Log; Settings (permissions matrix, security, AI engine toggles)  
- My Profile / Edit Profile  
- Nav item **AI insights & reports** (fulfills FR7 admin side)  

### 1.7 Authentication flows

| Portal | Flow |
| --- | --- |
| Patient | Register/Login → OTP → (Verification Successful for registration/phone; Home after returning login) → JWT session |
| Staff | Staff ID + password → JWT; Keep me signed in → longer refresh; Forgot password → email reset link 15 min; SSO button = documented placeholder |
| Admin | Admin ID + password + 6-digit 2FA → JWT |

Shared strategy: access JWT + refresh tokens; bcrypt/argon2 password hashes; never store plaintext passwords/OTP codes; audit login/reset/2FA failures without logging secrets.

### 1.8 Queue flows

1. Patient or staff creates ticket for today’s queue (one active ticket per patient per day).  
2. Ticket receives immutable issued number (format `A-###`); mutable operational order drives position.  
3. Stages (staff): Checked in → Now serving → Scanning → Complete (align patient timeline statuses).  
4. Staff Call next / Call urgent / Skip / Mark done update MongoDB and broadcast Socket.IO events.  
5. Patient sees currently serving, people ahead, predicted wait, stage timeline without refresh.  
6. Leave/cancel persists and reorders remaining tickets.  

### 1.9 Priority handling

- **Urgent:** staff toggle on walk-in/register or queue action; visually red; Call next jumps ahead of routine waiting tickets; must not preempt an in-progress examination.  
- **On-site:** QR check-in verified by authorised staff + presence provider; may advance position; notify affected remote patients.  
- Priority changes write AuditLog. EchoFlow does not diagnose.

### 1.10 Real-time functionality

Socket.IO gateway on NestJS API. MongoDB is source of truth. Clients refetch or apply revisioned snapshots after events. Patient channels are privacy-scoped (no other patients’ PII).

### 1.11 Machine-learning requirements

- Offline train Random Forest (benchmark) + XGBoost (primary) on synthetic/demo operational data initially.  
- Targets: wait time; hourly/daily volume; peak windows.  
- Metrics: MAE, RMSE, R². Feature importance retained.  
- Exposed only via NestJS → FastAPI. Frontends never call ML directly.  
- Settings toggles: enable prediction, auto-retrain, show predicted wait to patients.  
- Never present synthetic metrics as clinical validation.

### 1.12 Reporting

Staff Reports: period selector, AI summary, KPIs, patients-served chart, CSV + PDF export.  
Admin: AI insights & reports / dashboard aggregates from MongoDB aggregations + seed data.

### 1.13 Security, audit, profile, notifications

- Validation, RBAC guards, rate limits (OTP/login), secure headers, CORS, env secrets.  
- Audit: auth events, staff/role/permission changes, priority/queue/room/settings changes.  
- Profiles per role as documented; admin-managed identity fields locked on self-edit.  
- Patient notifications: join, proximity (3 ahead), check-in, position reorder, appointment reminder types; unread bell.

---

## 2. Screen Inventory

### 2.1 Patient — EchoFlow Patient (14)

| # | Screen | Source | Key UI |
| --- | --- | --- | --- |
| P1 | Secure Login | Patient p3 | SECURE LOGIN badge, Log in/Register tabs, NIC, Phone +94, Continue |
| P2 | New Patient Registration | p4 | Full name, NIC, Phone, DOB, Create account |
| P3 | Verify OTP | p5 | 6 digit boxes, resend countdown, Verify & continue, Edit phone |
| P4 | Verification Successful | p6 | VERIFIED, Back to login |
| P5 | Update Phone Number | p7 | Current read-only, New phone, Send verification code |
| P6 | Home Dashboard | p8 | Hello header, queue #, predicted wait, currently serving, Join, History/Profile, check-in callout, bottom nav |
| P7 | Join Today’s Queue | p9 | Reason dropdown, slot chips 9–11 / 11–1 / 2–4, notes, estimated wait, Confirm |
| P8 | Live Ticket (Your Number) | p10 | Large ticket, NOW SERVING, progress, Leave queue, Live Queue |
| P9 | Live Queue Tracking | p11 | AI PREDICTING, people ahead, position-moved alert, timeline, Show QR |
| P10 | Visit History | p12 | Stats cards, visit list Completed/Archived, View all |
| P11 | Profile | p13 | Verified header, chips, phone/DOB/address, Edit, Log out |
| P12 | Edit Profile | p14 | Avatar upload, editable fields, locked NIC, Save/Cancel |
| P13 | Check-in QR | p16 | QR, expiry countdown, What happens next, Refresh |
| P14 | Notifications | p17 | Chronological cards, unread dots |

**Bottom nav:** Home / Queue / History / Profile.  
**No patient sidebar, data tables, or statistical charts** in source. Indicators: dots, progress bar, circular people-ahead, stage timeline.

### 2.2 Staff — EchoFlow Staff (11)

| # | Screen | Source | Key UI |
| --- | --- | --- | --- |
| S1 | Staff Sign In | Staff p2 | Split panel, Staff ID, password show/hide, Keep signed in, Forgot, SSO placeholder |
| S2 | Forgot / Reset Password | p3 | Staff ID, 15-min single-use notice, Send reset link |
| S3 | Today’s Overview | p4 | 4 KPI cards, predicted inflow bar chart, Go to queue / View prediction |
| S4 | Queue Management | p5 | Summary strip, stage tracker, Now serving, Waiting list, URGENT Call next, + Add walk-in |
| S5 | Queue Prediction | p6 | Model badge, AI insight, KPIs, hourly Actual vs Forecast chart, feature importance, model info |
| S6 | Patient Search | p7 | Summary cards, search, filter chips, results, + New patient |
| S7 | Patient Detail | p8 | Header, past visits timeline, Add today’s consultation note |
| S8 | Reports | p9 | Period, AI summary, KPIs, bar chart, Export CSV/PDF |
| S9 | Register New Patient | modal | Name, NIC, Phone, DOB, reason, Normal/Urgent, Save and add to queue |
| S10 | My Profile | p11 | KPIs, recent activity, shift progress, week chart, Change password / Notification settings |
| S11 | Edit Profile | p12 | Photo, personal fields, locked work details |

**Sidebar:** Dashboard, Queue management, Patients, Prediction, Reports (+ profile/logout).

### 2.3 Admin — EchoFlow Admin

| # | Screen | Notes |
| --- | --- | --- |
| A1 | Admin Sign-In | Admin ID, password, 2FA; not the shared unified login |
| A2 | Today’s Unit Overview | KPIs, AI insight, room status table, alerts, Export / + Add technician |
| A3 | Echo Rooms | Room cards grid, + New room |
| A4 | Staff Accounts | Search, status filters, table, Review pending |
| A5 | Staff Member — Access & Role | 3-step modal Details / Access & role / Review |
| A6 | Audit Log | Search, category chips, time range, timeline |
| A7 | Settings | Permissions matrix, security toggles, AI engine panel |
| A8 | Add Technician | Quick shift roster modal |
| A9 | Add Echo Room | Combined Register Station; live preview |
| A10 | Add Staff Member | Formal invite & create |
| A11a/b | My Profile / Edit Profile | Supporting screens |
| — | Unified Sign-In (role tabs) | Documented as **shared**, not admin-only — see §11; **not** primary entry for three separate apps |

**Sidebar groups:** Overview (Dashboard, Echo rooms) · Management (Staff accounts, AI insights & reports, Audit log) · System (Settings).

### 2.4 Modals, charts, badges, forms (cross-cutting)

**Modals:** Register New Patient; Add Technician; Add Echo Room; Add Staff Member; Access & Role; (impl.) Leave-queue confirm.  
**Charts:** Staff Today’s inflow bars; Prediction Actual vs Forecast; Reports patients/day; Staff Profile week bars; Admin dashboard metrics (cards + insight). Recharts.  
**Status badges:** LIVE, URGENT, Normal, Verified, In Queue, Completed, Archived, Live/Delayed/Offline room pills, AI PREDICTING, model Live.  
**Empty/loading/error:** Not fully mocked — implement consistent inline states (assumption §11).

---

## 3. Actor-to-Screen Mapping

| Actor | Screens |
| --- | --- |
| Patient | P1–P14 |
| Staff (all authenticated staff) | S1–S11; queue actions gated by room assignment where Room Lead/Tech differ |
| Administrator / Super Admin | A1–A11; Settings AI/security; staff approval |
| Shared (documented only) | Unified Sign-In mockup — each app implements its own auth UI matching dedicated designs |

---

## 4. Functional Requirement Mapping

| FR | Requirement | Primary UI | Implementation notes |
| --- | --- | --- | --- |
| FR1 | Digitally join queue + ticket | P7, P8; S9 walk-in | One active ticket/day |
| FR2 | Live position + visit stage | P9 (+ P6/P8) | Socket.IO + MongoDB |
| FR3 | Call / skip / complete | S4 | Persist + broadcast |
| FR4 | Flag/prioritise urgent | S4, S9 | Staff-authorised; audit |
| FR5 | Predict influx, peaks, wait | S5; patient wait badges | Nest → FastAPI |
| FR6 | Search/view/register patients | S6–S9 | Unique NIC |
| FR7 | Operational reports | S8; Admin AI insights & reports | Aggregations + export |
| FR8 | Unit overview + alerts | A2 | Room/queue/alert panels |
| FR9 | Manage rooms/stations | A3, A9 | Single combined modal |
| FR10 | Staff accounts/roles | A4, A5, A8, A10, A7 | RBAC matrix |
| FR11 | Audit log | A6 | Central AuditLog |
| FR12 | Patient visit history | P10 | Also staff Patient Detail |

**NFR:** usability, real-time sync, reliability, security/privacy (PDPA-aligned design), scalability to other units later.

---

## 5. Proposed Database Model (MongoDB / Mongoose)

**Decision:** Primary DB is **MongoDB** (project mandate). Research Proposal Table 3.3 listed MySQL — superseded for this implementation (§11).

### 5.1 Collections / schemas

| Collection | Key fields | Indexes |
| --- | --- | --- |
| `patients` | fullName, nic (unique), phoneE164, phoneVerifiedAt, dob, address, avatarUrl, status, memberSince | nic, phoneE164 |
| `staff_members` | staffId (unique), fullName, email, phone, passwordHash, role (`technician`\|`room_lead`), assignedRoomId, status (`active`\|`pending`\|`suspended`), shift fields, avatar | staffId, email, status, assignedRoomId |
| `administrators` | adminId (unique), fullName, email, phone, passwordHash, totpSecretEnc, role `super_admin`, status | adminId |
| `refresh_sessions` | subjectType, subjectId, tokenHash, expiresAt, revokedAt, userAgent | tokenHash, subjectId |
| `otp_challenges` | purpose, nic/phone/patientId, codeHash, expiresAt, attempts, consumedAt | phone+purpose, expiresAt |
| `password_resets` | staffId, tokenHash, expiresAt, consumedAt | tokenHash |
| `echo_rooms` | name, type (`standard`\|`stress`\|`tee`\|`pediatric`\|`portable`), location, hours, leadTechnicianId, status (`live`\|`delayed`\|`offline`\|`off_unit`), capacity | status, type |
| `queues` | serviceDate (local), unitCode, status (`open`\|`closed`), servingTicketId, revision | serviceDate unique |
| `queue_tickets` | queueId, ticketNumber, patientId, roomId?, reason, slot, notes, priority (`normal`\|`urgent`), onSite, stage, orderKey, predictedWaitMinutes, timestamps (joined/called/skipped/completed/cancelled), assignedStaffId? | queueId+status, ticketNumber, patientId+serviceDate, priority, orderKey |
| `check_in_challenges` | ticketId, tokenHash, expiresAt, consumedAt, verifiedByStaffId, presenceMode (`demo`\|`gps`) | ticketId, tokenHash |
| `visits` | patientId, ticketId, serviceDate, visitType, doctorName/staffId, summary, status (`completed`\|`archived`), clinicalNote? | patientId+serviceDate |
| `predictions` | scope (`ticket`\|`queue_hour`\|`day`), refs, minutesOrCount, modelVersion, confidence, featureImportance?, demoProvenance, createdAt | scope+createdAt |
| `notifications` | patientId, type, title, body, ticketId?, readAt, dedupeKey | patientId+createdAt, dedupeKey unique |
| `audit_logs` | actorId, actorRole, action, targetType, targetId, metadata (safe), ip?, createdAt | createdAt, actorId, action, category |
| `system_settings` | singleton key | permissions matrix, securityPolicy, aiEngine flags/version |
| `system_alerts` | severity, message, roomId?, resolvedAt | severity, createdAt |

**Enums** for ticket stage, priority, room status, staff status, notification type, audit category (`staff`\|`security`\|`ai_system`).

**Password/OTP:** hash only; TOTP secrets encrypted at rest; never in audit metadata.

### 5.2 Relationships (logical)

Patient 1—* QueueTicket / Visit / Notification  
Queue 1—* QueueTicket; QueueTicket *—1 EchoRoom (optional until assigned)  
StaffMember *—1 EchoRoom; Administrator manages Staff/Rooms/Settings  
QueueTicket 1—0..1 CheckInChallenge; Visit links completed ticket  
Prediction references ticket/hour; AuditLog references actor + target  

---

## 6. API Endpoint Plan (NestJS)

Base: `/api/v1`. Auth: Bearer access JWT; refresh via `/auth/refresh`.

### Auth
- `POST /auth/patient/register` · `POST /auth/patient/login`  
- `POST /auth/otp/verify` · `POST /auth/otp/resend`  
- `POST /auth/staff/login` · `POST /auth/staff/forgot-password` · `POST /auth/staff/reset-password`  
- `POST /auth/admin/login`  
- `POST /auth/refresh` · `POST /auth/logout` · `GET /auth/me`  
- `POST /auth/sso/hospital` → `501` / documented stub  

### Patients / profile
- `GET|PATCH /patients/me` · `POST /patients/me/avatar` · `POST /patients/me/phone-change`  
- `GET /patients/me/dashboard` · `GET /patients/me/visits`  

### Staff patient ops
- `GET /patients` (search/filter) · `GET /patients/:id` · `POST /patients` (register)  
- `POST /patients/:id/notes`  

### Queues / tickets
- `GET /queues/today` · `GET /queues/today/options`  
- `POST /queue-tickets` · `GET /queue-tickets/current` · `GET /queue-tickets/:id` · `GET /queue-tickets/:id/tracking`  
- `POST /queue-tickets/:id/leave`  
- Staff: `POST /queue-tickets/:id/call` · `/skip` · `/complete` · `/priority` · `POST /queues/today/call-next`  
- `POST /queue-tickets/:id/check-in-code` · `POST /check-ins/verify` (staff)  

### Rooms / staff / admin
- CRUD-ish: `GET|POST /echo-rooms` · `PATCH /echo-rooms/:id`  
- `GET|POST /staff` · `PATCH /staff/:id` · `POST /staff/:id/access` · `POST /staff/quick-add`  
- `GET /admin/dashboard` · `GET /audit-logs` · `GET|PATCH /settings`  
- `GET /reports/staff` · `GET /reports/admin` · export query `?format=csv|pdf`  

### Predictions (Nest proxies ML)
- `POST /predictions/wait-time` · `GET /predictions/inflow` · `GET /predictions/peak-hours` · `GET /predictions/model-info`  

### Notifications
- `GET /notifications` · `PATCH /notifications/:id/read` · `POST /notifications/read-all`  

---

## 7. Realtime-Event Plan (Socket.IO)

| Event | Emit when | Recipients |
| --- | --- | --- |
| `queue.ticket.created` | Join / walk-in | patient room + staff queue room |
| `queue.ticket.called` | Call / Call next | same |
| `queue.ticket.skipped` | Skip | same |
| `queue.ticket.completed` | Mark done | same + visit created |
| `queue.ticket.cancelled` | Leave | same |
| `queue.ticket.priority_changed` | Urgent toggle / on-site advance | same + audit |
| `queue.position.changed` | Any reorder | affected patients (sanitized) |
| `queue.check_in.verified` | QR+presence OK | patient + staff |
| `queue.room.updated` | Room status/load | admin + staff |
| `prediction.updated` | New wait/inflow | patient ticket + staff prediction |
| `notification.created` / `notification.read` | Notify lifecycle | owning patient |
| `system.alert.created` | SLA / pending approvals | admin |

Payloads include `queueId`, `revision`, resource ids; clients invalidate TanStack Query caches. Auth handshake with JWT; rooms: `patient:{id}`, `queue:{date}`, `room:{id}`, `admin`.

---

## 8. ML Service Plan (`services/ml`)

**Stack:** Python, FastAPI, pandas, scikit-learn, xgboost, joblib.

| Endpoint | Purpose |
| --- | --- |
| `POST /predict/wait-time` | Minutes given features (slot, queue length, priority, hour, dow, room load, …) |
| `GET /predict/inflow` | Hourly volume forecast |
| `GET /predict/peak-hours` | Peak window(s) |
| `GET /model/info` | Version, trained_at, metrics, feature importance |
| `POST /train` (dev/admin-protected via Nest only) | Retrain from synthetic or exported ops data |

**Artefacts:** `services/ml/artifacts/` (gitignored). Scripts: `generate_synthetic_data.py`, `train.py`, `evaluate.py`.  
**Provenance flag:** every response includes `data_provenance: synthetic|operational`.  
**Features (Table 3.2 aligned):** arrival time parts, referral/reason, priority, room, queue length at arrival, historical volume; target actual wait / counts.

---

## 9. Project Architecture

### 9.1 Proposed directory tree

```text
EchoFlow/
├── apps/
│   ├── patient/          # Next.js — mobile-first PWA EchoFlow Patient
│   ├── staff/            # Next.js — EchoFlow Staff portal
│   └── admin/            # Next.js — EchoFlow Admin portal
├── services/
│   ├── api/              # NestJS + MongoDB/Mongoose + Socket.IO
│   └── ml/               # FastAPI Random Forest / XGBoost
├── packages/
│   ├── ui/               # shared primitives only when duplicated
│   ├── types/            # shared DTOs / enums
│   ├── config/           # shared eslint/ts/tailwind fragments as needed
│   ├── eslint-config/
│   └── tsconfig/
├── docs/
│   ├── implementation-plan.md
│   ├── analysis-patient.md
│   └── _extract/         # text + page renders (dev reference; gitignore heavy PNGs if needed)
├── scripts/              # seed, bootstrap, codegen helpers
├── docker-compose.yml    # mongo, api, ml
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

**Adjustments vs guideline:** `packages/eslint-config` and `packages/tsconfig` added for monorepo hygiene; academic PDFs remain at repo root unmodified.

### 9.2 Runtime topology

```text
Patient / Staff / Admin (Next.js)
        │  REST + Socket.IO
        ▼
   NestJS API  ──► MongoDB
        │
        └──► FastAPI ML
```

### 9.3 Stack (implementation mandate — overrides proposal Table 3.3)

| Layer | Choice |
| --- | --- |
| Monorepo | pnpm workspaces + Turborepo |
| Frontends | Next.js, React, TypeScript, Tailwind, Lucide, Recharts, RHF+Zod, TanStack Query |
| API | NestJS, TypeScript, Socket.IO, Mongoose |
| DB | MongoDB |
| ML | FastAPI, RF + XGBoost |
| Auth | JWT access + refresh; bcrypt/argon2; TOTP for admin 2FA |

### 9.4 NestJS modules (derived)

`auth`, `patients`, `staff`, `admins`, `queues`, `queue-tickets`, `echo-rooms`, `visits`, `predictions`, `reports`, `notifications`, `audit`, `settings`, `check-ins`, `realtime`, `health`.

---

## 10. Implementation Phases

| Phase | Focus | Exit criteria |
| --- | --- | --- |
| **0** | Document analysis | This plan + screen inventory |
| **1** | Monorepo scaffold | Workspaces build; lint/tsconfig; README stub |
| **2** | Mongo schemas + seed | Models validated; seed script |
| **3** | Nest foundation | Modules, config, health, Docker mongo |
| **4** | AuthZ | Patient OTP, staff, admin 2FA, JWT refresh |
| **5** | Queue engine + Socket.IO | Call/skip/done/priority/leave; live updates |
| **6** | Patient app | All 14 screens UI-faithful |
| **7** | Staff app | All 11 screens + queue ops |
| **8** | Admin app | Documented admin screens/modals |
| **9** | ML service | Train/eval/predict endpoints |
| **10** | ML integration | Nest proxy; prediction UIs live |
| **11** | Reports/analytics | Aggregations + CSV (PDF best-effort) |
| **12** | Audit/security harden | Guards, rate limits, headers |
| **13** | Testing | Unit/API/critical UI flows |
| **14** | Docker/local DX | compose up works |
| **15** | Final docs/cleanup | README complete; no secrets |

**Phase discipline:** inspect → minimal change → format → lint → typecheck → test/build → fix → next.

---

## 11. Discrepancies, Ambiguities, and Assumptions

### 11.1 Document discrepancies

1. **Technology stack:** Proposal Table 3.3 specifies Flutter (patient), React, Express, **MySQL**. This project implements **Next.js ×3, NestJS, MongoDB** per product instruction. Research scope and FR remain; persistence technology is intentionally replaced.  
2. **Screen counts:** Proposal §1.5 / Ch.5 discuss ~20 “core” screens; result docs expand Patient to **14**, Staff to **11**, Admin beyond eight named cores (profile, extra modals, dedicated sign-in). **Implement result inventories.**  
3. **Register Station vs Add Echo Room:** Proposal lists two modals; Admin result states only **one** combined modal — implement one.  
4. **Add-Staff-Member:** Proposal one modal; Admin result three dialogs (formal add, quick technician, Access & Role) — implement all three.  
5. **Admin Reports & Insights:** FR7 names Admin Reports & Insights; sidebar shows **AI insights & reports** — implement under that nav label.  
6. **Unified Sign-In:** Present in Admin PDF as shared gateway; product requires **three apps** with dedicated auth UIs (Patient Secure Login, Staff Sign In, Admin Sign-In). Do **not** treat Unified Sign-In as admin-only; optional future marketing gateway only.  
7. **Patient category arithmetic:** Overview text vs index mismatch (14 named screens win) — see `analysis-patient.md`.  
8. **Ticket number formatting:** `A-014` vs `A042` across mockups — persist consistent `A-###` (zero-padded).  
9. **Priority sources:** Patient doc emphasises **on-site QR priority**; Staff/Proposal emphasise **staff Urgent flag**. Implement **both** as operational priority mechanisms with audit.  
10. **Patient Detail “Stable – low risk”:** Presentation tag in mockup — treat as **operational/visit status label**, not clinical diagnosis engine output.  
11. **Consultation notes:** Staff may save visit notes for continuity; ML must **not** use free-text clinical narrative as diagnosis; prefer structured operational features only.  
12. **Proposal vs result patient core list:** Proposal §1.5 lists 5 patient cores; result adds auth/profile/QR/notifications — implement full result set.

### 11.2 Ambiguities → chosen assumptions

| Topic | Assumption |
| --- | --- |
| OTP TTL / resend | 5 min expiry; 30 s resend cooldown; max 5 attempts (mock shows 00:28) |
| Reset link | 15 minutes, single-use (documented) |
| Session idle | Default 15 min for staff/admin when setting enabled |
| One active ticket | Enforce server-side; Home “Join” routes to current ticket if active |
| Geofencing | Pluggable `PresenceProvider`; default `DemoPresenceProvider` labelled in UI/API |
| Hospital SSO | Button present; returns clear “not configured” stub |
| Admin 2FA | TOTP; seed admin with known demo secret in `.env.example` only as placeholder docs |
| Language | EN only |
| PDF export | Implement CSV first; PDF via print-friendly HTML or library if time permits |
| AI insights & reports page | Admin screen composing prediction KPIs + unit report charts (not fully separate mock beyond nav) — build faithful dashboard-style page using Settings/Dashboard visual language |
| Leave queue confirm | Small modal not in PDF — allowed UX safety addition |

### 11.3 Explicit non-goals

- No HHIMS / e-Channelling replacement  
- No billing/EHR  
- No echo image AI / cardiac diagnosis  
- No claim that synthetic MAE/RMSE/R² are clinical validation  
- Academic PDFs at repo root remain unmodified  

---

## Traceability Checklist (pre-implementation)

- [ ] Patient: 14 screens match mock layout/terminology  
- [ ] Staff: 11 screens + Queue Management realtime  
- [ ] Admin: rooms, staff, audit, settings, profiles, modals  
- [ ] FR1–FR12 covered  
- [ ] MongoDB only for primary data store  
- [ ] Nest → ML only  
- [ ] Audit on security/queue/priority/admin mutations  
- [ ] Seed data fictional; mockup-aligned display samples  

---

*Phase 0 complete. Proceed to Phase 1 monorepo scaffolding.*
