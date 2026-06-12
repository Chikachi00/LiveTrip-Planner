import type { Venue } from "../data/venues";
import type { TripPlan } from "../types";
import type { UserPreferences } from "./userPreferences";

const CREDENTIALS_KEY = "livetrip-planner:sync-credentials";

export type SyncCredentials = {
  syncSpaceId: string;
  syncToken: string;
  lastSyncedAt?: string;
};

type CreateSyncSpaceResponse = {
  syncSpaceId: string;
  syncToken: string;
};

export type SyncCounts = {
  plans: number;
  customVenues: number;
  preferences: number;
};

export type PushAllDataResponse = {
  ok: boolean;
  synced: SyncCounts;
  warnings?: string[];
};

export type PullAllDataResponse = {
  ok: boolean;
  plans: TripPlan[];
  customVenues: Venue[];
  preferences: UserPreferences | null;
  warnings?: string[];
};

const migrationHint =
  "云端数据库还没有执行 v0.8 migration，自定义场馆或用户偏好可能暂时无法同步。";

const getErrorMessage = async (response: Response) => {
  if (response.status === 401) {
    return "Sync Space ID 或 Sync Token 不正确。";
  }

  try {
    const body = (await response.json()) as { error?: string };
    const error = body.error || `请求失败：${response.status}`;
    return /cloud_custom_venues|cloud_user_preferences|no such table/i.test(error)
      ? migrationHint
      : error;
  } catch {
    return `请求失败：${response.status}`;
  }
};

const normalizePushResponse = (response: unknown): PushAllDataResponse => {
  const body = response as {
    ok?: boolean;
    synced?: number | Partial<SyncCounts>;
    warnings?: string[];
  };

  return {
    ok: Boolean(body.ok),
    synced:
      typeof body.synced === "number"
        ? { plans: body.synced, customVenues: 0, preferences: 0 }
        : {
            plans: body.synced?.plans ?? 0,
            customVenues: body.synced?.customVenues ?? 0,
            preferences: body.synced?.preferences ?? 0,
          },
    warnings: body.warnings ?? [],
  };
};

const normalizePullResponse = (response: unknown): PullAllDataResponse => {
  const body = response as Partial<PullAllDataResponse>;

  return {
    ok: Boolean(body.ok),
    plans: Array.isArray(body.plans) ? body.plans : [],
    customVenues: Array.isArray(body.customVenues) ? body.customVenues : [],
    preferences: body.preferences ?? null,
    warnings: body.warnings ?? [],
  };
};

const requestJson = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(path, init);
  } catch {
    throw new Error("无法连接云端同步服务，请稍后重试。");
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as T;
};

export const saveSyncCredentials = (credentials: SyncCredentials) => {
  window.localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
};

export const getSyncCredentials = (): SyncCredentials | null => {
  const raw = window.localStorage.getItem(CREDENTIALS_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SyncCredentials;
    return parsed.syncSpaceId && parsed.syncToken ? parsed : null;
  } catch {
    return null;
  }
};

export const clearSyncCredentials = () => {
  window.localStorage.removeItem(CREDENTIALS_KEY);
};

export const createSyncSpace = async () => {
  const credentials = await requestJson<CreateSyncSpaceResponse>("/api/sync-spaces", {
    method: "POST",
  });

  const savedCredentials = {
    ...credentials,
    lastSyncedAt: undefined,
  };
  saveSyncCredentials(savedCredentials);
  return savedCredentials;
};

const getRequiredCredentials = () => {
  const credentials = getSyncCredentials();

  if (!credentials) {
    throw new Error("尚未连接 Sync Space。");
  }

  return credentials;
};

const authHeaders = (credentials: SyncCredentials) => ({
  "content-type": "application/json",
  "x-sync-space-id": credentials.syncSpaceId,
  "x-sync-token": credentials.syncToken,
});

const touchSyncTime = (credentials: SyncCredentials) => {
  const next = {
    ...credentials,
    lastSyncedAt: new Date().toISOString(),
  };
  saveSyncCredentials(next);
  return next;
};

export const pushAllDataToCloud = async ({
  plans,
  customVenues,
  preferences,
}: {
  plans: TripPlan[];
  customVenues: Venue[];
  preferences?: UserPreferences;
}) => {
  const credentials = getRequiredCredentials();
  const result = normalizePushResponse(
    await requestJson<unknown>("/api/sync/push", {
      method: "POST",
      headers: authHeaders(credentials),
      body: JSON.stringify({
        plans,
        customVenues,
        ...(preferences ? { preferences } : {}),
      }),
    }),
  );

  touchSyncTime(credentials);
  return result;
};

export const pullAllDataFromCloud = async () => {
  const credentials = getRequiredCredentials();
  const result = normalizePullResponse(
    await requestJson<unknown>("/api/sync/pull", {
      method: "GET",
      headers: authHeaders(credentials),
    }),
  );

  touchSyncTime(credentials);
  return result;
};

export const pushPlansToCloud = async (plans: TripPlan[]) => {
  const result = await pushAllDataToCloud({
    plans,
    customVenues: [],
  });

  return {
    ok: result.ok,
    synced: result.synced.plans,
  };
};

export const pullPlansFromCloud = async () => {
  const result = await pullAllDataFromCloud();

  return {
    ok: result.ok,
    plans: result.plans,
  };
};
