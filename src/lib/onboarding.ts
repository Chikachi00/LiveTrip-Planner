const ONBOARDING_KEY = "livetrip-planner:onboarding-dismissed";

const canUseLocalStorage = () => typeof window !== "undefined" && window.localStorage;

export const isOnboardingDismissed = () => {
  if (!canUseLocalStorage()) {
    return false;
  }

  return window.localStorage.getItem(ONBOARDING_KEY) === "true";
};

export const dismissOnboarding = () => {
  if (canUseLocalStorage()) {
    window.localStorage.setItem(ONBOARDING_KEY, "true");
  }
};

export const resetOnboarding = () => {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(ONBOARDING_KEY);
  }
};
