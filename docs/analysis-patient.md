# Patient documentation analysis

Source: `Result - Patient (User).docx.pdf`, **18 pages, all read and visually inspected**. Fourteen screenshots are embedded on PDF pages 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16 and 17. Pages 1–2 define purpose/index; page 18 closes the Notifications description. Page numbers below are PDF page numbers, not screen numbers. The academic source remains unchanged.

This is a source inventory for the main implementation plan. Proposed behaviours below are explicitly distinguished from documented behaviours. The document describes one actor: Patient / End-User / Registered Patient. The application is a mobile patient portal for a Sri Lankan public hospital's ECHO / ECO unit, coordinating with Staff and Administrator portals.

## Purpose and research connections

- Replace paper registration and manual queue slips with NIC-identified digital registration and ticket issuance.
- Offer ML-predicted waiting time, queue position and queue stage without requiring repeated staff queries.
- Permit remote queue joining and communicate changes to the patient's phone.
- Verify physical presence through staff-scanned expiring ticket QR plus GPS/geofencing, allowing documented on-site operational priority.
- Provide personal attendance history, profile management and notification history.
- Screen descriptions associate registration with research Objective 2; on-site priority with Objective 3; wait/volume prediction with Objective 4; real-time updates with Objective 5. These are references made by the result document, not independently established research findings.
- Random Forest / XGBoost are explicitly named at p9 as the source of the dashboard's predicted wait. Nothing in this document defines clinical diagnosis, treatment advice or image interpretation.

## Shared visual system

The screenshots show compact, tall white mobile surfaces with generous rounded corners, pale blue-gray outer frames/borders and soft shadows. Auth screens use pale decorative quarter-circle/rounded shapes in the top right and bottom left; content remains white. The primary palette is teal, cyan/blue, dark navy text, muted slate labels, amber wait/priority alerts, green completion/verification indicators and pale red logout styling. Primary buttons use blue-to-teal gradients in authentication and teal-to-blue gradients in the core journey. Inputs and cards have light gray-blue borders and pale backgrounds. Most content is arranged as a single vertical column with rounded cards; paired summary/action cards sit in two columns. Labels are often compact uppercase; screen headings are bold navy; ticket numbers use a distinctive technical/monospace appearance.

Implement branding as **EchoFlow Patient** where the mockups show General Hospital, retaining ECHO Unit / Patient Portal contextual wording as required by the project instruction. The HR / SpO2 / Verified auth footer is a decorative legend; no vital-sign readings or clinical sensor integration are specified.

Core screens show a bottom bar with four destinations in this order: **Home / Queue / History / Profile**. Each has a simple outline icon and text; the selected icon has a pale teal rounded-square background and teal text. A top notification bell opens Notifications. The QR and Notifications source mockups wrap bottom labels awkwardly; preserve destinations and visual language, but use readable responsive labels rather than reproducing text clipping.

No patient sidebar, data table, statistical chart or modal is explicitly shown. The dashboard dot-progress display, Live Ticket horizontal progress bar, and Live Queue circular people-ahead counter plus vertical stage timeline are the documented visual indicators. Dialogs needed for safe implementation (such as confirming Leave queue) should be small matching additions, recorded as implementation assumptions.

## Complete screen, control and state inventory

