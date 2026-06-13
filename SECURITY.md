# Security Policy

## Reporting Security Issues

Please do not post Sync Tokens, database contents, or private trip details in a public GitHub issue.

For sensitive reports, contact the repository owner privately through GitHub before sharing details. If a public issue is appropriate, remove all tokens and personal data first.

## Sync Token Safety

- A Sync Token is an access credential for a Sync Space.
- The browser stores the Sync Space ID and Sync Token in `localStorage`.
- The Cloudflare D1 database stores only a SHA-256 hash of the token, not the plaintext token.
- The token is shown only when a Sync Space is created. If it is lost, it cannot be recovered.
- If a Sync Token is leaked, create a new Sync Space and push your local data there.

## Transport and Hosting

Production traffic is served through Cloudflare Pages over HTTPS. LiveTrip Planner does not implement a high-security identity system, OAuth flow, or password recovery. It is designed as a lightweight anonymous sync tool.

## Current Security Boundaries

- No user registration or email identity.
- No server-side recovery for lost Sync Tokens.
- Manual sync only; local data is not uploaded unless the user starts a push.
- External map links open third-party sites and are outside this project's control.

Do not store highly sensitive personal information in trip notes or venue notes.
