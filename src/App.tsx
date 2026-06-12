import { useMemo, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Compare } from "./pages/Compare";
import { Dashboard } from "./pages/Dashboard";
import { EditPlan } from "./pages/EditPlan";
import { NewPlan } from "./pages/NewPlan";
import { PlanDetail } from "./pages/PlanDetail";
import { Settings } from "./pages/Settings";
import { Venues } from "./pages/Venues";
import type { TripPlan, TripPlanInput } from "./types";
import {
  appendMissingSamplePlans,
  importPlansFromJson,
} from "./utils/dataManagement";
import {
  getStoredCustomVenues,
  normalizeVenue,
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
  normalizeUserPreferences,
  saveImportedUserPreferences,
  saveUserPreferences,
  type UserPreferences,
} from "./lib/userPreferences";
import {
  getStoredPlans,
  normalizePlan,
  removePlan,
  savePlans,
  updatePlan,
  upsertPlan,
} from "./utils/storage";

const getUpdatedTime = (plan: TripPlan) => {
  const time = new Date(plan.updatedAt).getTime();
  return Number.isNaN(time) ? null : time;
};

const getEntityUpdatedTime = (value: { updatedAt?: string }) => {
  if (!value.updatedAt) {
    return null;
  }

  const time = new Date(value.updatedAt).getTime();
  return Number.isNaN(time) ? null : time;
};

export const App = () => {
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
  };

  const handleDelete = (id: string) => {
    const next = removePlan(id);
    setPlans(next);
  };

  const handleUpdate = (id: string, value: TripPlanInput) => {
    const next = updatePlan(id, value);
    setPlans(next);
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
    return result.importedCount;
  };

  const handleClearAll = () => {
    savePlans([]);
    saveCustomVenues([]);
    const resetPreferences = clearUserPreferences();
    setPlans([]);
    setCustomVenues([]);
    setUserPreferences(resetPreferences);
  };

  const handleCreateCustomVenue = (venue: Venue) => {
    const next = [venue, ...customVenues.filter((item) => item.id !== venue.id)];
    saveCustomVenues(next);
    setCustomVenues(next);
  };

  const handleUpdateCustomVenue = (id: string, value: VenueInput) => {
    const next = updateCustomVenue(customVenues, id, value);
    saveCustomVenues(next);
    setCustomVenues(next);
  };

  const handleDeleteCustomVenue = (id: string) => {
    const next = removeCustomVenue(customVenues, id);
    saveCustomVenues(next);
    setCustomVenues(next);
  };

  const handleSaveUserPreferences = (preferences: UserPreferences) => {
    const next = saveUserPreferences(preferences);
    setUserPreferences(next);
  };

  const handleResetUserPreferences = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
  };

  const handlePullCloudPlans = (cloudPlans: TripPlan[]) => {
    const byId = new Map(plans.map((plan) => [plan.id, normalizePlan(plan)]));
    let added = 0;
    let updated = 0;
    let keptLocal = 0;

    for (const rawCloudPlan of cloudPlans) {
      if (!rawCloudPlan.id) {
        continue;
      }

      const cloudPlan = normalizePlan(rawCloudPlan);
      const localPlan = byId.get(cloudPlan.id);

      if (!localPlan) {
        byId.set(cloudPlan.id, cloudPlan);
        added += 1;
        continue;
      }

      const cloudUpdatedAt = getUpdatedTime(cloudPlan);
      const localUpdatedAt = getUpdatedTime(localPlan);

      if (
        cloudUpdatedAt !== null &&
        localUpdatedAt !== null &&
        cloudUpdatedAt > localUpdatedAt
      ) {
        byId.set(cloudPlan.id, cloudPlan);
        updated += 1;
      } else {
        keptLocal += 1;
      }
    }

    const next = [...byId.values()].sort((a, b) => a.date.localeCompare(b.date));
    savePlans(next);
    setPlans(next);

    return {
      added,
      updated,
      keptLocal,
      total: next.length,
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
    const venuesById = new Map(
      customVenues.map((venue) => [venue.id, normalizeVenue(venue)]),
    );
    let addedCustomVenues = 0;
    let updatedCustomVenues = 0;
    let keptLocalCustomVenues = 0;

    for (const rawCloudVenue of cloudCustomVenues) {
      if (!rawCloudVenue.id) {
        continue;
      }

      const cloudVenue = normalizeVenue(rawCloudVenue);
      const localVenue = venuesById.get(cloudVenue.id);

      if (!localVenue) {
        venuesById.set(cloudVenue.id, cloudVenue);
        addedCustomVenues += 1;
        continue;
      }

      const cloudUpdatedAt = getEntityUpdatedTime(rawCloudVenue);
      const localUpdatedAt = getEntityUpdatedTime(localVenue);

      if (
        cloudUpdatedAt !== null &&
        localUpdatedAt !== null &&
        cloudUpdatedAt > localUpdatedAt
      ) {
        venuesById.set(cloudVenue.id, cloudVenue);
        updatedCustomVenues += 1;
      } else {
        keptLocalCustomVenues += 1;
      }
    }

    const nextCustomVenues = [...venuesById.values()];
    saveCustomVenues(nextCustomVenues);
    setCustomVenues(nextCustomVenues);

    let preferencesStatus: "none" | "imported" | "updated" | "keptLocal" = "none";

    if (cloudPreferences) {
      const cloudHasUpdatedAt = Boolean(cloudPreferences.updatedAt);
      const localUpdatedAt = getEntityUpdatedTime(userPreferences);
      const cloudUpdatedAt = getEntityUpdatedTime(cloudPreferences);

      if (!hasStoredUserPreferences()) {
        const next = saveImportedUserPreferences(
          normalizeUserPreferences(cloudPreferences),
        );
        setUserPreferences(next);
        preferencesStatus = "imported";
      } else if (
        cloudHasUpdatedAt &&
        cloudUpdatedAt !== null &&
        localUpdatedAt !== null &&
        cloudUpdatedAt > localUpdatedAt
      ) {
        const next = saveImportedUserPreferences(
          normalizeUserPreferences(cloudPreferences),
        );
        setUserPreferences(next);
        preferencesStatus = "updated";
      } else {
        preferencesStatus = "keptLocal";
      }
    }

    return {
      plans: planMerge,
      customVenues: {
        added: addedCustomVenues,
        updated: updatedCustomVenues,
        keptLocal: keptLocalCustomVenues,
        total: nextCustomVenues.length,
      },
      preferencesStatus,
    };
  };

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
};
