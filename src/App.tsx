import { useMemo, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Compare } from "./pages/Compare";
import { Dashboard } from "./pages/Dashboard";
import { NewPlan } from "./pages/NewPlan";
import { PlanDetail } from "./pages/PlanDetail";
import type { TripPlan } from "./types";
import { getStoredPlans, removePlan, savePlans, upsertPlan } from "./utils/storage";

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
    savePlans(next);
    setPlans(next);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard plans={sortedPlans} />} />
          <Route path="/new" element={<NewPlan onCreate={handleCreate} />} />
          <Route
            path="/plans/:id"
            element={<PlanDetail plans={plans} onDelete={handleDelete} />}
          />
          <Route path="/compare" element={<Compare plans={sortedPlans} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
