# Changelog

All notable changes to LiveTrip Planner are documented here.

## [1.0.0]

### Added

- Versioned JSON backup schema with `schemaVersion`, `appVersion`, and `exportedAt`.
- Playwright E2E coverage for onboarding, trip planning, comparison, venue management, preferences, and backup flows.
- GitHub Actions CI for build, unit tests, and E2E tests.
- Real screenshot generation script for release documentation.
- `SECURITY.md`, `PRIVACY.md`, and v1.0 release notes.
- Settings About section with version, demo, repository, privacy, and security links.

### Changed

- Updated package version to `1.0.0`.
- First-run behavior now starts with an empty local plan list instead of silently loading sample data.
- README repositioned as a v1.0 portfolio-ready project page.

### Fixed

- Restored valid UTF-8 metadata in `index.html` so Vite production builds work reliably on Windows paths.
- Backup import now rejects unsupported future schemas instead of silently importing unknown formats.

### Security

- Added in-app Cloud Sync token handling notes.
- Documented Sync Token safety, localStorage storage, token hash storage, and recovery limitations.

## v0.9.0

### Added

- First-run onboarding with local dismissal state.
- Toast feedback system.
- React Error Boundary.
- Unsaved-change protection for trip forms, custom venue forms, and user preferences.
- Route-level code splitting with `React.lazy`.
- Vitest unit tests for core logic.
- Site metadata, favicon, and Open Graph image placeholder.
- Architecture documentation.

### Changed

- Improved localStorage and JSON normalization.
- Reduced initial bundle size by splitting route pages and detail-page dependencies.
- Updated README for portfolio presentation.

## v0.8.0

### Added

- Cloud Sync for custom venues.
- User Preferences with localStorage persistence and cloud sync.
- Preference-aware Smart Advice Engine.
- D1 migration for custom venues and preferences.

## v0.7.0

### Added

- User-managed custom venues.
- Venue management page.
- City Guide templates.
- External map search links.
- JSON backup support for custom venues.

## v0.6.0

### Added

- Built-in venue database.
- Venue Insight cards.
- Venue risk scoring.
- Hotel area recommendations.

## v0.5.0

### Added

- Rule-based Smart Advice Engine.
- Smart Advice summaries in details, compare, and Markdown export.

## v0.4.0

### Added

- Cloudflare Pages Functions API.
- Cloudflare D1 Sync Space model.
- Manual push and pull for trip plans.

## v0.3.0

### Added

- Markdown export.
- JSON backup and import.
- Sample data management.
- Documentation polish.

## v0.2.0

### Added

- Edit and delete plans.
- Worth score breakdown.
- Budget chart.
- Timeline.
- Compare sorting.

## v0.1.0

### Added

- React + TypeScript + Vite MVP.
- Tailwind CSS UI.
- localStorage trip plans.
- Dashboard, create, detail, and compare pages.
