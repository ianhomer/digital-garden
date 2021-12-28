import { devices, PlaywrightTestConfig } from "@playwright/test";
import path from "path";

// Reference: https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  timeout: (process.env.CI ? 20 : 10) * 1000,
  testDir: path.join(__dirname, "src/test/e2e"),
  retries: 0,
  reporter: [
    [process.env.CI ? "dot" : "list"],
    ["json", { outputFile: "results/test-results.json" }],
    ["html", { open: "never", outputFolder: "results/playwright-report" }],
  ],
  outputDir: "results/",

  webServer: {
    command: process.env.CI ? "pnpm start" : "pnpm test:dev",
    port: 3000,
    timeout: (process.env.ci ? 30 : 10) * 1000,
  },

  use: {
    trace: "retry-with-trace",
    headless: process.env.HEAD ? false : true,
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
