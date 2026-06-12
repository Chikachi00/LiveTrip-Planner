import { SlidersHorizontal } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  defaultUserPreferences,
  resetUserPreferences,
  type PreferredCurrency,
  type PreferredMapProvider,
  type PreferenceScore,
  type UserPreferences,
} from "../lib/userPreferences";

type UserPreferencesPanelProps = {
  preferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
  onReset: (preferences: UserPreferences) => void;
};

const currencies: PreferredCurrency[] = ["JPY", "CNY", "USD", "MYR"];
const mapProviders: Array<[PreferredMapProvider, string]> = [
  ["google", "Google Maps"],
  ["apple", "Apple Maps"],
  ["baidu", "百度地图"],
  ["amap", "高德地图"],
];
const scoreOptions: PreferenceScore[] = [1, 2, 3, 4, 5];

export const UserPreferencesPanel = ({
  preferences,
  onSave,
  onReset,
}: UserPreferencesPanelProps) => {
  const [draft, setDraft] = useState<UserPreferences>(preferences);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  const update = <Key extends keyof UserPreferences>(
    key: Key,
    value: UserPreferences[Key],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(draft);
    setMessage("用户偏好已保存。新建计划会自动应用默认出发城市和预算。");
  };

  const handleReset = () => {
    const confirmed = window.confirm("确定重置用户偏好吗？");

    if (!confirmed) {
      return;
    }

    const next = resetUserPreferences();
    setDraft(next);
    onReset(next);
    setMessage("用户偏好已重置为默认值。");
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-flight">
            <SlidersHorizontal size={16} />
            User Preferences
          </p>
          <h2 className="mt-2 text-xl font-semibold">用户偏好设置</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            这些偏好保存在 localStorage，并会参与新建计划默认值、地图按钮排序和智能建议判断。
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:border-flight/40 hover:text-flight"
        >
          重置偏好
        </button>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            出发城市 / 常驻城市
          </span>
          <input
            value={draft.homeCity ?? ""}
            onChange={(event) => update("homeCity", event.target.value)}
            placeholder="例如：上海"
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            默认货币
          </span>
          <select
            value={draft.preferredCurrency}
            onChange={(event) =>
              update("preferredCurrency", event.target.value as PreferredCurrency)
            }
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>

        {[
          ["defaultFoodBudget", "默认餐饮预算"],
          ["defaultLocalTransportBudget", "默认本地交通预算"],
          ["defaultMerchBudget", "默认周边预算"],
        ].map(([key, label]) => (
          <label key={key} className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {label}
            </span>
            <input
              type="number"
              min="0"
              value={Number(draft[key as keyof UserPreferences] ?? 0)}
              onChange={(event) =>
                update(
                  key as keyof UserPreferences,
                  Number(event.target.value) as never,
                )
              }
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
            />
          </label>
        ))}

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            默认地图服务
          </span>
          <select
            value={draft.preferredMapProvider}
            onChange={(event) =>
              update("preferredMapProvider", event.target.value as PreferredMapProvider)
            }
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
          >
            {mapProviders.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {[
          ["hotelQuietPreference", "酒店安静偏好"],
          ["fatigueSensitivity", "疲劳敏感度"],
          ["budgetSensitivity", "预算敏感度"],
        ].map(([key, label]) => (
          <label key={key} className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {label}
            </span>
            <select
              value={Number(draft[key as keyof UserPreferences])}
              onChange={(event) =>
                update(
                  key as keyof UserPreferences,
                  Number(event.target.value) as PreferenceScore as never,
                )
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
            >
              {scoreOptions.map((score) => (
                <option key={score} value={score}>
                  {score} / 5
                </option>
              ))}
            </select>
          </label>
        ))}

        <div className="grid gap-3 md:col-span-2 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={draft.preferStayNearVenue}
              onChange={(event) => update("preferStayNearVenue", event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-flight"
            />
            优先住场馆附近
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={draft.avoidLateNightReturn}
              onChange={(event) => update("avoidLateNightReturn", event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-flight"
            />
            尽量避免深夜返程
          </label>
        </div>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">备注</span>
          <textarea
            value={draft.notes ?? ""}
            onChange={(event) => update("notes", event.target.value)}
            rows={3}
            placeholder={defaultUserPreferences.notes}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            保存用户偏好
          </button>
        </div>
      </form>

      {message ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
    </section>
  );
};