| Screen | Source screenshot / description | Actor state | Visible components, fields, actions and navigation |
| --- | --- | --- | --- |
| 1. Secure Login | p3 / pp3–4 | Returning patient, signed out | `SECURE LOGIN` badge; `ECHOCARDIOGRAPHY UNIT`; rounded pulse brand mark; hospital title and `ECHO UNIT · PATIENT PORTAL`; two-color ECG waveform; Log in / Register segmented control (Log in selected); NIC Number field with ID icon; Phone Number field with phone icon and +94 format; gradient Continue; new-patient registration shortcut; HR / SpO2 / Verified legend; globe EN language selector. |
| 2. New Patient Registration | p4 / pp4–5 | First-time or walk-in patient, signed out | Shared auth frame, pulse mark/waveform; `NEW PATIENT` badge; Register tab selected; Full Name, NIC Number, Phone Number (+94), Date of Birth (DD / MM / YYYY); gradient Create account →; existing-patient Log in link; footer legend. |
| 3. Verify OTP | p5 / pp5–6 | Pending login, registration or phone verification | `VERIFY OTP` badge; message-bubble mark; Verify your number heading; OTP UNIT · PATIENT PORTAL subtitle in screenshot; Code sent to masked/formatted destination; ECG waveform; VERIFICATION CODE label; six separate digit boxes (partially entered state shown); Didn't get a code? Resend in 00:28 countdown; gradient Verify & continue →; Wrong number? Edit phone number link; footer legend. |
| 4. Verification Successful | p6 / pp6–7 | Successfully verified patient | `VERIFIED` badge; checkmark mark; Verification successful; General Hospital · Echo Unit context; confirmation that phone is verified and account ready; gradient Back to login →; footer legend; large intentional whitespace below. |
| 5. Update Phone Number | p7 / pp7–8 | Patient changing destination | `EDIT DETAILS` badge; phone mark; Update phone number; Patient Portal · Security; one-time-code explanation; read-only Current number; editable New phone number; Send verification code →; Cancel and go back; auth footer legend. |
| 6. Home Dashboard | p8 / pp8–9 | Authenticated patient; example has active ticket | Wide teal-to-blue header Hello, Kasun; initials avatar KP; bell with unread indicator; overlapping two-column Your queue number white card A-014 and Predicted wait amber gradient card 32 min; LIVE · CURRENTLY SERVING white card A-009; 5 patients ahead of you; five-dot progress cluster and of 14; full-width Join today's queue →; paired Visit history and Profile buttons; mint bordered At the hospital now? card stating on-site patients get priority; Show check-in QR gradient button; bottom navigation Home selected. |
| 7. Join Today's Queue | p9 / pp9–10 | Authenticated patient requesting ticket | Small circular back control; Join today's queue heading; Reason for visit dropdown, Routine ECHO scan selected; three Preferred time slot chips 9–11 AM / 11–1 PM / 2–4 PM (first selected with gradient); Notes for staff (optional) multiline field, Any symptoms or referral details placeholder; amber Estimated wait for this slot 40 minutes callout with clock icon; full-width Confirm and join queue; reassurance about leaving waiting room and tracking place automatically; bottom navigation Queue selected. |
| 8. Live Ticket (Your Number) | p10 / pp10–11 | Authenticated patient immediately after issuance or viewing ticket | Large teal-to-blue card with Your number, LIVE UPDATES pill, large A-014, Predicted: 32 min translucent pill; NOW SERVING white card A-009 with amber dot, teal-to-amber progress bar, 5 ahead of you and 14 in queue total; amber bell alert We'll notify you / 3 patients before your turn; Leave queue outlined secondary action; Live Queue primary gradient action; bottom navigation Queue selected. |
| 9. Live Queue Tracking | p11 / pp11–12 | Patient with active ticket; position-change example | Centered heading and green AI PREDICTING badge; pale summary card split into queue number A042, outlined circular 11 People ahead counter, and Your status / In Queue blue pill; amber Your position moved back alert explaining on-site QR verified priority; mint outlined Checked in on-site? Show your QR button with gradient QR chip; vertical connected timeline: green check A039 Completed, blue outlined dot A040 ~4 min ahead of you, filled blue person A041 NEXT UP ~7 min, filled green person A042 YOU ARE HERE ~11 min in stronger green-bordered row; bottom navigation Queue selected. |
| 10. Visit History | p12 / pp12–13 | Authenticated patient | ECHO UNIT RECORDS badge; Visit history heading; past appointments subtitle; three small cards Total visits 3 / Completed 2 / Archived 1; vertical visit cards with colored left stripe, tinted icon, type, date, doctor, Completed green or Archived gray pill; Routine ECHO scan, Follow-up consultation and Doctor referral scan examples; full-width View all visits ›; bottom navigation History selected. |
| 11. Profile | p13 / pp13–14 | Authenticated patient | Gradient header with initials avatar, Kasun Perera, NIC, Verified pill; three translucent chips 3 Visits / 2026 Since / A-014 Last no.; white detail cards for phone, date of birth, address with tinted icons; Edit details outlined teal action; Log out pale red action; bottom navigation Profile selected. |
| 12. Edit Profile | p14 / pp14–15 | Authenticated patient editing | Large rounded gradient avatar header with KP and camera badge; Full name editable field with user icon and pencil; NIC number gray locked field with ID and lock icons; Phone field with phone/pencil; Date of birth with calendar/pencil; Address with map-pin/pencil; Save changes full-width gradient; Cancel outlined full-width; bottom navigation Profile selected. |
| 13. Check-in QR | p16 / pp15–17 | Patient arriving at hospital with active ticket | CHECK-IN QR badge, ECHO UNIT label, Show this at reception heading; Staff will scan it to confirm you're on-site; large QR in rounded white bordered card with navy modules and central gradient brand block; Expires in 04:12 pale blue countdown badge and ticket A-014; pale What happens next info card listing staff scan, GPS check, marked on-site/may move up; Refresh code outlined button; bottom navigation Queue selected. |
| 14. Notifications | p17 / pp17–18 | Authenticated patient | Notifications heading; Updates about your place in the queue; rounded chronological cards with tinted icons, bold title, detail, right-side relative timestamp; first two have red unread dots and tinted surface; notifications: Your position moved back (2 min ago), You're 3 patients away (6 min ago), Checked in successfully (34 min ago), Queue slot confirmed (1 hr ago), Appointment reminder (Yesterday); bottom navigation Queue selected. |

