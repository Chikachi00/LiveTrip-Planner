import type { TripPlan } from "../types";

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

type PushResponse = {
  ok: boolean;
  synced: number;
};

type PullResponse = {
  ok: boolean;
  plans: TripPlan[];
};

const getErrorMessage = async (response: Response) => {
  if (response.status === 401) {
    return "Sync Space ID 或 Sync Token 不正确。";
  }

  try {
    const body = (await response.json()) as { error?: string };
    return body.error || `请求失败：${response.status}`;
  } catch {
    return `请求失败：${response.status}`;
  }
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

export const pushPlansToCloud = async (plans: TripPlan[]) => {
  const credentials = getRequiredCredentials();
  const result = await requestJson<PushResponse>("/api/sync/push", {
    method: "POST",
    headers: authHeaders(credentials),
    body: JSON.stringify({ plans }),
  });

  saveSyncCredentials({
    ...credentials,
    lastSyncedAt: new Date().toISOString(),
  });
  return result;
};

export const pullPlansFromCloud = async () => {
  const credentials = getRequiredCredentials();
  const result = await requestJson<PullResponse>("/api/sync/pull", {
    method: "GET",
    headers: authHeaders(credentials),
  });

  saveSyncCredentials({
    ...credentials,
    lastSyncedAt: new Date().toISOString(),
  });
  return result;
};
