import { samplePlans } from "../data/samplePlans";
import type { TripPlan } from "../types";
import { normalizePlan } from "./storage";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const getString = (record: Record<string, unknown>, key: string, fallback = "") => {
  const value = record[key];
  return typeof value === "string" ? value : fallback;
};

const getNumber = (record: Record<string, unknown>, key: string, fallback = 0) => {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const createId = () => crypto.randomUUID();

const ensureUniqueId = (id: string, usedIds: Set<string>) => {
  if (!id || usedIds.has(id)) {
    const newId = createId();
    usedIds.add(newId);
    return newId;
  }

  usedIds.add(id);
  return id;
};

const parsePlanRecord = (
  record: Record<string, unknown>,
  usedIds: Set<string>,
): TripPlan | null => {
  const title = getString(record, "title").trim();
  const date = getString(record, "date").trim();

  if (!title || !date) {
    return null;
  }

  const now = new Date().toISOString();
  const id = ensureUniqueId(getString(record, "id"), usedIds);

  return normalizePlan({
    id,
    title,
    artist: getString(record, "artist", "未填写"),
    date,
    city: getString(record, "city", "未填写"),
    venue: getString(record, "venue", "未填写"),
    seatType: getString(record, "seatType"),
    departureCity: getString(record, "departureCity"),
    transportMode: getString(record, "transportMode"),
    oneWayDuration: getString(record, "oneWayDuration"),
    hotelArea: getString(record, "hotelArea"),
    hotelNightlyPrice: getNumber(record, "hotelNightlyPrice"),
    hotelNights: getNumber(record, "hotelNights", 0),
    venueCommuteTime: getString(record, "venueCommuteTime"),
    ticketPrice: getNumber(record, "ticketPrice"),
    serviceFee: getNumber(record, "serviceFee"),
    transportCost: getNumber(record, "transportCost"),
    hotelCost: getNumber(record, "hotelCost"),
    foodBudget: getNumber(record, "foodBudget"),
    merchBudget: getNumber(record, "merchBudget"),
    localTransitCost: getNumber(record, "localTransitCost"),
    preference: getNumber(record, "preference", 5),
    rarity: getNumber(record, "rarity", 5),
    fatigue: getNumber(record, "fatigue", 5),
    seatSatisfaction: getNumber(record, "seatSatisfaction", 5),
    hotelQuietness: getNumber(record, "hotelQuietness", 7),
    regretRisk: getNumber(record, "regretRisk", 4),
    departureTime: getString(record, "departureTime"),
    arrivalTime: getString(record, "arrivalTime"),
    hotelCheckInTime: getString(record, "hotelCheckInTime"),
    venueArrivalTime: getString(record, "venueArrivalTime"),
    entryTime: getString(record, "entryTime"),
    showStartTime: getString(record, "showStartTime"),
    showEndTime: getString(record, "showEndTime"),
    returnTime: getString(record, "returnTime"),
    notes: getString(record, "notes"),
    createdAt: getString(record, "createdAt", now),
    updatedAt: getString(record, "updatedAt", now),
  });
};

export const createBackupJson = (plans: TripPlan[]) => {
  return JSON.stringify(
    {
      app: "LiveTrip Planner",
      version: "0.3",
      exportedAt: new Date().toISOString(),
      plans,
    },
    null,
    2,
  );
};

export const downloadJson = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const importPlansFromJson = (raw: string, existingPlans: TripPlan[]) => {
  const parsed = JSON.parse(raw) as unknown;
  const candidates = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.plans)
      ? parsed.plans
      : [];

  if (!candidates.length) {
    return { plans: existingPlans, importedCount: 0 };
  }

  const usedIds = new Set(existingPlans.map((plan) => plan.id));
  const imported = candidates
    .filter(isRecord)
    .map((record) => parsePlanRecord(record, usedIds))
    .filter((plan): plan is TripPlan => Boolean(plan));

  return {
    plans: [...imported, ...existingPlans],
    importedCount: imported.length,
  };
};

export const appendMissingSamplePlans = (existingPlans: TripPlan[]) => {
  const existingKeys = new Set(
    existingPlans.map((plan) => `${plan.title.trim()}__${plan.date}`),
  );
  const usedIds = new Set(existingPlans.map((plan) => plan.id));
  const additions = samplePlans
    .filter((plan) => !existingKeys.has(`${plan.title.trim()}__${plan.date}`))
    .map((plan) =>
      normalizePlan({
        ...plan,
        id: ensureUniqueId(plan.id, usedIds),
      }),
    );

  return {
    plans: [...additions, ...existingPlans],
    importedCount: additions.length,
  };
};
