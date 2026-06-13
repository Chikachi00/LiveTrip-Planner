# LiveTrip Planner Architecture

## Frontend Architecture

The frontend is a React + TypeScript + Vite application. Route pages are lazy-loaded with `React.lazy` and `Suspense` so the Dashboard, plan detail, compare, venues, and settings surfaces do not all ship in the initial bundle. Shared UI lives in `src/components`, while domain logic lives in `src/lib` and `src/utils`.

Key modules:

- `src/lib/adviceEngine.ts`: rule-based trip advice
- `src/lib/cloudSync.ts`: API client for Sync Space operations
- `src/lib/customVenues.ts`: custom venue localStorage helpers
- `src/lib/userPreferences.ts`: user preference defaults and persistence
- `src/utils/merge.ts`: cloud pull conflict handling
- `src/utils/storage.ts`: plan localStorage normalization
- `src/utils/dataManagement.ts`: JSON backup schema, import validation, and sample data merge

## localStorage-First Design

The browser is the primary data store. The app remains fully usable without Cloud Sync.

Local keys:

- `livetrip-planner:plans`
- `livetrip-planner:custom-venues`
- `livetrip-planner:user-preferences`
- `livetrip-planner:sync-credentials`
- `livetrip-planner:onboarding-dismissed`

All read paths normalize missing fields, numeric strings, invalid dates, and old-version data shapes before rendering.

## JSON Backup Schema

v1.0 exports a versioned backup format:

```json
{
  "schemaVersion": 1,
  "appVersion": "1.0.0",
  "exportedAt": "ISO datetime",
  "tripPlans": [],
  "customVenues": [],
  "userPreferences": {}
}
```

Legacy array backups and older object backups without `schemaVersion` are treated as schema 0. Unknown future schema versions are rejected with a clear import error instead of being silently imported.

## Pages Functions API

API entrypoint:

```text
functions/api/[[route]].ts
```

Routes:

- `GET /api/health`
- `POST /api/sync-spaces`
- `POST /api/sync/push`
- `GET /api/sync/pull`

The React SPA remains separate from API routing. `public/_routes.json` includes `/api/*` for Functions.

## D1 Tables

`sync_spaces`

- `id`
- `token_hash`
- `created_at`
- `updated_at`

`cloud_trip_plans`

- `id`
- `sync_space_id`
- `plan_json`
- `created_at`
- `updated_at`
- `deleted_at`

`cloud_custom_venues`

- `id`
- `sync_space_id`
- `venue_json`
- `created_at`
- `updated_at`
- `deleted_at`

`cloud_user_preferences`

- `sync_space_id`
- `preferences_json`
- `created_at`
- `updated_at`

## Sync Space Authentication

1. Client creates a Sync Space.
2. Server generates `syncSpaceId` and one-time `syncToken`.
3. Server stores only `SHA-256(syncToken)` as `token_hash`.
4. Push and pull requests send:

```text
x-sync-space-id: space_xxxxxxxx
x-sync-token: token_xxxxxxxxxxxxxxxxxxxx
```

5. The Function hashes the provided token and compares it with the stored hash.

## Push Data Flow

1. User clicks upload.
2. Client sends `plans`, `customVenues`, and `preferences`.
3. Pages Function verifies Sync Space credentials.
4. Plans upsert into `cloud_trip_plans`.
5. Custom venues upsert into `cloud_custom_venues`.
6. Preferences upsert into `cloud_user_preferences`.
7. Response returns synced counts and warnings.

## Pull Data Flow

1. User clicks pull.
2. Client requests cloud data with Sync Space headers.
3. Function returns valid plans, custom venues, and preferences.
4. Invalid JSON rows are skipped server-side.
5. Client normalizes all received records.
6. Client merges by `updatedAt`.

## Conflict Strategy

- Different ids: append.
- Same id with newer cloud `updatedAt`: use cloud.
- Same id with newer local `updatedAt`: keep local.
- Missing or invalid `updatedAt`: keep local.
- Preferences follow the same rule; if no local preferences exist, cloud preferences are imported.

## Safety Boundaries

- No account system.
- No OAuth.
- No AI API.
- No map API.
- No realtime hotel or transport API.
- No plaintext sync tokens stored in D1.
- No Cloudflare or GitHub tokens in the repository.

## Testing and CI

- Vitest covers budget calculation, Worth Score, Smart Advice, merge behavior, and backup normalization.
- Playwright covers first-run onboarding, trip creation/editing, compare sorting, custom venue management, preferences, and JSON backup flow.
- GitHub Actions runs `npm ci`, `npm run build`, `npm run test:run`, installs Playwright Chromium, and runs `npm run test:e2e:ci`.
- E2E tests start a local Vite server and do not call the production D1 database.

## Current Limits

- Cloud Sync is manual only.
- There is no cloud delete propagation yet.
- Sync Space tokens cannot be recovered if lost.
- Venue and city data are static or user-maintained.
- Multi-currency support is a display preference only; no exchange conversion is performed.
