import type { Venue } from "../data/venues";

const CUSTOM_VENUES_KEY = "livetrip-planner:custom-venues";

const canUseLocalStorage = () => typeof window !== "undefined" && window.localStorage;

const asArray = (value?: string[]) => (Array.isArray(value) ? value : []);

export type VenueInput = Omit<Venue, "id">;

export const defaultVenueInput: VenueInput = {
  name: "",
  nameJa: "",
  city: "",
  country: "",
  area: "",
  nearestStations: [],
  capacity: undefined,
  venueType: "other",
  accessScore: 3,
  crowdRiskScore: 3,
  hotelDifficultyScore: 3,
  dayTripDifficultyScore: 3,
  recommendedHotelAreas: [],
  avoidHotelAreas: [],
  arrivalAdvice: "",
  leavingAdvice: "",
  hotelAdvice: "",
  transportAdvice: "",
  notes: "",
};

export const normalizeVenue = (venue: Venue): Venue => ({
  ...venue,
  id: venue.id || `custom_${crypto.randomUUID()}`,
  name: venue.name ?? "",
  nameJa: venue.nameJa ?? "",
  city: venue.city ?? "",
  country: venue.country ?? "",
  area: venue.area ?? "",
  nearestStations: asArray(venue.nearestStations),
  capacity: venue.capacity || undefined,
  venueType: venue.venueType ?? "other",
  accessScore: venue.accessScore ?? 3,
  crowdRiskScore: venue.crowdRiskScore ?? 3,
  hotelDifficultyScore: venue.hotelDifficultyScore ?? 3,
  dayTripDifficultyScore: venue.dayTripDifficultyScore ?? 3,
  recommendedHotelAreas: asArray(venue.recommendedHotelAreas),
  avoidHotelAreas: asArray(venue.avoidHotelAreas),
  arrivalAdvice: venue.arrivalAdvice ?? "",
  leavingAdvice: venue.leavingAdvice ?? "",
  hotelAdvice: venue.hotelAdvice ?? "",
  transportAdvice: venue.transportAdvice ?? "",
  notes: venue.notes ?? "",
  createdAt: venue.createdAt ?? new Date().toISOString(),
  updatedAt: venue.updatedAt ?? new Date().toISOString(),
});

export const getStoredCustomVenues = (): Venue[] => {
  if (!canUseLocalStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(CUSTOM_VENUES_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed
          .filter((item): item is Venue => typeof item === "object" && item !== null)
          .map(normalizeVenue)
      : [];
  } catch {
    return [];
  }
};

export const saveCustomVenues = (venues: Venue[]) => {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(CUSTOM_VENUES_KEY, JSON.stringify(venues.map(normalizeVenue)));
};

export const createCustomVenue = (input: VenueInput): Venue => {
  const now = new Date().toISOString();

  return normalizeVenue({
    ...input,
    id: `custom_${crypto.randomUUID()}`,
    createdAt: now,
    updatedAt: now,
  });
};

export const updateCustomVenue = (
  venues: Venue[],
  id: string,
  input: VenueInput,
) =>
  venues.map((venue) =>
    venue.id === id
      ? normalizeVenue({
          ...input,
          id,
          createdAt: venue.createdAt,
          updatedAt: new Date().toISOString(),
        })
      : venue,
  );

export const removeCustomVenue = (venues: Venue[], id: string) =>
  venues.filter((venue) => venue.id !== id);

export const createVenueFromPlanText = (city: string, venueName: string): Venue => {
  return createCustomVenue({
    ...defaultVenueInput,
    name: venueName.trim(),
    city: city.trim(),
    country: "",
    area: city.trim(),
    nearestStations: [],
    recommendedHotelAreas: city.trim() ? [city.trim()] : [],
    arrivalAdvice: "这是从计划表单保存的自定义场馆，建议后续补充到达和入场提醒。",
    leavingAdvice: "建议补充散场后的车站、打车点和人流风险。",
    hotelAdvice: "建议补充适合远征住宿的区域。",
    transportAdvice: "建议补充从主要车站或机场到场馆的交通方式。",
  });
};
