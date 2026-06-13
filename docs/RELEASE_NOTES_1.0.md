# LiveTrip Planner v1.0.0 Release Notes

## Project Positioning

LiveTrip Planner is a local-first concert travel planner for fans who need to decide whether an out-of-town live event is worth the cost, fatigue, and logistics.

## Core Features

- Trip plan creation, editing, deletion, and comparison.
- Budget breakdown and worth score calculation.
- Rule-based Smart Advice Engine.
- Built-in and custom venue database.
- City Guide recommendations.
- Markdown itinerary export.
- Versioned JSON backup and restore.
- Anonymous Sync Space cloud sync on Cloudflare D1.
- User preferences that influence defaults and advice.
- First-run onboarding, toast feedback, and error boundary.

## Technical Architecture

- React + TypeScript + Vite frontend.
- Tailwind CSS UI.
- Route-level code splitting with `React.lazy`.
- Cloudflare Pages Functions for `/api/*`.
- Cloudflare D1 with Sync Space token hash verification.
- Vitest unit tests for core logic.
- Playwright E2E tests for critical product flows.
- GitHub Actions CI for build, unit tests, and E2E tests.

## Data and Sync Design

The app remains local-first. `localStorage` is the primary store. Cloud Sync is manual and uses anonymous Sync Spaces instead of accounts. Push and pull operations merge trip plans and custom venues by `updatedAt`; user preferences also prefer newer timestamps where available.

## Test Status

v1.0 adds Playwright E2E coverage for onboarding, trip plans, comparison, venue management, preferences, and backup export/import. Unit tests cover budget calculation, worth score, smart advice, merge behavior, and data normalization.

## Known Limitations

- No full account system.
- Sync Tokens cannot be recovered if lost.
- Sync is manual, not real-time.
- Conflict handling depends on `updatedAt`.
- Venue and City Guide data is static.
- No real-time traffic, hotel, ticketing, or exchange-rate data.
- Smart Advice is rule-based and not professional travel advice.

## Possible Next Directions

- Sync custom city preferences and richer personal knowledge.
- Optional AI summary layer that does not replace deterministic rules.
- User-maintained venue import/export packs.
- Better mobile-first itinerary presentation.
