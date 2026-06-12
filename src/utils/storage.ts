import { samplePlans } from "../data/samplePlans";
import type { TripPlan, TripPlanInput } from "../types";

const STORAGE_KEY = "livetrip-planner:plans";

const canUseLocalStorage = () => typeof window !== "undefined" && window.localStorage;

export const getStoredPlans = (): TripPlan[] => {
  if (!canUseLocalStorage()) {
    return samplePlans;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(samplePlans));
    return samplePlans;
  }

  try {
    const parsed = JSON.parse(raw) as TripPlan[];
    return Array.isArray(parsed) ? parsed : samplePlans;
  } catch {
    return samplePlans;
  }
};

export const savePlans = (plans: TripPlan[]) => {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
};

export const createPlan = (input: TripPlanInput): TripPlan => {
  const now = new Date().toISOString();

  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
};

export const upsertPlan = (plan: TripPlan) => {
  const plans = getStoredPlans();
  const next = [plan, ...plans.filter((item) => item.id !== plan.id)];
  savePlans(next);
  return next;
};

export const removePlan = (id: string) => {
  const next = getStoredPlans().filter((plan) => plan.id !== id);
  savePlans(next);
  return next;
};
