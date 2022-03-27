import { devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reference: https://playwright.dev/docs/test-configuration
const config = {
  timeout: (process.env.CI ? 60 : 10) * 1000,
  testDir: path.join(__dirname, "src/test/e2e"),
  retries: 0,
  reporter: [
    [process.env.CI ? "dot" : "list"],
    ["json", { outputFile: "output/test-results.json" }],
    ["html", { open: "never", outputFolder: "output/playwright-report" }],
  ],
  outputDir: "results/",

  webServer: {
    command: "pnpm start",
    port: 3000,
    timeout: (process.env.CI ? 30 : 10) * 1000,
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
