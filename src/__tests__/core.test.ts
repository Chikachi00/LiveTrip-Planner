import { describe, expect, it } from "vitest";
import type { Venue } from "../data/venues";
import { generateTripAdvice } from "../lib/adviceEngine";
import type { UserPreferences } from "../lib/userPreferences";
import type { TripPlan } from "../types";
import { calculateTotalCost, calculateWorthScore } from "../utils/calculations";
import {
  APP_VERSION,
  BACKUP_SCHEMA_VERSION,
  BackupImportError,
  createBackupJson,
  importPlansFromJson,
} from "../utils/dataManagement";
import {
  mergePlansByUpdatedAt,
  mergePreferencesByUpdatedAt,
  mergeVenuesByUpdatedAt,
} from "../utils/merge";
import { normalizePlan } from "../utils/storage";

const basePlan = (overrides: Partial<TripPlan> = {}): TripPlan =>
  normalizePlan({
    id: "plan_1",
    title: "Test Live",
    artist: "Artist",
    date: "2026-07-04",
    city: "Yokohama",
    venue: "K-Arena Yokohama",
    ticketPrice: 1000,
    serviceFee: 100,
    transportCost: 500,
    hotelCost: 800,
    foodBudget: 300,
    merchBudget: 200,
    localTransitCost: 100,
    preference: 8,
    rarity: 8,
    fatigue: 4,
    seatSatisfaction: 8,
    hotelQuietness: 8,
    regretRisk: 3,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  });

