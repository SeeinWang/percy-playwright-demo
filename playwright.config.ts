import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
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
  // 单个像素颜色差多少才算“不同”（0–1）。默认 0.2 太宽：hover 前后两种蓝色会被当成同色。
  expect: { toHaveScreenshot: { threshold: 0.05 } },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // 测的是打包后的产物（vite build + preview），和线上一致
  webServer: {
    command: 'npm run build && npx vite preview --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
