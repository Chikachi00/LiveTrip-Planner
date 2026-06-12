import { Settings as SettingsIcon } from "lucide-react";
import { CloudSyncPanel } from "../components/CloudSyncPanel";
import { DataManager } from "../components/DataManager";
import { UserPreferencesPanel } from "../components/UserPreferencesPanel";
import type { Venue } from "../data/venues";
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
