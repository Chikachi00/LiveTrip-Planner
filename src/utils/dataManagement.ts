import { samplePlans } from "../data/samplePlans";
import type { Venue } from "../data/venues";
import { normalizeVenue } from "../lib/customVenues";
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

const getStringArray = (record: Record<string, unknown>, key: string) => {
  const value = record[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
};

const createId = () => crypto.randomUUID();

const ensureUniqueId = (id: string, usedIds: Set<string>, prefix = "") => {
  if (!id || usedIds.has(id)) {
    const newId = `${prefix}${createId()}`;
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
    venueId: getString(record, "venueId"),
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

const parseVenueRecord = (
  record: Record<string, unknown>,
  usedIds: Set<string>,
): Venue | null => {
  const name = getString(record, "name").trim();
  const city = getString(record, "city").trim();

  if (!name || !city) {
    return null;
  }

  const venueType = getString(record, "venueType", "other") as Venue["venueType"];
  const allowedTypes: Venue["venueType"][] = [
    "arena",
    "stadium",
    "hall",
    "livehouse",
    "exhibition",
    "theater",
    "other",
  ];

  return normalizeVenue({
    id: ensureUniqueId(getString(record, "id"), usedIds, "custom_"),
    name,
    nameJa: getString(record, "nameJa"),
    city,
    country: getString(record, "country"),
    area: getString(record, "area", city),
    nearestStations: getStringArray(record, "nearestStations"),
    capacity: getNumber(record, "capacity", 0) || undefined,
    venueType: allowedTypes.includes(venueType) ? venueType : "other",
    accessScore: getNumber(record, "accessScore", 3),
    crowdRiskScore: getNumber(record, "crowdRiskScore", 3),
    hotelDifficultyScore: getNumber(record, "hotelDifficultyScore", 3),
    dayTripDifficultyScore: getNumber(record, "dayTripDifficultyScore", 3),
    recommendedHotelAreas: getStringArray(record, "recommendedHotelAreas"),
    avoidHotelAreas: getStringArray(record, "avoidHotelAreas"),
    arrivalAdvice: getString(record, "arrivalAdvice"),
    leavingAdvice: getString(record, "leavingAdvice"),
    hotelAdvice: getString(record, "hotelAdvice"),
    transportAdvice: getString(record, "transportAdvice"),
    notes: getString(record, "notes"),
  });
};

export const createBackupJson = (plans: TripPlan[], customVenues: Venue[] = []) => {
  return JSON.stringify(
    {
      app: "LiveTrip Planner",
      version: "0.7",
      exportedAt: new Date().toISOString(),
      tripPlans: plans,
      customVenues,
      plans, // Backward-friendly alias for older imports.
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

export const importPlansFromJson = (
  raw: string,
  existingPlans: TripPlan[],
  existingCustomVenues: Venue[] = [],
) => {
  const parsed = JSON.parse(raw) as unknown;
  const planCandidates = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.tripPlans)
      ? parsed.tripPlans
      : isRecord(parsed) && Array.isArray(parsed.plans)
        ? parsed.plans
        : [];
  const venueCandidates =
    isRecord(parsed) && Array.isArray(parsed.customVenues) ? parsed.customVenues : [];

  const usedPlanIds = new Set(existingPlans.map((plan) => plan.id));
  const importedPlans = planCandidates
    .filter(isRecord)
    .map((record) => parsePlanRecord(record, usedPlanIds))
    .filter((plan): plan is TripPlan => Boolean(plan));

  const usedVenueIds = new Set(existingCustomVenues.map((venue) => venue.id));
  const importedCustomVenues = venueCandidates
    .filter(isRecord)
    .map((record) => parseVenueRecord(record, usedVenueIds))
    .filter((venue): venue is Venue => Boolean(venue));

  return {
    plans: [...importedPlans, ...existingPlans],
    customVenues: [...importedCustomVenues, ...existingCustomVenues],
    importedCount: importedPlans.length,
    importedCustomVenueCount: importedCustomVenues.length,
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
