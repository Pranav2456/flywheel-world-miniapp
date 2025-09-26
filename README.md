# Flywheel Mini App

Flywheel is a World App mini app that coordinates leverage mission requests between capital providers (requesters) and skilled resolvers.

## Features
- Requester dashboard for creating and tracking leverage missions
- Resolver dashboard with execution checklists and payout tracking
- Verification flow powered by World ID Incognito Actions (`flywheel-leverage-access`)
- Mobile-first UI built with World Mini Apps UI Kit

## Development
```bash
npm install
npm run dev
```

Ensure the following environment variables are set:
```env
NEXT_PUBLIC_APP_ID=app_xxx
APP_ID=app_xxx
NEXTAUTH_SECRET=...
```

To load the mini app inside World App, expose your local dev server and register the URL in the World Developer Portal.