### Explicit notification copy and data

- Position change: an on-site check-in was prioritized; example position moves from #7 to #9.
- Proximity: head to the Echo Room waiting area now when three patients away.
- Check-in: GPS verified; patient now marked on-site. A development mode must instead identify demo verification honestly.
- Queue slot confirmed: joined today's queue at position #14.
- Appointment reminder: Routine ECHO scan today between 9–11 AM.
- Notifications retain chronological history, unread state and relative timestamps; Home bell mirrors unread status.

### Documented states versus additional operational states

The source visibly includes login/register selection, partially entered OTP, resend countdown, verification success, disabled/read-only identifiers, selected/unselected slot chips, active bottom destinations, verified identity, unread/read notifications, queue In Queue, completed/current/next/self timeline states, priority-reorder warning, QR expiry countdown, visit Completed/Archived and logout warning color.

The PDF does **not** supply full separate loading, network-error, expired-OTP, invalid-input, empty-queue, empty-history, completed-current-ticket, expired-QR or permission-denied screenshots. Implement accessible inline states consistent with these cards: skeleton/loading text, recoverable error with Retry, explicit empty-state text with relevant primary action, disabled submitting controls, expired QR refresh, and clear invalid/expired OTP feedback. Do not label these additions as source screenshots.

## Authentication and profile rules

1. Login validates the NIC and registered mobile pairing. A match creates an SMS OTP challenge; queue and personal data require verification.
2. Registration captures full name, NIC, phone and date of birth, enforces unique NIC and verifies phone before account activation. No patient password field exists.
3. The OTP has six digits, expiry and resend cooldown. The exact lifetime, retry limit, cooldown duration and delivery provider are not defined; 00:28 is demonstration state, not a specified policy.
4. OTP is described as a two-factor checkpoint, but NIC is an identifier and does not itself establish an independent secret factor. Describe implemented NIC-plus-SMS access accurately without claiming strong independent patient MFA.
5. Verification Successful retains the documented screen. The text permits returning to Secure Login or proceeding to Home depending on entry flow. Proposed resolution: registration/phone-change completion presents Back to login; returning-patient login proceeds to Home after its success confirmation, avoiding an endless verification loop.
6. The phone number is the security and notification destination. Changing it must create a pending change and verify the new number before persistence; old verified phone remains effective until success. The current-number field is read-only.
7. NIC is immutable through patient self-service. Profile fields include full name, date of birth, address, phone and optional photo; avatar falls back to initials. Profile includes verified state, total visits, member-since year and last ticket.
8. Profile Edit details opens Edit Profile. Although its Phone row appears editable, submission must route a changed phone through Update Phone Number and OTP. Do not directly mutate a verified phone through a generic profile update.
9. Pre-auth Wrong number permits correcting the pending registration/login phone and regenerating the challenge; it cannot change an established account's phone without an authenticated session or a separately authorized recovery process. No lost-SIM recovery workflow is documented, so it must not become an account takeover route.
10. Language selector shows EN only; no translations or list of supported alternatives is defined. Implement EN without pretending translations exist.

## Queue, priority and real-time rules

