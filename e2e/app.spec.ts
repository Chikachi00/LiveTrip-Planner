import { expect, test, type Page } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const resetApp = async (page: Page) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
};

const createPlan = async (page: Page, title = "E2E Live") => {
  await page.goto("/new");
  await page.getByTestId("plan-title-input").fill(title);
  await page.getByTestId("plan-artist-input").fill("E2E Artist");
  await page.getByTestId("plan-date-input").fill("2026-07-04");
  await page.getByTestId("plan-city-input").fill("Yokohama");
  await page.getByTestId("plan-venue-input").fill("K-Arena Yokohama");
  await page.getByTestId("plan-departure-city-input").fill("Shanghai");
  await page.getByTestId("plan-transport-mode-input").fill("Flight + train");
  await page.getByTestId("plan-one-way-duration-input").fill("5 hours");
  await page.getByTestId("plan-hotel-area-input").fill("Yokohama Station");
  await page.getByTestId("plan-hotel-nightly-price-input").fill("1200");
  await page.getByTestId("plan-hotel-nights-input").fill("1");
  await page.getByTestId("plan-submit-button").click();
  await expect(page.getByTestId("plan-detail-page")).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await resetApp(page);
});

test("first-run flow", async ({ page }) => {
  await expect(page.getByTestId("first-run-onboarding")).toBeVisible();
  await page.getByTestId("onboarding-dismiss-button").click();
  await expect(page.getByTestId("first-run-onboarding")).toBeHidden();
  await expect(page.getByTestId("dashboard-page")).toBeVisible();
});

test("trip plan flow", async ({ page }) => {
  await createPlan(page, "E2E Trip Plan");
  await expect(page.getByRole("heading", { name: "E2E Trip Plan" })).toBeVisible();

  await page.getByTestId("plan-edit-link").click();
  await page.getByTestId("plan-title-input").fill("E2E Trip Plan Edited");
  await page.getByTestId("plan-submit-button").click();

  await expect(page.getByTestId("plan-detail-page")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "E2E Trip Plan Edited" }),
  ).toBeVisible();

  await page.goto("/");
  await expect(page.getByTestId("plan-card").filter({ hasText: "E2E Trip Plan Edited" })).toBeVisible();
});

test("compare flow", async ({ page }) => {
  await page.getByTestId("onboarding-load-samples-button").click();
  await page.goto("/compare");
  await expect(page.getByTestId("compare-page")).toBeVisible();
  await expect(async () => {
    expect(await page.getByTestId("compare-plan-option").count()).toBeGreaterThan(1);
  }).toPass();
  await page.getByTestId("compare-sort-select").selectOption("cost");
  await expect(page.getByTestId("compare-sort-select")).toHaveValue("cost");
});

test("venue flow", async ({ page }) => {
  await page.goto("/venues");
  await page.getByTestId("venue-add-button").click();
  await page.getByTestId("venue-name-input").fill("E2E Hall");
  await page.getByTestId("venue-city-input").fill("Tokyo");
  await page.getByTestId("venue-country-input").fill("Japan");
  await page.getByTestId("venue-area-input").fill("Test Area");
  await page.getByTestId("venue-save-button").click();
  await expect(page.getByText("E2E Hall")).toBeVisible();

  await page.getByTestId("venue-edit-button").first().click();
  await page.getByTestId("venue-name-input").fill("E2E Hall Edited");
  await page.getByTestId("venue-save-button").click();
  await expect(page.getByText("E2E Hall Edited")).toBeVisible();

  await page.goto("/new");
  await page.getByTestId("plan-venue-search-input").fill("E2E Hall Edited");
  const optionValue = await page
    .locator('[data-testid="plan-venue-select"] option', { hasText: "E2E Hall Edited" })
    .first()
    .getAttribute("value");
  expect(optionValue).toBeTruthy();
  await page.getByTestId("plan-venue-select").selectOption(optionValue ?? "");
  await expect(page.getByTestId("plan-city-input")).toHaveValue("Tokyo");
});

test("preferences flow", async ({ page }) => {
  await page.goto("/settings");
  await page.getByTestId("pref-home-city-input").fill("Osaka");
  await page.getByTestId("pref-defaultFoodBudget-input").fill("777");
  await page.getByTestId("pref-save-button").click();

  await page.goto("/new");
  await expect(page.getByTestId("plan-departure-city-input")).toHaveValue("Osaka");
  await expect(page.getByTestId("money-foodBudget")).toHaveValue("777");
});

test("backup flow", async ({ page }) => {
  await createPlan(page, "Backup Test Plan");
  await page.goto("/settings");

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("backup-export-button").click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();

  const exported = JSON.parse(readFileSync(path!, "utf-8")) as Record<string, unknown>;
  expect(exported.schemaVersion).toBe(1);
  expect(exported.appVersion).toBe("1.0.0");

  const importPath = join(tmpdir(), `livetrip-backup-${Date.now()}.json`);
  writeFileSync(
    importPath,
    JSON.stringify({
      schemaVersion: 1,
      appVersion: "1.0.0",
      exportedAt: new Date().toISOString(),
      tripPlans: [
        {
          id: "imported-plan",
          title: "Imported Backup Plan",
          artist: "Import Artist",
          date: "2026-08-01",
          city: "Tokyo",
          venue: "Tokyo Dome",
        },
      ],
      customVenues: [],
      userPreferences: {},
    }),
  );

  await page.getByTestId("backup-import-input").setInputFiles(importPath);
  await expect(page.getByText(/导入完成/).first()).toBeVisible();
});
