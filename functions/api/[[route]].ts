type D1Result<T = unknown> = {
  results?: T[];
  success: boolean;
  error?: string;
};

type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>() => Promise<T | null>;
  run: <T = unknown>() => Promise<D1Result<T>>;
  all: <T = unknown>() => Promise<D1Result<T>>;
};

type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
};

type Env = {
  DB: D1Database;
};

type PagesContext = {
  request: Request;
  env: Env;
};

type SyncSpaceRow = {
  id: string;
  token_hash: string;
};

type CloudTripPlanRow = {
  plan_json: string;
};

type CloudCustomVenueRow = {
  venue_json: string;
};

type CloudUserPreferencesRow = {
  preferences_json: string;
};

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type,x-sync-space-id,x-sync-token",
};

const json = (body: unknown, init: ResponseInit = {}) => {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...init.headers,
    },
  });
};

const unauthorized = () => {
  return json({ error: "Invalid or missing sync credentials" }, { status: 401 });
};

const readJsonBody = async <T>(request: Request): Promise<T | null> => {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
};

const randomHex = (length: number) => {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
};

const createSyncSpaceId = () => `space_${randomHex(8)}`;

const createSyncToken = () => `token_${randomHex(20)}`;

const sha256 = async (value: string) => {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

const requireDb = (env: Env) => {
  if (!env.DB) {
    throw new Error("D1 binding DB is not configured.");
  }

  return env.DB;
};

const verifySyncSpace = async (request: Request, db: D1Database) => {
  const syncSpaceId = request.headers.get("x-sync-space-id")?.trim() ?? "";
  const syncToken = request.headers.get("x-sync-token")?.trim() ?? "";

  if (!syncSpaceId || !syncToken) {
    return null;
  }

  const row = await db
    .prepare("SELECT id, token_hash FROM sync_spaces WHERE id = ?")
    .bind(syncSpaceId)
    .first<SyncSpaceRow>();

  if (!row) {
    return null;
  }

  const tokenHash = await sha256(syncToken);
  return row.token_hash === tokenHash ? { syncSpaceId: row.id } : null;
};

const isMissingV08TableError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return /cloud_custom_venues|cloud_user_preferences|no such table|not found/i.test(
    message,
  );
};

const createSyncSpace = async (request: Request, env: Env) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const db = requireDb(env);
  const syncSpaceId = createSyncSpaceId();
  const syncToken = createSyncToken();
  const tokenHash = await sha256(syncToken);

  await db
    .prepare(
      "INSERT INTO sync_spaces (id, token_hash, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
    )
    .bind(syncSpaceId, tokenHash)
    .run();

  return json({
    syncSpaceId,
    syncToken,
  });
};

