# Privacy Policy

LiveTrip Planner is a local-first planning tool. This document describes the current v1.0 behavior; it is not a legal contract.

## Data You Provide

The app may store:

- Trip plans, budgets, notes, timelines, and venue choices.
- Custom venues.
- User preferences such as home city, default budgets, map provider, and risk preferences.
- Sync Space credentials saved in the browser when Cloud Sync is enabled.

## Local Storage

By default, data is stored in your browser `localStorage`. Clearing browser data can delete local plans and saved Sync Space credentials. Please export a JSON backup and save your Sync Token before clearing browser storage.

## Cloud Sync

Cloud Sync is manual. Data is uploaded to Cloudflare D1 only when you click the upload action. Pulling from cloud also requires the Sync Space ID and Sync Token.

The cloud database stores:

- Sync Space ID.
- SHA-256 hash of the Sync Token.
- Trip plan JSON.
- Custom venue JSON.
- User preference JSON.

The plaintext Sync Token is not stored on the server.

## Third Parties

LiveTrip Planner does not use advertising trackers and does not sell user data. External map buttons open Google Maps, Apple Maps, Baidu Maps, or Amap search pages in a new tab; those services have their own privacy policies.

## User Responsibility

You are responsible for keeping your Sync Space ID and Sync Token private. If the token is lost, the existing Sync Space cannot be recovered. If it is leaked, create a new Sync Space and move your data there.
