import { Settings as SettingsIcon } from "lucide-react";
import { CloudSyncPanel } from "../components/CloudSyncPanel";
import { DataManager } from "../components/DataManager";
import type { Venue } from "../data/venues";
import type { TripPlan } from "../types";

type SettingsProps = {
  plans: TripPlan[];
  customVenues: Venue[];
  onImportJson: (raw: string) => {
    importedPlans: number;
    importedCustomVenues: number;
  };
  onLoadSamples: () => number;
  onClearAll: () => void;
  onPullCloudPlans: (cloudPlans: TripPlan[]) => {
    added: number;
    updated: number;
    keptLocal: number;
    total: number;
  };
};

export const Settings = ({
  plans,
  customVenues,
  onImportJson,
  onLoadSamples,
  onClearAll,
  onPullCloudPlans,
}: SettingsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-flight">
          <SettingsIcon size={16} />
          Data / Settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">数据与设置</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          管理本地备份、示例数据和 Cloudflare D1 手动同步。自定义场馆当前保存在 localStorage。
        </p>
      </div>

      <CloudSyncPanel plans={plans} onPullPlans={onPullCloudPlans} />

      <DataManager
        plans={plans}
        customVenues={customVenues}
        onImportJson={onImportJson}
        onLoadSamples={onLoadSamples}
        onClearAll={onClearAll}
      />
    </div>
  );
};