const venue = (overrides: Partial<Venue> = {}): Venue => ({
  id: "custom_test",
  name: "Custom Arena",
  city: "Yokohama",
  country: "Japan",
  area: "Station Area",
  nearestStations: ["Station"],
  venueType: "arena",
  accessScore: 3,
  crowdRiskScore: 5,
  hotelDifficultyScore: 4,
  dayTripDifficultyScore: 4,
  recommendedHotelAreas: ["Station Area"],
  arrivalAdvice: "Arrive early.",
  leavingAdvice: "Leave slowly.",
  hotelAdvice: "Book early.",
  transportAdvice: "Check last train.",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const preferences = (overrides: Partial<UserPreferences> = {}): UserPreferences => ({
  homeCity: "Shanghai",
  preferredCurrency: "JPY",
  defaultFoodBudget: 400,
  defaultLocalTransportBudget: 200,
  defaultMerchBudget: 500,
  preferredMapProvider: "google",
  hotelQuietPreference: 5,
  fatigueSensitivity: 5,
  budgetSensitivity: 5,
  preferStayNearVenue: true,
  avoidLateNightReturn: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("budget calculations", () => {
  it("calculates total cost from all cost fields", () => {
    expect(calculateTotalCost(basePlan())).toBe(3000);
  });

  it("uses hotel nightly price and nights when hotelCost is zero", () => {
    expect(
      calculateTotalCost(
        basePlan({ hotelCost: 0, hotelNightlyPrice: 600, hotelNights: 2 }),
      ),
    ).toBe(3400);
  });

  it("handles zero-cost items", () => {
    expect(
      calculateTotalCost(
        basePlan({
          ticketPrice: 0,
          serviceFee: 0,
          transportCost: 0,
          hotelCost: 0,
          foodBudget: 0,
          merchBudget: 0,
          localTransitCost: 0,
        }),
      ),
    ).toBe(0);
  });
});

describe("worth score", () => {
  it("returns a high score for a strong plan", () => {
    expect(calculateWorthScore(basePlan())).toBeGreaterThanOrEqual(70);
  });

  it("drops for high budget and high fatigue", () => {
    const score = calculateWorthScore(
      basePlan({
        ticketPrice: 5000,
        transportCost: 5000,
        hotelCost: 5000,
        fatigue: 10,
        regretRisk: 10,
      }),
    );

    expect(score).toBeLessThan(70);
  });

  it("keeps scores within 0-100", () => {
    expect(
      calculateWorthScore(
        basePlan({
          preference: 999,
          rarity: 999,
          seatSatisfaction: 999,
          hotelQuietness: 999,
        }),
      ),
    ).toBeLessThanOrEqual(100);
    expect(
      calculateWorthScore(
        basePlan({
          preference: -999,
          rarity: -999,
          seatSatisfaction: -999,
          fatigue: 999,
          regretRisk: 999,
          ticketPrice: 100000,
        }),
      ),
    ).toBeGreaterThanOrEqual(0);
  });
});

describe("smart advice engine", () => {
  it("adds budget advice for expensive plans", () => {
    const advice = generateTripAdvice(
      basePlan({ ticketPrice: 5000, transportCost: 5000, hotelCost: 5000 }),
    );
    expect(advice.budgetAdvice.length).toBeGreaterThan(0);
    expect(advice.risks.length).toBeGreaterThan(0);
  });

  it("adds fatigue advice for high fatigue", () => {
    const advice = generateTripAdvice(basePlan({ fatigue: 10 }));
    expect([...advice.travelAdvice, ...advice.risks].join(" ")).toContain("风险");
  });

  it("uses hotel quietness preference", () => {
    const advice = generateTripAdvice(
      basePlan({ hotelQuietness: 3, hotelNights: 1 }),
      [],
      preferences({ hotelQuietPreference: 5 }),
    );
    expect(advice.hotelAdvice.join(" ")).toContain("安静");
  });

  it("uses venue crowd risk", () => {
    const advice = generateTripAdvice(
      basePlan({ venueId: "custom_test" }),
      [venue({ crowdRiskScore: 5 })],
    );
    expect(advice.risks.join(" ")).toContain("5/5");
  });

  it("uses user preferences for late-night return", () => {
    const advice = generateTripAdvice(
      basePlan({ city: "Unknown", venue: "Unknown Hall", showEndTime: "22:00" }),
      [],
      preferences({ avoidLateNightReturn: true }),
    );
    expect(advice.travelAdvice.join(" ")).toContain("深夜");
  });
});

describe("merge logic", () => {
  it("adds different cloud ids", () => {
    const result = mergePlansByUpdatedAt(
      [basePlan({ id: "local" })],
      [basePlan({ id: "cloud" })],
    );
    expect(result.added).toBe(1);
    expect(result.total).toBe(2);
  });

  it("uses newer cloud item for same id", () => {
    const result = mergePlansByUpdatedAt(
      [basePlan({ title: "Local", updatedAt: "2026-01-01T00:00:00.000Z" })],
      [basePlan({ title: "Cloud", updatedAt: "2026-01-02T00:00:00.000Z" })],
    );
    expect(result.updated).toBe(1);
    expect(result.items[0].title).toBe("Cloud");
  });

  it("keeps newer local item for same id", () => {
    const result = mergePlansByUpdatedAt(
      [basePlan({ title: "Local", updatedAt: "2026-01-03T00:00:00.000Z" })],
      [basePlan({ title: "Cloud", updatedAt: "2026-01-02T00:00:00.000Z" })],
    );
    expect(result.keptLocal).toBe(1);
    expect(result.items[0].title).toBe("Local");
  });

  it("keeps local when cloud updatedAt is missing", () => {
    const cloud = basePlan({ title: "Cloud" });
    delete (cloud as Partial<TripPlan>).updatedAt;
    const result = mergePlansByUpdatedAt([basePlan({ title: "Local" })], [cloud]);
    expect(result.items[0].title).toBe("Local");
  });

  it("merges custom venues by updatedAt", () => {
    const result = mergeVenuesByUpdatedAt(
      [venue({ name: "Local", updatedAt: "2026-01-01T00:00:00.000Z" })],
      [venue({ name: "Cloud", updatedAt: "2026-01-02T00:00:00.000Z" })],
    );
    expect(result.items[0].name).toBe("Cloud");
  });

  it("merges preferences by updatedAt", () => {
    const result = mergePreferencesByUpdatedAt({
      hasLocalPreferences: true,
      localPreferences: preferences({ homeCity: "Local" }),
      cloudPreferences: preferences({
        homeCity: "Cloud",
        updatedAt: "2026-01-02T00:00:00.000Z",
      }),
    });
    expect(result.status).toBe("updated");
    expect(result.item.homeCity).toBe("Cloud");
  });
});

describe("JSON import and normalization", () => {
  it("exports the v1 backup schema", () => {
    const backup = JSON.parse(
      createBackupJson([basePlan()], [venue()], preferences()),
    ) as Record<string, unknown>;

    expect(backup.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(backup.appVersion).toBe(APP_VERSION);
    expect(Array.isArray(backup.tripPlans)).toBe(true);
    expect(Array.isArray(backup.customVenues)).toBe(true);
    expect(backup.userPreferences).toBeDefined();
    expect(backup.plans).toBeUndefined();
  });

  it("imports old array backups", () => {
    const result = importPlansFromJson(JSON.stringify([basePlan()]), [], []);
    expect(result.schemaVersion).toBe(0);
    expect(result.importedCount).toBe(1);
  });

  it("imports v1 backups", () => {
    const result = importPlansFromJson(
      createBackupJson([basePlan()], [venue()], preferences()),
      [],
      [],
    );
    expect(result.schemaVersion).toBe(1);
    expect(result.importedCount).toBe(1);
    expect(result.importedCustomVenueCount).toBe(1);
    expect(result.importedUserPreferences).toBe(true);
  });

  it("fills missing fields", () => {
    const result = importPlansFromJson(
      JSON.stringify({ plans: [{ id: "legacy", title: "Legacy", date: "2026-08-01" }] }),
      [],
      [],
    );
    expect(result.plans[0].artist).toBeDefined();
  });

  it("coerces numeric strings", () => {
    const result = importPlansFromJson(
      JSON.stringify({
        plans: [
          {
            id: "legacy",
            title: "Legacy",
            date: "2026-08-01",
            ticketPrice: "1200",
          },
        ],
      }),
      [],
      [],
    );
    expect(result.plans[0].ticketPrice).toBe(1200);
  });

  it("throws on broken JSON", () => {
    expect(() => importPlansFromJson("{broken", [], [])).toThrow(BackupImportError);
  });

  it("rejects unknown newer backup schemas", () => {
    expect(() =>
      importPlansFromJson(JSON.stringify({ schemaVersion: 999, tripPlans: [] }), [], []),
    ).toThrow(BackupImportError);
  });
});
