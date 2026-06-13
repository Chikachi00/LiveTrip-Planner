import { Cloud, Copy, Link2, RefreshCw, Send, Unplug } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { Venue } from "../data/venues";
import {
  clearSyncCredentials,
  createSyncSpace,
  getSyncCredentials,
  pullAllDataFromCloud,
  pushAllDataToCloud,
  saveSyncCredentials,
  type SyncCredentials,
} from "../lib/cloudSync";
import type { UserPreferences } from "../lib/userPreferences";
import type { TripPlan } from "../types";
import { formatDateTime } from "../utils/format";
import { useToast } from "./ToastProvider";

type CloudPullMergeResult = {
  plans: {
    added: number;
    updated: number;
    keptLocal: number;
    total: number;
  };
  customVenues: {
    added: number;
    updated: number;
    keptLocal: number;
    total: number;
  };
  preferencesStatus: "none" | "imported" | "updated" | "keptLocal";
};

type CloudSyncPanelProps = {
  plans: TripPlan[];
  customVenues: Venue[];
  userPreferences: UserPreferences;
  onPullCloudData: (data: {
    cloudPlans: TripPlan[];
    cloudCustomVenues: Venue[];
    cloudPreferences: UserPreferences | null;
  }) => CloudPullMergeResult;
};

const preferenceStatusText: Record<CloudPullMergeResult["preferencesStatus"], string> = {
  none: "云端没有用户偏好",
  imported: "已导入云端偏好",
  updated: "已使用较新的云端偏好",
  keptLocal: "已保留本地偏好",
};

export const CloudSyncPanel = ({
  plans,
  customVenues,
  userPreferences,
  onPullCloudData,
}: CloudSyncPanelProps) => {
  const [credentials, setCredentials] = useState<SyncCredentials | null>(null);
  const [syncSpaceId, setSyncSpaceId] = useState("");
  const [syncToken, setSyncToken] = useState("");
  const [oneTimeToken, setOneTimeToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    const stored = getSyncCredentials();
    setCredentials(stored);
    setSyncSpaceId(stored?.syncSpaceId ?? "");
    setSyncToken("");
  }, []);

  const runAction = async (label: string, action: () => Promise<void>) => {
    setIsBusy(true);
    setCurrentAction(label);
    setError("");
    setMessage("");

    try {
      await action();
    } catch (caught) {
      const text = caught instanceof Error ? caught.message : "云端同步操作失败。";
      setError(text);
      showToast(text, "error");
    } finally {
      setIsBusy(false);
      setCurrentAction("");
    }
  };

  const refreshCredentials = () => {
    const stored = getSyncCredentials();
    setCredentials(stored);
    return stored;
  };

  const handleCreateSpace = () =>
    runAction("正在创建同步空间", async () => {
      const created = await createSyncSpace();
      setCredentials(created);
      setSyncSpaceId(created.syncSpaceId);
      setSyncToken("");
      setOneTimeToken(created.syncToken);
      setMessage("同步空间已创建。Sync Token 只显示一次，请立即保存。");
      showToast("Sync Space 创建成功。", "success");
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
    runAction("正在上传云端", async () => {
      const result = await pushAllDataToCloud({
        plans,
        customVenues,
        preferences: userPreferences,
      });
      refreshCredentials();
      const warning = result.warnings?.length ? ` ${result.warnings.join(" ")}` : "";
      setMessage(
        `上传完成：计划 ${result.synced.plans} 条，自定义场馆 ${result.synced.customVenues} 个，用户偏好 ${result.synced.preferences} 份。${warning}`,
      );
      showToast("云端上传完成。", "success");
    });

  const handlePull = () =>
    runAction("正在从云端拉取", async () => {
      const result = await pullAllDataFromCloud();
      const merge = onPullCloudData({
        cloudPlans: result.plans,
        cloudCustomVenues: result.customVenues,
        cloudPreferences: result.preferences,
      });
      refreshCredentials();
      const warning = result.warnings?.length ? ` ${result.warnings.join(" ")}` : "";
      setMessage(
        `拉取完成：计划新增 ${merge.plans.added} 条、更新 ${merge.plans.updated} 条、保留本地 ${merge.plans.keptLocal} 条；自定义场馆新增 ${merge.customVenues.added} 个、更新 ${merge.customVenues.updated} 个、保留本地 ${merge.customVenues.keptLocal} 个；${preferenceStatusText[merge.preferencesStatus]}。${warning}`,
      );
      showToast("云端拉取完成。", "success");
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
    showToast("已断开云端同步。", "info");
  };

  const copyOneTimeToken = async () => {
    if (!oneTimeToken) {
      return;
    }

    await navigator.clipboard.writeText(
      `Sync Space ID: ${syncSpaceId}\nSync Token: ${oneTimeToken}`,
    );
    showToast("Sync Token 已复制，请保存到私密位置。", "success");
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
            云端同步仍然是手动操作：localStorage 是主存储。v0.8 会同步计划、自定义场馆和用户偏好。
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
            data-testid="create-sync-space-button"
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
              <button
                type="button"
                onClick={copyOneTimeToken}
                className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                <Copy size={14} />
                Copy Token
              </button>
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
                data-testid="sync-space-id-input"
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
                data-testid="sync-token-input"
                placeholder="token_xxxxxxxxxxxxxxxxxxxx"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>
          <button
            type="submit"
            data-testid="sync-connect-button"
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-flight/40 hover:text-flight"
          >
            <Link2 size={16} />
            保存连接
          </button>
        </form>
      </div>

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <p className="font-semibold">隐私与安全提示</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Sync Token 相当于访问凭据，请勿公开。</li>
          <li>Token 保存在当前浏览器中，清除浏览器数据前请先保存。</li>
          <li>云端同步为手动触发，不会自动上传你的本地数据。</li>
        </ul>
        <p className="mt-2">
          详细说明见 GitHub 上的{" "}
          <a
            href="https://github.com/Chikachi00/LiveTrip-Planner/blob/main/PRIVACY.md"
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline"
          >
            PRIVACY.md
          </a>{" "}
          和{" "}
          <a
            href="https://github.com/Chikachi00/LiveTrip-Planner/blob/main/SECURITY.md"
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline"
          >
            SECURITY.md
          </a>{" "}
          （新标签页打开）。
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!credentials || isBusy}
          onClick={handlePush}
          data-testid="sync-push-button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-flight px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={16} />
          上传本地数据到云端
        </button>
        <button
          type="button"
          disabled={!credentials || isBusy}
          onClick={handlePull}
          data-testid="sync-pull-button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-flight/40 hover:text-flight disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} />
          从云端拉取
        </button>
        <button
          type="button"
          disabled={!credentials || isBusy}
          onClick={handleDisconnect}
          data-testid="sync-disconnect-button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Unplug size={16} />
          断开同步
        </button>
      </div>

      {isBusy && currentAction ? (
        <p className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {currentAction}...
        </p>
      ) : null}

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
