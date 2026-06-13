import { samplePlans } from "../data/samplePlans";
import type { Venue } from "../data/venues";
import { normalizeVenue } from "../lib/customVenues";
import {
  normalizeUserPreferences,
  type UserPreferences,
} from "../lib/userPreferences";
import type { TripPlan } from "../types";
import { normalizePlan } from "./storage";

export const BACKUP_SCHEMA_VERSION = 1;
export const APP_VERSION = "1.0.0";

export class BackupImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupImportError";
  }
}

type BackupFileV1 = {
  schemaVersion: 1;
  appVersion: string;
  exportedAt: string;
  tripPlans: TripPlan[];
  customVenues: Venue[];
  userPreferences: UserPreferences;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const getString = (record: Record<string, unknown>, key: string, fallback = "") => {
  const value = record[key];
  return typeof value === "string" ? value : fallback;
};

const getNumber = (record: Record<string, unknown>, key: string, fallback = 0) => {
  const value = record[key];
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getStringArray = (record: Record<string, unknown>, key: string) => {
  const value = record[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
};

const clampScore = (value: unknown, fallback = 3) => {
  const number = typeof value === "number" ? value : Number(value);
  return Math.min(Math.max(Math.round(Number.isFinite(number) ? number : fallback), 1), 5);
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
    artist: getString(record, "artist", "Not set"),
    date,
    city: getString(record, "city", "Not set"),
    venue: getString(record, "venue", "Not set"),
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
    accessScore: clampScore(record.accessScore),
    crowdRiskScore: clampScore(record.crowdRiskScore),
    hotelDifficultyScore: clampScore(record.hotelDifficultyScore),
    dayTripDifficultyScore: clampScore(record.dayTripDifficultyScore),
    recommendedHotelAreas: getStringArray(record, "recommendedHotelAreas"),
    avoidHotelAreas: getStringArray(record, "avoidHotelAreas"),
    arrivalAdvice: getString(record, "arrivalAdvice"),
    leavingAdvice: getString(record, "leavingAdvice"),
    hotelAdvice: getString(record, "hotelAdvice"),
    transportAdvice: getString(record, "transportAdvice"),
    notes: getString(record, "notes"),
    createdAt: getString(record, "createdAt", new Date().toISOString()),
    updatedAt: getString(record, "updatedAt", new Date().toISOString()),
  });
};

const getSchemaVersion = (parsed: unknown) => {
  if (Array.isArray(parsed)) {
    return 0;
  }

  if (!isRecord(parsed) || parsed.schemaVersion === undefined) {
    return 0;
  }

  const version = Number(parsed.schemaVersion);

  if (!Number.isInteger(version) || version < 0) {
    throw new BackupImportError("Backup schemaVersion is invalid.");
  }

  if (version > BACKUP_SCHEMA_VERSION) {
    throw new BackupImportError(
      `Backup schemaVersion ${version} is newer than this app supports.`,
    );
  }

  return version;
};

export const createBackupObject = (
  plans: TripPlan[],
  customVenues: Venue[] = [],
  userPreferences: UserPreferences,
): BackupFileV1 => ({
  schemaVersion: BACKUP_SCHEMA_VERSION,
  appVersion: APP_VERSION,
  exportedAt: new Date().toISOString(),
  tripPlans: plans,
  customVenues,
  userPreferences,
});

export const createBackupJson = (
  plans: TripPlan[],
  customVenues: Venue[] = [],
  userPreferences: UserPreferences,
) => {
  return JSON.stringify(createBackupObject(plans, customVenues, userPreferences), null, 2);
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
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new BackupImportError("Backup file is not valid JSON.");
  }

  const schemaVersion = getSchemaVersion(parsed);
  const planCandidates = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.tripPlans)
      ? parsed.tripPlans
      : isRecord(parsed) && Array.isArray(parsed.plans)
        ? parsed.plans
        : [];
  const venueCandidates =
    isRecord(parsed) && Array.isArray(parsed.customVenues) ? parsed.customVenues : [];
  const userPreferencesCandidate =
    isRecord(parsed) && isRecord(parsed.userPreferences)
      ? normalizeUserPreferences(parsed.userPreferences)
      : null;

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
    schemaVersion,
    plans: [...importedPlans, ...existingPlans],
    customVenues: [...importedCustomVenues, ...existingCustomVenues],
    userPreferences: userPreferencesCandidate,
    importedCount: importedPlans.length,
    importedCustomVenueCount: importedCustomVenues.length,
    importedUserPreferences: Boolean(userPreferencesCandidate),
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
