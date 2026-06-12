import { Database, Download, FileUp, RotateCcw, Trash2 } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import type { Venue } from "../data/venues";
import type { TripPlan } from "../types";
import { createBackupJson, downloadJson } from "../utils/dataManagement";

type ImportResult = {
  importedPlans: number;
  importedCustomVenues: number;
};

type DataManagerProps = {
  plans: TripPlan[];
  customVenues: Venue[];
  onImportJson: (raw: string) => ImportResult;
  onLoadSamples: () => number;
  onClearAll: () => void;
};

export const DataManager = ({
  plans,
  customVenues,
  onImportJson,
  onLoadSamples,
  onClearAll,
}: DataManagerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  const exportJson = () => {
    downloadJson(
      createBackupJson(plans, customVenues),
      "live-trip-planner-backup.json",
    );
    setMessage("已导出 JSON 备份，包含计划和自定义场馆。");
  };

  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const result = onImportJson(raw);
      const total = result.importedPlans + result.importedCustomVenues;
      setMessage(
        total > 0
          ? `导入完成：计划 ${result.importedPlans} 条，自定义场馆 ${result.importedCustomVenues} 个。`
          : "没有导入数据，请检查 JSON 结构或重复 id。",
      );
    } catch {
      setMessage("导入失败：文件不是有效的 JSON 备份。");
    }
  };

  const loadSamples = () => {
    const count = onLoadSamples();
    setMessage(
      count > 0 ? `已追加 ${count} 条示例数据。` : "示例数据已存在，没有重复追加。",
    );
  };

  const clearAll = () => {
    const confirmed = window.confirm(
      "确定清空所有本地数据吗？这会清除本机 localStorage 中的计划和自定义场馆，但不会删除云端数据。",
    );

    if (!confirmed) {
      return;
    }

    onClearAll();
    setMessage("已清空所有本地计划和自定义场馆。");
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-flight">
            <Database size={16} />
            Data / Settings
          </p>
          <h2 className="mt-2 text-xl font-semibold">备份、导入和示例数据</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            数据仍优先保存在浏览器 localStorage。JSON 备份会包含演出计划和自定义场馆；内置场馆无需导出。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportJson}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-flight/40 hover:text-flight"
          >
            <Download size={16} />
            导出 JSON
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-flight/40 hover:text-flight"
          >
            <FileUp size={16} />
            导入 JSON
          </button>
          <button
            type="button"
            onClick={loadSamples}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-mist px-4 text-sm font-semibold text-moss transition hover:bg-emerald-100"
          >
            <RotateCcw size={16} />
            加载示例数据
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            <Trash2 size={16} />
            清空所有数据
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={importJson}
          />
        </div>
      </div>

      {message ? (
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {message}
        </p>
      ) : null}
    </section>
  );
};