- Join captures service/reason, preferred slot and optional notes. Show slot-specific estimated waiting time before confirmation; successful submission creates a persisted ticket and opens Live Ticket.
- The reason dropdown explicitly shows Routine ECHO scan; Visit History additionally names Follow-up consultation and Doctor referral scan. These three are reasonable initial reason choices pending other source reconciliation; the source does not show an exhaustive dropdown.
- The three visible slot values are 09:00–11:00, 11:00–13:00 and 14:00–16:00 in hospital local time. The document does not define appointments on future dates; an Appointment reminder notification alone does not establish a separate booking module.
- Live Ticket supports Leave queue and Live Queue. Persist cancellation/leaving and broadcast updated positions. A matching confirmation dialog is a reasonable implementation addition, not a documented modal.
- Tickets distinguish immutable issued number from mutable queue position. Patient position and people-ahead must be calculated from actual operational order, not subtracting ticket numbers.
- Staff calls/completions/reprioritizations update serving ticket, surrounding anonymous ticket timeline, patients ahead, current status and predicted wait immediately without refreshing.
- Verified on-site check-in may advance an operational position. The moved-back alert explains such changes to affected remote patients. Priority must not preempt an already-started examination.
- QR is unique to the ticket, expiring and refreshable. Staff scan confirms the challenge; a geofence service checks presence. Development uses a clearly labelled demo provider rather than claiming a hospital GPS deployment.
- The on-site check-in trigger must be mediated by authorized staff and recorded with verification mode, actor, timestamp and priority change. Patients cannot mark themselves urgent. This patient source establishes on-site priority; urgent clinical-workflow authority must be reconciled against the Staff/Proposal sources.
- A notification fires when the patient reaches the three-patients-away threshold, plus queue join, successful check-in and position-reorder updates. Use idempotency/deduplication so repeated prediction or position events do not spam notifications.
- No patient view should reveal another patient's name, NIC, phone, notes or medical information; the surrounding timeline displays anonymous ticket numbers and stages only.
- The home screenshot simultaneously shows an active ticket and Join today's queue. Proposed resolution: retain the visible action but route an already-queued patient to their current ticket or explain the active-ticket constraint; enforce one active ticket per patient per queue/day on the server.

## Patient-derived model requirements

| Model / reference | Required data from these screens | Relationships / constraints |
| --- | --- | --- |
| Patient | Full name, unique NIC, normalized phone, verified-at, date of birth, address, avatar metadata, activation status, created-at | References account/session identity; owns tickets, visits, notifications. NIC immutable in patient DTOs. |
| OTP challenge / pending phone change | Purpose, pending identity/contact, hashed code, expiry, resend timing, attempt count, verification/consumption state | Bound to challenge and intended patient or pending registration; TTL cleanup, one-time consume; do not expose code in normal API responses/logs. |
| Session / refresh token | Patient/account reference, hashed refresh token, expiry, revocation | Access only after OTP; logout revokes applicable session. |
| Queue | Unit/local service date, open/closed state, operational ordering revision | Has tickets and serving rooms; daily uniqueness rules. |
| QueueTicket | Patient, queue/date, issued ticket number, current stage, service reason, selected slot, staff notes, operational priority, on-site status, joined/called/completed/cancelled timestamps | One active patient ticket; indexes for queue/status/order; mutable position calculated from ordering; optional room/visit/prediction references. |
| Check-in challenge | Ticket, token hash/nonce, issued/expiry/consumed timestamps, staff verifier, demo/GPS mode | Ticket-owned, expiring, single-use, refresh invalidates prior challenge. |
| Prediction | Ticket/queue/slot reference, estimate minutes, model/version, generated time, demo-data provenance, optional meaningful interval | History retained; frontend receives API output, not direct ML calls. |
| Visit | Patient, ticket, service type, attendance date, attending staff/doctor, Completed/Archived status | Patient-scoped list and counts, separate archival flag/status as domain policy determines. |
| Notification | Patient, type, title, body, ticket reference, created/read timestamps, semantic dedupe key | Read status powers unread bell; chronological pagination. |
| AuditLog | Actor and role, action, target, timestamp, safe metadata | Phone-change, authentication, cancellation, check-in and operational priority events. |

Symptom/referral notes are staff-facing operational context, not an autonomous medical-priority feature or model diagnosis input. Although p10 says notes enter the prediction pipeline, the implementation should use operational structured features and exclude raw sensitive free text from ML until a justified privacy-reviewed feature design exists. Record this conservative boundary in the main implementation plan.

## Patient-derived API and event contract suggestions

These routes are proposals, not route names present in the PDF. NestJS remains the only frontend backend.

