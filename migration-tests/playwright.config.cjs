const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './specs', fullyParallel: false, workers: 1,
  forbidOnly: true, retries: 0, timeout: 20000, globalTimeout: 240000,
  reporter: 'list', outputDir: './test-results',
  use: { channel: 'chrome', baseURL: 'http://127.0.0.1:18181', locale: 'pt-BR', timezoneId: 'America/Sao_Paulo',
    serviceWorkers: 'block', trace: 'off', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1366, height: 768 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ],
  webServer: { command: 'node server.cjs', url: 'http://127.0.0.1:18181',
    reuseExistingServer: false, timeout: 90000 }
});
