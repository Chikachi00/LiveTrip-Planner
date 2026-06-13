import type { TripPlan, TripPlanInput } from "../types";

const STORAGE_KEY = "livetrip-planner:plans";

const canUseLocalStorage = () => typeof window !== "undefined" && window.localStorage;

const toNumber = (value: unknown, fallback = 0) => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toScore = (value: unknown, fallback = 5) => {
  return Math.min(Math.max(Math.round(toNumber(value, fallback)), 1), 10);
};

const toString = (value: unknown, fallback = "") => {
  return typeof value === "string" ? value : fallback;
};

const toDate = (value: unknown) => {
  const text = toString(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? text
    : new Date().toISOString().slice(0, 10);
};

export const normalizePlan = (plan: Partial<TripPlan>): TripPlan => {
  const now = new Date().toISOString();
  const hotelCost = toNumber(plan.hotelCost);
  const hotelNightlyPrice = toNumber(plan.hotelNightlyPrice, hotelCost);
  const hotelNights = toNumber(plan.hotelNights, hotelCost > 0 ? 1 : 0);

  return {
    id: toString(plan.id, crypto.randomUUID()),
    title: toString(plan.title, "Untitled Plan"),
    artist: toString(plan.artist),
    date: toDate(plan.date),
    city: toString(plan.city),
    venue: toString(plan.venue),
    venueId: toString(plan.venueId),
    seatType: toString(plan.seatType),
    departureCity: toString(plan.departureCity),
    transportMode: toString(plan.transportMode),
    oneWayDuration: toString(plan.oneWayDuration),
    hotelArea: toString(plan.hotelArea),
    hotelNightlyPrice,
    hotelNights,
    venueCommuteTime: toString(plan.venueCommuteTime),
    ticketPrice: toNumber(plan.ticketPrice),
    serviceFee: toNumber(plan.serviceFee),
    transportCost: toNumber(plan.transportCost),
    hotelCost,
    foodBudget: toNumber(plan.foodBudget),
    merchBudget: toNumber(plan.merchBudget),
    localTransitCost: toNumber(plan.localTransitCost),
    preference: toScore(plan.preference, 5),
    rarity: toScore(plan.rarity, 5),
    fatigue: toScore(plan.fatigue, 5),
    seatSatisfaction: toScore(plan.seatSatisfaction, 5),
    hotelQuietness: toScore(plan.hotelQuietness, 7),
    regretRisk: toScore(plan.regretRisk, 4),
    departureTime: toString(plan.departureTime),
    arrivalTime: toString(plan.arrivalTime),
    hotelCheckInTime: toString(plan.hotelCheckInTime),
    venueArrivalTime: toString(plan.venueArrivalTime),
    entryTime: toString(plan.entryTime),
    showStartTime: toString(plan.showStartTime),
    showEndTime: toString(plan.showEndTime),
    returnTime: toString(plan.returnTime),
    notes: toString(plan.notes),
    createdAt: toString(plan.createdAt, now),
    updatedAt: toString(plan.updatedAt, now),
  };
};

export const getStoredPlans = (): TripPlan[] => {
  if (!canUseLocalStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as TripPlan[];
    return Array.isArray(parsed) ? parsed.map(normalizePlan) : [];
  } catch {
    return [];
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
