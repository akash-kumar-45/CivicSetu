import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./",
  timeout: 30000,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
});
