import { Cloud, Link2, RefreshCw, Send, Unplug } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  clearSyncCredentials,
  createSyncSpace,
  getSyncCredentials,
  pullPlansFromCloud,
  pushPlansToCloud,
  saveSyncCredentials,
  type SyncCredentials,
} from "../lib/cloudSync";
import type { TripPlan } from "../types";
import { formatDateTime } from "../utils/format";

type CloudSyncPanelProps = {
  plans: TripPlan[];
  onPullPlans: (cloudPlans: TripPlan[]) => {
    added: number;
    updated: number;
    keptLocal: number;
    total: number;
  };
};

export const CloudSyncPanel = ({ plans, onPullPlans }: CloudSyncPanelProps) => {
  const [credentials, setCredentials] = useState<SyncCredentials | null>(null);
  const [syncSpaceId, setSyncSpaceId] = useState("");
  const [syncToken, setSyncToken] = useState("");
  const [oneTimeToken, setOneTimeToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const stored = getSyncCredentials();
    setCredentials(stored);
    setSyncSpaceId(stored?.syncSpaceId ?? "");
    setSyncToken("");
  }, []);

  const runAction = async (action: () => Promise<void>) => {
    setIsBusy(true);
    setError("");
    setMessage("");

    try {
      await action();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "云端同步操作失败。");
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateSpace = () =>
    runAction(async () => {
      const created = await createSyncSpace();
      setCredentials(created);
      setSyncSpaceId(created.syncSpaceId);
      setSyncToken("");
      setOneTimeToken(created.syncToken);
      setMessage("同步空间已创建。Sync Token 只显示一次，请立即保存。");
    });

  const handleConnect = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = {
      syncSpaceId: syncSpaceId.trim(),
      syncToken: syncToken.trim(),
      lastSyncedAt: credentials?.lastSyncedAt,
    };

    if (!next.syncSpaceId || !next.syncToken) {
      setError("请填写 Sync Space ID 和 Sync Token。");
      return;
    }

    saveSyncCredentials(next);
    setCredentials(next);
    setOneTimeToken("");
    setSyncToken("");
    setError("");
    setMessage("已保存同步凭据。可以点击“从云端拉取”测试是否有效。");
  };

  const handlePush = () =>
    runAction(async () => {
      const result = await pushPlansToCloud(plans);
      const stored = getSyncCredentials();
      setCredentials(stored);
      setMessage(`上传完成，已同步 ${result.synced} 条计划。`);
    });

  const handlePull = () =>
    runAction(async () => {
      const result = await pullPlansFromCloud();
      const merge = onPullPlans(result.plans);
      const stored = getSyncCredentials();
      setCredentials(stored);
      setMessage(
        `拉取完成：新增 ${merge.added} 条，更新 ${merge.updated} 条，保留本地 ${merge.keptLocal} 条。当前共 ${merge.total} 条计划。`,
      );
    });

  const handleDisconnect = () => {
    const confirmed = window.confirm(
      "确定断开云端同步吗？这只会清除本机保存的 Sync Space ID 和 Sync Token，不会删除云端数据。",
    );

    if (!confirmed) {
      return;
    }

    clearSyncCredentials();
    setCredentials(null);
    setSyncSpaceId("");
    setSyncToken("");
    setOneTimeToken("");
    setMessage("已断开同步。云端数据不会被删除。");
    setError("");
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-flight">
            <Cloud size={16} />
            Cloud Sync
          </p>
          <h2 className="mt-2 text-xl font-semibold">Cloudflare D1 云端同步</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            云端同步是手动操作：本地 localStorage 仍是主存储。你可以创建匿名 Sync Space，然后手动上传或拉取计划。
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {credentials ? (
            <>
              <p className="font-semibold text-ink">已连接 Sync Space</p>
              <p className="mt-1 break-all">ID: {credentials.syncSpaceId}</p>
              <p className="mt-1">
                上次同步：
                {credentials.lastSyncedAt
                  ? formatDateTime(credentials.lastSyncedAt)
                  : "尚未同步"}
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-ink">未启用云端同步</p>
              <p className="mt-1">创建或连接 Sync Space 后即可手动同步。</p>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold">创建同步空间</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            系统会生成 Sync Space ID 和 Sync Token。Token 只返回一次，丢失后无法恢复该同步空间。
          </p>
          <button
            type="button"
            disabled={isBusy}
            onClick={handleCreateSpace}
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Cloud size={16} />
            创建同步空间
          </button>

          {oneTimeToken ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">请立即保存 Sync Token</p>
              <p className="mt-2 break-all">Sync Space ID: {syncSpaceId}</p>
              <p className="mt-1 break-all">Sync Token: {oneTimeToken}</p>
            </div>
          ) : null}
        </div>

        <form onSubmit={handleConnect} className="rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold">连接已有同步空间</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Sync Space ID
              </span>
              <input
                value={syncSpaceId}
                onChange={(event) => setSyncSpaceId(event.target.value)}
                placeholder="space_xxxxxxxx"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Sync Token
              </span>
              <input
                value={syncToken}
                onChange={(event) => setSyncToken(event.target.value)}
                placeholder="token_xxxxxxxxxxxxxxxxxxxx"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-flight/40 hover:text-flight"
          >
            <Link2 size={16} />
            保存连接
          </button>
        </form>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!credentials || isBusy}
          onClick={handlePush}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-flight px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={16} />
          上传本地数据到云端
        </button>
        <button
          type="button"
          disabled={!credentials || isBusy}
          onClick={handlePull}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-flight/40 hover:text-flight disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} />
          从云端拉取
        </button>
        <button
          type="button"
          disabled={!credentials || isBusy}
          onClick={handleDisconnect}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Unplug size={16} />
          断开同步
        </button>
      </div>

      {message ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </section>
  );
};
