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
  "access-control-allow-headers": "content-type,authorization",
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

const readJsonBody = async <T>(request: Request): Promise<T | null> => {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
};

const randomToken = () => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const sha256 = async (value: string) => {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

const getBearerToken = (request: Request) => {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
};

const requireDb = (env: Env) => {
  if (!env.DB) {
    throw new Error("D1 binding DB is not configured.");
  }

  return env.DB;
};

const verifySyncSpace = async (
  db: D1Database,
  spaceId: string,
  token: string,
) => {
  if (!spaceId || !token) {
    return false;
  }

  const row = await db
    .prepare("SELECT id, token_hash FROM sync_spaces WHERE id = ?")
    .bind(spaceId)
    .first<SyncSpaceRow>();

  return Boolean(row && row.token_hash === (await sha256(token)));
};

const createSyncSpace = async (request: Request, env: Env) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const db = requireDb(env);
  const id = crypto.randomUUID();
  const token = randomToken();
  const tokenHash = await sha256(token);

  await db
    .prepare(
      "INSERT INTO sync_spaces (id, token_hash, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
    )
    .bind(id, tokenHash)
    .run();

  return json({
    id,
    token,
    createdAt: new Date().toISOString(),
  });
};

const pushPlans = async (request: Request, env: Env) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const db = requireDb(env);
  const body = await readJsonBody<{
    spaceId?: string;
    syncSpaceId?: string;
    token?: string;
    plans?: Array<Record<string, unknown>>;
  }>(request);

  const spaceId = body?.spaceId ?? body?.syncSpaceId ?? "";
  const token = body?.token ?? getBearerToken(request);
  const plans = Array.isArray(body?.plans) ? body.plans : [];

  if (!(await verifySyncSpace(db, spaceId, token))) {
    return json({ error: "Invalid sync credentials" }, { status: 401 });
  }

  const validPlans = plans.filter(
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
      .bind(plan.id, spaceId, JSON.stringify(plan))
      .run();
  }

  return json({
    ok: true,
    pushedCount: validPlans.length,
  });
};

const pullPlans = async (request: Request, env: Env) => {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const db = requireDb(env);
  const url = new URL(request.url);
  const spaceId = url.searchParams.get("spaceId") ?? url.searchParams.get("syncSpaceId") ?? "";
  const token = url.searchParams.get("token") ?? getBearerToken(request);

  if (!(await verifySyncSpace(db, spaceId, token))) {
    return json({ error: "Invalid sync credentials" }, { status: 401 });
  }

  const rows = await db
    .prepare(
      "SELECT plan_json FROM cloud_trip_plans WHERE sync_space_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC",
    )
    .bind(spaceId)
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
