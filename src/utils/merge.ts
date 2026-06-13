import type { Venue } from "../data/venues";
import type { UserPreferences } from "../lib/userPreferences";
import type { TripPlan } from "../types";
import { normalizeVenue } from "../lib/customVenues";
import { normalizeUserPreferences } from "../lib/userPreferences";
import { normalizePlan } from "./storage";

const getUpdatedTime = (value: { updatedAt?: string }) => {
  if (!value.updatedAt) {
    return null;
  }

  const time = new Date(value.updatedAt).getTime();
  return Number.isNaN(time) ? null : time;
};

export const mergePlansByUpdatedAt = (
  localPlans: TripPlan[],
  cloudPlans: TripPlan[],
) => {
  const byId = new Map(localPlans.map((plan) => [plan.id, normalizePlan(plan)]));
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

    const cloudUpdatedAt = getUpdatedTime(rawCloudPlan);
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

  const items = [...byId.values()].sort((a, b) => a.date.localeCompare(b.date));

  return {
    items,
    added,
    updated,
    keptLocal,
    total: items.length,
  };
};

export const mergeVenuesByUpdatedAt = (
  localVenues: Venue[],
  cloudVenues: Venue[],
) => {
  const byId = new Map(localVenues.map((venue) => [venue.id, normalizeVenue(venue)]));
  let added = 0;
  let updated = 0;
  let keptLocal = 0;

  for (const rawCloudVenue of cloudVenues) {
    if (!rawCloudVenue.id) {
      continue;
    }

    const cloudVenue = normalizeVenue(rawCloudVenue);
    const localVenue = byId.get(cloudVenue.id);

    if (!localVenue) {
      byId.set(cloudVenue.id, cloudVenue);
      added += 1;
      continue;
    }

    const cloudUpdatedAt = getUpdatedTime(rawCloudVenue);
    const localUpdatedAt = getUpdatedTime(localVenue);

    if (
      cloudUpdatedAt !== null &&
      localUpdatedAt !== null &&
      cloudUpdatedAt > localUpdatedAt
    ) {
      byId.set(cloudVenue.id, cloudVenue);
      updated += 1;
    } else {
      keptLocal += 1;
    }
  }

  const items = [...byId.values()];

  return {
    items,
    added,
    updated,
    keptLocal,
    total: items.length,
  };
};

export const mergePreferencesByUpdatedAt = ({
  hasLocalPreferences,
  localPreferences,
  cloudPreferences,
}: {
  hasLocalPreferences: boolean;
  localPreferences: UserPreferences;
  cloudPreferences: UserPreferences | null;
}) => {
  if (!cloudPreferences) {
    return { item: localPreferences, status: "none" as const };
  }

  const cloudUpdatedAt = getUpdatedTime(cloudPreferences);
  const localUpdatedAt = getUpdatedTime(localPreferences);

  if (!hasLocalPreferences) {
    return {
      item: normalizeUserPreferences(cloudPreferences),
      status: "imported" as const,
    };
  }

  if (
    cloudUpdatedAt !== null &&
    localUpdatedAt !== null &&
    cloudUpdatedAt > localUpdatedAt
  ) {
    return {
      item: normalizeUserPreferences(cloudPreferences),
      status: "updated" as const,
    };
  }

  return { item: localPreferences, status: "keptLocal" as const };
};
