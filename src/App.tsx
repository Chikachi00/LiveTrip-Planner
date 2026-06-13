import { lazy, Suspense, useMemo, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useToast } from "./components/ToastProvider";
import type { TripPlan, TripPlanInput } from "./types";
import {
  appendMissingSamplePlans,
  importPlansFromJson,
} from "./utils/dataManagement";
import {
  getStoredCustomVenues,
  removeCustomVenue,
  saveCustomVenues,
  updateCustomVenue,
  type VenueInput,
} from "./lib/customVenues";
import type { Venue } from "./data/venues";
import {
  getUserPreferences,
  hasStoredUserPreferences,
  clearUserPreferences,
  saveImportedUserPreferences,
  saveUserPreferences,
  type UserPreferences,
} from "./lib/userPreferences";
import {
  getStoredPlans,
  removePlan,
  savePlans,
  updatePlan,
  upsertPlan,
} from "./utils/storage";
import {
  mergePlansByUpdatedAt,
  mergePreferencesByUpdatedAt,
  mergeVenuesByUpdatedAt,
} from "./utils/merge";

const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const NewPlan = lazy(() =>
  import("./pages/NewPlan").then((module) => ({ default: module.NewPlan })),
);
const EditPlan = lazy(() =>
  import("./pages/EditPlan").then((module) => ({ default: module.EditPlan })),
);
const PlanDetail = lazy(() =>
  import("./pages/PlanDetail").then((module) => ({ default: module.PlanDetail })),
);
const Compare = lazy(() =>
  import("./pages/Compare").then((module) => ({ default: module.Compare })),
);
const Venues = lazy(() =>
  import("./pages/Venues").then((module) => ({ default: module.Venues })),
);
const Settings = lazy(() =>
  import("./pages/Settings").then((module) => ({ default: module.Settings })),
);

const PageFallback = () => (
  <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-soft">
    正在加载页面...
  </div>
);

