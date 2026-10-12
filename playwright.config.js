// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  // 本地基准图是在 macOS 上生成的，CI（Linux）字体渲染不同，会全部误报。
  // CI 上只用 Percy 做视觉对比，跳过本地 toHaveScreenshot。
  ignoreSnapshots: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // 本地截图对比：允许极少量像素差（抗锯齿）
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx http-server public -p 4173 -s -c-1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