| Capability | Proposed API |
| --- | --- |
| Patient registration/login challenge | `POST /auth/patient/register`, `POST /auth/patient/login` |
| Verify/resend OTP | `POST /auth/otp/verify`, `POST /auth/otp/resend` |
| Session lifecycle | `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Profile/photo | `GET /patients/me`, `PATCH /patients/me`, constrained `POST /patients/me/avatar` |
| Phone change | `POST /patients/me/phone-change` plus purpose-bound OTP verification |
| Dashboard | `GET /patients/me/dashboard` |
| Queue configuration/estimate | `GET /queues/today`, `GET /queues/today/options`, `POST /predictions/wait-time` |
| Create/view/leave ticket | `POST /queue-tickets`, `GET /queue-tickets/current`, `GET /queue-tickets/:id`, `POST /queue-tickets/:id/leave` |
| Tracking | `GET /queue-tickets/:id/tracking` with anonymous neighboring-ticket data |
| Issue/refresh QR | `POST /queue-tickets/:id/check-in-code` |
| Staff-mediated QR confirmation | Authorized `POST /check-ins/verify` (exact staff integration reconciled with Staff source) |
| Visit history | `GET /patients/me/visits` with summary/pagination |
| Notifications/read | `GET /notifications`, `PATCH /notifications/:id/read` |

Subscribe authenticated Socket.IO clients to their patient channel and sanitized queue summaries. Relevant domain events: `queue.ticket.created`, `queue.ticket.called`, `queue.ticket.completed`, `queue.ticket.skipped`, `queue.ticket.cancelled`, `queue.ticket.priority_changed`, `queue.position.changed`, `queue.check_in.verified`, `queue.room.updated`, `prediction.updated`, `notification.created`, `notification.read`. Event payloads identify revision/affected resource so clients can refetch authoritative MongoDB-backed snapshots after reconnect or missed messages. Never broadcast all patient details to a public queue room.

## Discrepancies, ambiguities and sample-data guardrails

1. **Category arithmetic (p2):** prose claims five account-access, three profile/security, five core-journey and one priority screen (14), but the explicit index has **four** Authentication / Access, **three** Profile & Security, **six** Core Patient Journey and **one** Priority & Verification. Implement the 14 named screens rather than the inconsistent category counts.
2. **Success destination (pp6–7):** screenshot says Back to login, prose also permits Home by entry flow. Preserve screen and documented label for registration/security confirmation; provide a coherent login continuation as above.
3. **Phone edit conflict (pp14–15 versus pp7–8):** Edit Profile visibly includes editable Phone, while security description demands OTP. Keep the visible field, require verified pending phone change before committing it.
4. **Ticket-number formatting:** A-014/A-009 on Home and Live Ticket versus A042/A039 on Tracking. These are independent sample mockups. Use a consistent persisted issued-number format (proposed A-014) while preserving the visual ticket typography.
5. **Tracking counts:** screenshot lists A039–A042 but says 11 people ahead; the source does not establish a mathematically consistent complete queue snapshot. Treat timeline as a surrounding-ticket sample and derive real counters/order from data.
6. **NIC/date sample mismatch:** visible NIC 200012345678 and DOB 14 May 1988 do not form a validated real identity. Do not build validation by assuming sample consistency; use fictional demo labels and defined format validation.
7. **QR deployment not established:** source describes GPS verification but provides no hospital coordinates, geofence radius, accuracy rule, device trust model or integration. Implement a replaceable demo presence provider and identify its provenance.
8. **Join with existing ticket:** Home mockup shows both an issued ticket and Join action. Enforce one active ticket and reuse its view as the safe resolution.
9. **Appointment reminder scope:** a notification says Yesterday for a scan today, but Join Today's Queue is only specified for the current day. Keep notification support without inventing a future appointment-booking interface.
10. **Language:** only EN appears. Other locales are not evidenced.
11. **QR artwork and clipping:** source artwork is a visual example, not a production code to reuse; render a genuine expiring token QR. Preserve layout while fixing label/ticket line wrapping in the original tiny mockup.
12. **Demonstration values:** Kasun Perera/KP, NIC and phone, Nugegoda address, ticket examples, dates, named doctors, 3 visits, 2 completed, 1 archived, 2026 membership year, 32/40/~4/~7/~11 minutes, 11/5 people ahead, 14 total, 00:28 OTP and 04:12 QR countdowns are all sample UI data. They do not establish measured waiting-time reductions, accuracy, hospital deployment or clinical validation.

## Traceability and verification checklist for implementation

- Verify mobile layouts against the 14 source screenshots at phone width and ensure readable desktop demonstration framing.
- Exercise registration → OTP → success, returning login → OTP → Home, resend expiry/rate-limit, and wrong-phone correction.
- Check locked NIC, profile save/cancel, optional avatar update, verified phone change and logout.
- Exercise reason/slot/notes → estimate → join → Live Ticket → Live Queue, Leave queue and duplicate join protection.
- Use two browser roles to prove staff queue actions update patient serving number, position, wait/stage and alerts without refreshing.
- Verify staff-scanned expiring QR, rejected expired/replayed code, honest demo-geofence state and audited on-site priority.
- Derive Visit History totals/cards and unread Notifications from persisted patient-owned data; exercise View all visits pagination and read-state bell updates.
- Include matching loading, validation, empty and reconnect/error states; never substitute the mock sample numbers for live server data.