const pushSyncData = async (request: Request, env: Env) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const db = requireDb(env);
  const verified = await verifySyncSpace(request, db);

  if (!verified) {
    return unauthorized();
  }

  const body = await readJsonBody<{
    plans?: Array<Record<string, unknown>>;
    customVenues?: Array<Record<string, unknown>>;
    preferences?: Record<string, unknown>;
  }>(request);

  if (!Array.isArray(body?.plans)) {
    return json({ error: "plans must be an array" }, { status: 400 });
  }

  const validPlans = body.plans.filter(
    (plan) => typeof plan.id === "string" && plan.id.trim().length > 0,
  );

  for (const plan of validPlans) {
    await db
      .prepare(
        `INSERT INTO cloud_trip_plans (id, sync_space_id, plan_json, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
         ON CONFLICT(id) DO UPDATE SET
           sync_space_id = excluded.sync_space_id,
           plan_json = excluded.plan_json,
           updated_at = CURRENT_TIMESTAMP,
           deleted_at = NULL`,
      )
      .bind(plan.id, verified.syncSpaceId, JSON.stringify(plan))
      .run();
  }

  let syncedCustomVenues = 0;
  let syncedPreferences = 0;
  const warnings: string[] = [];
  const validCustomVenues = Array.isArray(body.customVenues)
    ? body.customVenues.filter(
        (venue) => typeof venue.id === "string" && venue.id.trim().length > 0,
      )
    : [];

  if (validCustomVenues.length) {
    try {
      for (const venue of validCustomVenues) {
        await db
          .prepare(
            `INSERT INTO cloud_custom_venues (id, sync_space_id, venue_json, created_at, updated_at, deleted_at)
             VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
             ON CONFLICT(id) DO UPDATE SET
               sync_space_id = excluded.sync_space_id,
               venue_json = excluded.venue_json,
               updated_at = CURRENT_TIMESTAMP,
               deleted_at = NULL`,
          )
          .bind(venue.id, verified.syncSpaceId, JSON.stringify(venue))
          .run();
      }

      syncedCustomVenues = validCustomVenues.length;
    } catch (error) {
      if (!isMissingV08TableError(error)) {
        throw error;
      }

      warnings.push("v0.8 D1 migration is required for custom venue sync.");
    }
  }

  if (body.preferences && typeof body.preferences === "object") {
    try {
      await db
        .prepare(
          `INSERT INTO cloud_user_preferences (sync_space_id, preferences_json, created_at, updated_at)
           VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT(sync_space_id) DO UPDATE SET
             preferences_json = excluded.preferences_json,
             updated_at = CURRENT_TIMESTAMP`,
        )
        .bind(verified.syncSpaceId, JSON.stringify(body.preferences))
        .run();
      syncedPreferences = 1;
    } catch (error) {
      if (!isMissingV08TableError(error)) {
        throw error;
      }

      warnings.push("v0.8 D1 migration is required for user preference sync.");
    }
  }

  return json({
    ok: true,
    synced: {
      plans: validPlans.length,
      customVenues: syncedCustomVenues,
      preferences: syncedPreferences,
    },
    warnings,
  });
};

const pullSyncData = async (request: Request, env: Env) => {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const db = requireDb(env);
  const verified = await verifySyncSpace(request, db);

  if (!verified) {
    return unauthorized();
  }

  const rows = await db
    .prepare(
      "SELECT plan_json FROM cloud_trip_plans WHERE sync_space_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC",
    )
    .bind(verified.syncSpaceId)
    .all<CloudTripPlanRow>();

  const plans = (rows.results ?? []).flatMap((row) => {
    try {
      return [JSON.parse(row.plan_json)];
    } catch {
      return [];
    }
  });

  let customVenues: unknown[] = [];
  let preferences: unknown = null;
  const warnings: string[] = [];

  try {
    const venueRows = await db
      .prepare(
        "SELECT venue_json FROM cloud_custom_venues WHERE sync_space_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC",
      )
      .bind(verified.syncSpaceId)
      .all<CloudCustomVenueRow>();

    customVenues = (venueRows.results ?? []).flatMap((row) => {
      try {
        return [JSON.parse(row.venue_json)];
      } catch {
        return [];
      }
    });
  } catch (error) {
    if (!isMissingV08TableError(error)) {
      throw error;
    }

    warnings.push("v0.8 D1 migration is required for custom venue sync.");
  }

  try {
    const preferencesRow = await db
      .prepare(
        "SELECT preferences_json FROM cloud_user_preferences WHERE sync_space_id = ?",
      )
      .bind(verified.syncSpaceId)
      .first<CloudUserPreferencesRow>();

    if (preferencesRow) {
      try {
        preferences = JSON.parse(preferencesRow.preferences_json);
      } catch {
        preferences = null;
      }
    }
  } catch (error) {
    if (!isMissingV08TableError(error)) {
      throw error;
    }

    warnings.push("v0.8 D1 migration is required for user preference sync.");
  }

  return json({
    ok: true,
    plans,
    customVenues,
    preferences,
    warnings,
  });
};

export const onRequest = async ({ request, env }: PagesContext) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: jsonHeaders });
  }

  try {
    const { pathname } = new URL(request.url);
    const route = pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");

    if (request.method === "GET" && route === "health") {
      return json({
        ok: true,
        service: "LiveTrip Planner API",
      });
    }

    if (route === "sync-spaces") {
      return createSyncSpace(request, env);
    }

    if (route === "sync/push") {
      return pushSyncData(request, env);
    }

    if (route === "sync/pull") {
      return pullSyncData(request, env);
    }

    return json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 },
    );
  }
};
