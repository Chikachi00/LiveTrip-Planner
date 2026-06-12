import { useMemo, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Compare } from "./pages/Compare";
import { Dashboard } from "./pages/Dashboard";
import { EditPlan } from "./pages/EditPlan";
import { NewPlan } from "./pages/NewPlan";
import { PlanDetail } from "./pages/PlanDetail";
import type { TripPlan, TripPlanInput } from "./types";
import {
  appendMissingSamplePlans,
  importPlansFromJson,
} from "./utils/dataManagement";
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
    const result = importPlansFromJson(raw, plans);
    savePlans(result.plans);
    setPlans(result.plans);
    return result.importedCount;
  };

  const handleLoadSamples = () => {
    const result = appendMissingSamplePlans(plans);
    savePlans(result.plans);
    setPlans(result.plans);
    return result.importedCount;
  };

  const handleClearAll = () => {
    savePlans([]);
    setPlans([]);
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
                onImportJson={handleImportJson}
                onLoadSamples={handleLoadSamples}
                onClearAll={handleClearAll}
                onPullCloudPlans={handlePullCloudPlans}
              />
            }
          />
          <Route path="/new" element={<NewPlan onCreate={handleCreate} />} />
          <Route
            path="/plans/:id"
            element={<PlanDetail plans={plans} onDelete={handleDelete} />}
          />
          <Route
            path="/plans/:id/edit"
            element={<EditPlan plans={plans} onUpdate={handleUpdate} />}
          />
          <Route path="/compare" element={<Compare plans={sortedPlans} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
