import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? "5181");

export function createPlaywrightConfig(testDir: string, useScreenshotOnly: boolean) {
  return defineConfig({
    testDir,
    timeout: 60_000,
    expect: {
      timeout: 10_000
    },
    fullyParallel: false,
    retries: 0,
    reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
    use: {
      baseURL: `http://127.0.0.1:${PORT}`,
      trace: "on-first-retry",
      screenshot: useScreenshotOnly ? "only-on-failure" : "off"
    },
    webServer: {
      command: `NEXT_PUBLIC_ALARM_MINUTE_MS=300 NEXT_PUBLIC_ENABLE_STORAGE_ADMIN=true npm run dev -- -p ${PORT} --hostname 127.0.0.1`,
      url: `http://127.0.0.1:${PORT}`,
      timeout: 120_000,
      reuseExistingServer: true
    },
    projects: [
      {
        name: "chromium",
        use: { ...devices["Desktop Chrome"] }
      }
    ]
  });
}
