# EchoFlow Patient — Expo / React Native

## Run

```bash
# from repo root
pnpm --filter @echoflow/types build
pnpm --filter @echoflow/patient start
```

Then press `w` (web), `a` (Android), or `i` (iOS simulator).

## Demo login

- NIC: `200012345678`
- Phone: `712345678` (+94)
- OTP: `123456`

`EXPO_PUBLIC_FORCE_DEMO=true` (default) uses the in-app demo store matching seed patient **Kasun Perera**. When NestJS patient auth endpoints are available, set `EXPO_PUBLIC_FORCE_DEMO=false` and point `EXPO_PUBLIC_API_URL` at the API.

## Screens (P1–P14)

Auth: Login, Register, Verify OTP, Verification Successful, Update Phone  
Core: Home, Join Queue, Live Ticket, Live Queue, Visit History, Notifications  
Profile: Profile, Edit Profile, Check-in QR
