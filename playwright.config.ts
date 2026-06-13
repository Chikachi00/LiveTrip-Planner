import { defineConfig, devices } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const findLocalChromium = () => {
  const localBrowsers = join(
    process.cwd(),
    "node_modules",
    "playwright-core",
    ".local-browsers",
  );

  if (!existsSync(localBrowsers)) {
    return undefined;
  }

  const shellDir = readdirSync(localBrowsers).find((entry) =>
    entry.startsWith("chromium_headless_shell-"),
  );

  if (!shellDir) {
    return undefined;
  }

  const executable = join(
    localBrowsers,
    shellDir,
    "chrome-headless-shell-win64",
    "chrome-headless-shell.exe",
  );

  return existsSync(executable) ? executable : undefined;
};

const localChromiumExecutable = findLocalChromium();
export default defineConfig({
  testDir: "./e2e",
  testIgnore: /screenshots\.spec\.ts/,
  timeout: 30_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "html",
  use: {
    baseURL: "http://127.0.0.1:5180",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: localChromiumExecutable
          ? { executablePath: localChromiumExecutable }
          : undefined,
      },
    },
  ],
});
