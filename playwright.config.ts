import { PlaywrightTestConfig, devices } from "@playwright/test";
import path from "path";

// Reference: https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  timeout: 30 * 1000,
  testDir: path.join(__dirname, "src/test/e2e"),
  retries: 0,
  outputDir: "test-results/",

  webServer: {
    command: "GARDENS_DIRECTORY=src/test/content pnpm dev",
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    trace: "retry-with-trace",
    headless: true,
  },

  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
};
export default config;
