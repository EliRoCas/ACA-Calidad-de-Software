const { defineConfig, devices } = require("@playwright/test");

const isProd = process.env.TEST_ENV === "prod";
const localBaseURL = process.env.MVP_BASE_URL || "http://127.0.0.1:4173";
const baseURL = isProd ? process.env.MVP_PROD_URL || localBaseURL : localBaseURL;
const shouldStartLocalServer =
  !isProd ||
  (process.env.MVP_PROD_SMOKE_ENABLED === "true" && !process.env.MVP_PROD_URL);

module.exports = defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.js",
  fullyParallel: true,
  retries: Number(process.env.TEST_RETRIES || 0),
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  ...(shouldStartLocalServer
    ? {
        webServer: {
          command: "cmd /c npm run start:test",
          url: localBaseURL,
          reuseExistingServer: true,
          timeout: 120000,
        },
      }
    : {}),
});
