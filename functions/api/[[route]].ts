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

const pushPlans = async (request: Request, env: Env) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const db = requireDb(env);
  const verified = await verifySyncSpace(request, db);

  if (!verified) {
    return unauthorized();
  }

  const body = await readJsonBody<{ plans?: Array<Record<string, unknown>> }>(
    request,
  );

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

  return json({
    ok: true,
    synced: validPlans.length,
  });
};

const pullPlans = async (request: Request, env: Env) => {
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

  return json({
    ok: true,
    plans,
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
      return pushPlans(request, env);
    }

    if (route === "sync/pull") {
      return pullPlans(request, env);
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
