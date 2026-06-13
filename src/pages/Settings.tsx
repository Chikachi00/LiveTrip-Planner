import { Settings as SettingsIcon } from "lucide-react";
import { CloudSyncPanel } from "../components/CloudSyncPanel";
import { DataManager } from "../components/DataManager";
import { useToast } from "../components/ToastProvider";
import { UserPreferencesPanel } from "../components/UserPreferencesPanel";
import type { Venue } from "../data/venues";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { resetOnboarding } from "../lib/onboarding";
import type { UserPreferences } from "../lib/userPreferences";
import type { TripPlan } from "../types";

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

type SettingsProps = {
  plans: TripPlan[];
  customVenues: Venue[];
  userPreferences: UserPreferences;
  onSaveUserPreferences: (preferences: UserPreferences) => void;
  onResetUserPreferences: (preferences: UserPreferences) => void;
  onImportJson: (raw: string) => {
    importedPlans: number;
    importedCustomVenues: number;
    importedUserPreferences: boolean;
  };
  onLoadSamples: () => number;
  onClearAll: () => void;
  onPullCloudData: (data: {
    cloudPlans: TripPlan[];
    cloudCustomVenues: Venue[];
    cloudPreferences: UserPreferences | null;
  }) => CloudPullMergeResult;
};

export const Settings = ({
  plans,
  customVenues,
  userPreferences,
  onSaveUserPreferences,
  onResetUserPreferences,
  onImportJson,
  onLoadSamples,
  onClearAll,
  onPullCloudData,
}: SettingsProps) => {
  useDocumentTitle("Settings");
  const { showToast } = useToast();

  const showOnboardingAgain = () => {
    resetOnboarding();
    showToast("首次使用引导已恢复，返回 Dashboard 即可查看。", "success");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-flight">
          <SettingsIcon size={16} />
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">数据与设置</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          管理 Cloudflare D1 手动同步、用户偏好、JSON 备份和示例数据。本地 localStorage 仍然是主存储。
        </p>
        <button
          type="button"
          onClick={showOnboardingAgain}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-flight/40 hover:text-flight"
        >
          重新查看使用引导
        </button>
      </div>

      <CloudSyncPanel
        plans={plans}
        customVenues={customVenues}
        userPreferences={userPreferences}
        onPullCloudData={onPullCloudData}
      />

      <UserPreferencesPanel
        preferences={userPreferences}
        onSave={onSaveUserPreferences}
        onReset={onResetUserPreferences}
      />

      <DataManager
        plans={plans}
        customVenues={customVenues}
        userPreferences={userPreferences}
        onImportJson={onImportJson}
        onLoadSamples={onLoadSamples}
        onClearAll={onClearAll}
      />
    </div>
  );
};
