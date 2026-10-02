# EchoFlow staff and admin web portal

Run `pnpm --filter @echoflow/staff dev` from the repository root, then open http://localhost:3001/login.
This is the common login for both roles. Staff routes keep their existing paths; admin routes live under `/admin`.
The existing dashboard markup, colors and layouts are retained. Admin CSS is scoped to its workspace.
The old app on port 3002 redirects to this portal; set `WEB_PORTAL_URL` there when deploying.

## Local demo accounts

| Account | Password | Access code | Workspace |
| --- | --- | --- | --- |
| ECHO-STF-001 | EchoFlow!demo | Not required | Staff (`/`) |
| ECHO-ADM-014 | EchoFlow!demo | 123456 | Admin (`/admin`) |

Demo authentication is development-only and controlled by `NEXT_PUBLIC_FORCE_DEMO` (default true in development).
Existing demo screen data and editing behavior are retained; this change does not connect those demo screens to database CRUD.

## Real authentication

Set `NEXT_PUBLIC_FORCE_DEMO=false` and `API_URL` in `.env.local`. The server uses the existing API login endpoints
and `/auth/me` to verify the account role and status. API failures never grant demo access.
Technicians and room leads enter the staff workspace; super admins enter the admin workspace.
The existing API role guards enforce data/action permissions independently of the web UI.

Production requires a random `WEB_SESSION_SECRET` of at least 32 characters and HTTPS. Use the same secret on
all web instances. Sessions use signed HttpOnly, SameSite cookies, checked in server layouts and the browser gate.
Browser storage cannot grant a role. Local development generates an ephemeral secret; restarting the server can require login again.
Live sessions expire with the API access token and require another login (automatic refresh is not implemented).
Logout clears the cookie, revokes the refresh token when possible, and signals other tabs to recheck their session.
The common login retains administrator two-factor verification.

Run `pnpm --filter @echoflow/staff test` for session integrity and role-routing checks.