export const App = () => {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<TripPlan[]>(() => getStoredPlans());
  const [customVenues, setCustomVenues] = useState<Venue[]>(() =>
    getStoredCustomVenues(),
  );
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() =>
    getUserPreferences(),
  );

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => a.date.localeCompare(b.date)),
    [plans],
  );

  const handleCreate = (plan: TripPlan) => {
    const next = upsertPlan(plan);
    setPlans(next);
    showToast("计划已保存。", "success");
  };

  const handleDelete = (id: string) => {
    const next = removePlan(id);
    setPlans(next);
    showToast("计划已删除。", "success");
  };

  const handleUpdate = (id: string, value: TripPlanInput) => {
    const next = updatePlan(id, value);
    setPlans(next);
    showToast("计划已更新。", "success");
  };

  const handleImportJson = (raw: string) => {
    const result = importPlansFromJson(raw, plans, customVenues);
    savePlans(result.plans);
    saveCustomVenues(result.customVenues);
    setPlans(result.plans);
    setCustomVenues(result.customVenues);

    let importedUserPreferences = false;

    if (result.userPreferences) {
      const shouldUseImported =
        !hasStoredUserPreferences() ||
        window.confirm(
          "JSON 备份中包含用户偏好。是否使用导入文件中的偏好覆盖当前本地偏好？",
        );

      if (shouldUseImported) {
        const nextPreferences = saveImportedUserPreferences(result.userPreferences);
        setUserPreferences(nextPreferences);
        importedUserPreferences = true;
      }
    }

    showToast("JSON 导入完成。", "success");

    return {
      importedPlans: result.importedCount,
      importedCustomVenues: result.importedCustomVenueCount,
      importedUserPreferences,
    };
  };

  const handleLoadSamples = () => {
    const result = appendMissingSamplePlans(plans);
    savePlans(result.plans);
    setPlans(result.plans);
    showToast(
      result.importedCount > 0
        ? `已加载 ${result.importedCount} 条示例数据。`
        : "示例数据已存在。",
      "success",
    );
    return result.importedCount;
  };

  const handleClearAll = () => {
    savePlans([]);
    saveCustomVenues([]);
    const resetPreferences = clearUserPreferences();
    setPlans([]);
    setCustomVenues([]);
    setUserPreferences(resetPreferences);
    showToast("本地数据已清空。", "success");
  };

  const handleCreateCustomVenue = (venue: Venue) => {
    const next = [venue, ...customVenues.filter((item) => item.id !== venue.id)];
    saveCustomVenues(next);
    setCustomVenues(next);
    showToast("自定义场馆已保存。", "success");
  };

  const handleUpdateCustomVenue = (id: string, value: VenueInput) => {
    const next = updateCustomVenue(customVenues, id, value);
    saveCustomVenues(next);
    setCustomVenues(next);
    showToast("自定义场馆已更新。", "success");
  };

  const handleDeleteCustomVenue = (id: string) => {
    const next = removeCustomVenue(customVenues, id);
    saveCustomVenues(next);
    setCustomVenues(next);
    showToast("自定义场馆已删除。", "success");
  };

  const handleSaveUserPreferences = (preferences: UserPreferences) => {
    const next = saveUserPreferences(preferences);
    setUserPreferences(next);
    showToast("用户偏好已保存。", "success");
  };

  const handleResetUserPreferences = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
  };

  const handlePullCloudPlans = (cloudPlans: TripPlan[]) => {
    const result = mergePlansByUpdatedAt(plans, cloudPlans);
    savePlans(result.items);
    setPlans(result.items);

    return {
      added: result.added,
      updated: result.updated,
      keptLocal: result.keptLocal,
      total: result.total,
    };
  };

  const handlePullCloudData = ({
    cloudPlans,
    cloudCustomVenues,
    cloudPreferences,
  }: {
    cloudPlans: TripPlan[];
    cloudCustomVenues: Venue[];
    cloudPreferences: UserPreferences | null;
  }) => {
    const planMerge = handlePullCloudPlans(cloudPlans);
    const venueMerge = mergeVenuesByUpdatedAt(customVenues, cloudCustomVenues);
    saveCustomVenues(venueMerge.items);
    setCustomVenues(venueMerge.items);

    const preferencesMerge = mergePreferencesByUpdatedAt({
      hasLocalPreferences: hasStoredUserPreferences(),
      localPreferences: userPreferences,
      cloudPreferences,
    });

    if (preferencesMerge.status === "imported" || preferencesMerge.status === "updated") {
      const next = saveImportedUserPreferences(preferencesMerge.item);
      setUserPreferences(next);
    }

    return {
      plans: planMerge,
      customVenues: {
        added: venueMerge.added,
        updated: venueMerge.updated,
        keptLocal: venueMerge.keptLocal,
        total: venueMerge.total,
      },
      preferencesStatus: preferencesMerge.status,
    };
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route
              index
              element={
                <Dashboard
                  plans={sortedPlans}
                  customVenues={customVenues}
                  onLoadSamples={handleLoadSamples}
                />
              }
            />
            <Route
              path="/new"
              element={
                <NewPlan
                  customVenues={customVenues}
                  userPreferences={userPreferences}
                  onCreateCustomVenue={handleCreateCustomVenue}
                  onCreate={handleCreate}
                />
              }
            />
            <Route
              path="/plans/:id"
              element={
                <PlanDetail
                  plans={plans}
                  customVenues={customVenues}
                  userPreferences={userPreferences}
                  onDelete={handleDelete}
                />
              }
            />
            <Route
              path="/plans/:id/edit"
              element={
                <EditPlan
                  plans={plans}
                  customVenues={customVenues}
                  onCreateCustomVenue={handleCreateCustomVenue}
                  onUpdate={handleUpdate}
                />
              }
            />
            <Route
              path="/compare"
              element={
                <Compare
                  plans={sortedPlans}
                  customVenues={customVenues}
                  userPreferences={userPreferences}
                />
              }
            />
            <Route
              path="/venues"
              element={
                <Venues
                  customVenues={customVenues}
                  onCreate={handleCreateCustomVenue}
                  onUpdate={handleUpdateCustomVenue}
                  onDelete={handleDeleteCustomVenue}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <Settings
                  plans={plans}
                  customVenues={customVenues}
                  userPreferences={userPreferences}
                  onSaveUserPreferences={handleSaveUserPreferences}
                  onResetUserPreferences={handleResetUserPreferences}
                  onImportJson={handleImportJson}
                  onLoadSamples={handleLoadSamples}
                  onClearAll={handleClearAll}
                  onPullCloudData={handlePullCloudData}
                />
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
