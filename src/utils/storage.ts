import { samplePlans } from "../data/samplePlans";
import type { TripPlan, TripPlanInput } from "../types";

const STORAGE_KEY = "livetrip-planner:plans";

const canUseLocalStorage = () => typeof window !== "undefined" && window.localStorage;

export const normalizePlan = (plan: TripPlan): TripPlan => {
  return {
    ...plan,
    venueId: plan.venueId ?? "",
    seatType: plan.seatType ?? "",
    departureCity: plan.departureCity ?? "",
    transportMode: plan.transportMode ?? "",
    oneWayDuration: plan.oneWayDuration ?? "",
    hotelArea: plan.hotelArea ?? "",
    hotelNightlyPrice: plan.hotelNightlyPrice ?? plan.hotelCost,
    hotelNights: plan.hotelNights ?? (plan.hotelCost > 0 ? 1 : 0),
    venueCommuteTime: plan.venueCommuteTime ?? "",
    serviceFee: plan.serviceFee ?? 0,
    localTransitCost: plan.localTransitCost ?? 0,
    hotelQuietness: plan.hotelQuietness ?? 7,
    regretRisk: plan.regretRisk ?? 4,
  };
};

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
    return Array.isArray(parsed) ? parsed.map(normalizePlan) : samplePlans;
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
    venueId: input.venueId ?? "",
    serviceFee: input.serviceFee ?? 0,
    localTransitCost: input.localTransitCost ?? 0,
    hotelQuietness: input.hotelQuietness ?? 7,
    regretRisk: input.regretRisk ?? 4,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
};

export const updatePlan = (id: string, input: TripPlanInput) => {
  const plans = getStoredPlans();
  const now = new Date().toISOString();
  const next = plans.map((plan) =>
    plan.id === id
      ? normalizePlan({
          ...plan,
          ...input,
          id,
          createdAt: plan.createdAt,
          updatedAt: now,
        })
      : plan,
  );

  savePlans(next);
  return next;
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
