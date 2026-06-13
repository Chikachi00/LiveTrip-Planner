import { expect, test, type Page } from "@playwright/test";

const resetAndSeed = async (page: Page) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.getByTestId("onboarding-load-samples-button").click();
  await expect(page.getByTestId("plan-card").first()).toBeVisible();
};

test("capture release screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await resetAndSeed(page);
  await page.screenshot({ path: "docs/screenshots/dashboard.png", fullPage: true });

  await page.getByTestId("plan-card").first().click();
  await expect(page.getByTestId("plan-detail-page")).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/plan-detail.png", fullPage: true });

  await page.goto("/compare");
  await expect(page.getByTestId("compare-page")).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/compare.png", fullPage: true });

  await page.goto("/venues");
  await expect(page.getByTestId("venues-page")).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/venues.png", fullPage: true });

  await page.goto("/settings");
  await expect(page.getByTestId("settings-page")).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/settings.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByTestId("dashboard-page")).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/mobile.png", fullPage: true });
});
