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
  removeCustomVenue,
  saveCustomVenues,
  updateCustomVenue,
  type VenueInput,
} from "./lib/customVenues";
import type { Venue } from "./data/venues";
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

export const App = () => {
  const [plans, setPlans] = useState<TripPlan[]>(() => getStoredPlans());
  const [customVenues, setCustomVenues] = useState<Venue[]>(() =>
    getStoredCustomVenues(),
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
    return {
      importedPlans: result.importedCount,
      importedCustomVenues: result.importedCustomVenueCount,
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
    setPlans([]);
    setCustomVenues([]);
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
                onImportJson={handleImportJson}
                onLoadSamples={handleLoadSamples}
                onClearAll={handleClearAll}
                onPullCloudPlans={handlePullCloudPlans}
              />
            }
          />
          <Route
            path="/new"
            element={
              <NewPlan
                customVenues={customVenues}
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
            element={<Compare plans={sortedPlans} customVenues={customVenues} />}
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
                onImportJson={handleImportJson}
                onLoadSamples={handleLoadSamples}
                onClearAll={handleClearAll}
                onPullCloudPlans={handlePullCloudPlans}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
