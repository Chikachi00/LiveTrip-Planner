const PREFERENCES_KEY = "livetrip-planner:user-preferences";

export type PreferredCurrency = "JPY" | "CNY" | "USD" | "MYR";
export type PreferredMapProvider = "google" | "apple" | "baidu" | "amap";
export type PreferenceScore = 1 | 2 | 3 | 4 | 5;

export type UserPreferences = {
  homeCity?: string;
  preferredCurrency: PreferredCurrency;
  defaultFoodBudget?: number;
  defaultLocalTransportBudget?: number;
  defaultMerchBudget?: number;
  preferredMapProvider: PreferredMapProvider;
  hotelQuietPreference: PreferenceScore;
  fatigueSensitivity: PreferenceScore;
  budgetSensitivity: PreferenceScore;
  preferStayNearVenue: boolean;
  avoidLateNightReturn: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

const canUseLocalStorage = () => typeof window !== "undefined" && window.localStorage;

export const defaultUserPreferences: UserPreferences = {
  homeCity: "",
  preferredCurrency: "JPY",
  defaultFoodBudget: 400,
  defaultLocalTransportBudget: 200,
  defaultMerchBudget: 500,
  preferredMapProvider: "google",
  hotelQuietPreference: 3,
  fatigueSensitivity: 3,
  budgetSensitivity: 3,
  preferStayNearVenue: false,
  avoidLateNightReturn: true,
  notes: "",
};

const currencies: PreferredCurrency[] = ["JPY", "CNY", "USD", "MYR"];
const mapProviders: PreferredMapProvider[] = ["google", "apple", "baidu", "amap"];

const toScore = (value: unknown, fallback: PreferenceScore): PreferenceScore => {
  const number = typeof value === "number" ? value : Number(value);

  if ([1, 2, 3, 4, 5].includes(number)) {
    return number as PreferenceScore;
  }

  return fallback;
};

const toNumber = (value: unknown, fallback?: number) => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const normalizeUserPreferences = (
  value: unknown,
  options: { touch?: boolean } = {},
): UserPreferences => {
  const record = isRecord(value) ? value : {};
  const now = new Date().toISOString();
  const preferredCurrency = record.preferredCurrency;
  const preferredMapProvider = record.preferredMapProvider;

  return {
    homeCity: typeof record.homeCity === "string" ? record.homeCity : "",
    preferredCurrency: currencies.includes(preferredCurrency as PreferredCurrency)
      ? (preferredCurrency as PreferredCurrency)
      : defaultUserPreferences.preferredCurrency,
    defaultFoodBudget: toNumber(
      record.defaultFoodBudget,
      defaultUserPreferences.defaultFoodBudget,
    ),
    defaultLocalTransportBudget: toNumber(
      record.defaultLocalTransportBudget,
      defaultUserPreferences.defaultLocalTransportBudget,
    ),
    defaultMerchBudget: toNumber(
      record.defaultMerchBudget,
      defaultUserPreferences.defaultMerchBudget,
    ),
    preferredMapProvider: mapProviders.includes(
      preferredMapProvider as PreferredMapProvider,
    )
      ? (preferredMapProvider as PreferredMapProvider)
      : defaultUserPreferences.preferredMapProvider,
    hotelQuietPreference: toScore(
      record.hotelQuietPreference,
      defaultUserPreferences.hotelQuietPreference,
    ),
    fatigueSensitivity: toScore(
      record.fatigueSensitivity,
      defaultUserPreferences.fatigueSensitivity,
    ),
    budgetSensitivity: toScore(
      record.budgetSensitivity,
      defaultUserPreferences.budgetSensitivity,
    ),
    preferStayNearVenue:
      typeof record.preferStayNearVenue === "boolean"
        ? record.preferStayNearVenue
        : defaultUserPreferences.preferStayNearVenue,
    avoidLateNightReturn:
      typeof record.avoidLateNightReturn === "boolean"
        ? record.avoidLateNightReturn
        : defaultUserPreferences.avoidLateNightReturn,
    notes: typeof record.notes === "string" ? record.notes : "",
    createdAt:
      typeof record.createdAt === "string" && record.createdAt ? record.createdAt : now,
    updatedAt:
      options.touch || typeof record.updatedAt !== "string" || !record.updatedAt
        ? now
        : record.updatedAt,
  };
};

export const getUserPreferences = (): UserPreferences => {
  if (!canUseLocalStorage()) {
    return normalizeUserPreferences(defaultUserPreferences);
  }

  const raw = window.localStorage.getItem(PREFERENCES_KEY);

  if (!raw) {
    return normalizeUserPreferences(defaultUserPreferences);
  }

  try {
    return normalizeUserPreferences(JSON.parse(raw));
  } catch {
    return normalizeUserPreferences(defaultUserPreferences);
  }
};

export const hasStoredUserPreferences = () => {
  if (!canUseLocalStorage()) {
    return false;
  }

  return Boolean(window.localStorage.getItem(PREFERENCES_KEY));
};

export const saveUserPreferences = (preferences: UserPreferences) => {
  const next = normalizeUserPreferences(preferences, { touch: true });

  if (canUseLocalStorage()) {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  }

  return next;
};

export const saveImportedUserPreferences = (preferences: UserPreferences) => {
  const next = normalizeUserPreferences(preferences);

  if (canUseLocalStorage()) {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  }

  return next;
};

export const resetUserPreferences = () => {
  const next = normalizeUserPreferences(defaultUserPreferences, { touch: true });

  if (canUseLocalStorage()) {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  }

  return next;
};

export const clearUserPreferences = () => {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(PREFERENCES_KEY);
  }

  return normalizeUserPreferences(defaultUserPreferences);
};
