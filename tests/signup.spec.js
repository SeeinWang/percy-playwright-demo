// @ts-check
const { test, expect } = require('@playwright/test');
const percySnapshot = require('@percy/playwright');

// 两套截图：
//   1. percySnapshot      → 上传到 Percy 云端，在网页上 review / approve（需要 PERCY_TOKEN）
//   2. toHaveScreenshot   → Playwright 本地像素对比，不需要任何账号
// 没有通过 `percy exec` 运行时，percySnapshot 会自动跳过，不会报错。

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('默认状态', async ({ page }) => {
  await expect(page.getByRole('heading', { name: '订阅我们的周报' })).toBeVisible();
  await percySnapshot(page, '订阅卡片 - 默认');
  await expect(page).toHaveScreenshot('default.png');
});

test('主按钮 hover', async ({ page }) => {
  const btn = page.locator('#primary-btn');
  await btn.hover();
  // 交互断言：hover 后背景色真的变了
  await expect(btn).toHaveCSS('background-color', 'rgb(29, 78, 216)');

  // Percy 是把 DOM 拿去它自己的浏览器重新渲染的，鼠标不在那边，
  // 所以要告诉它哪个元素要“强制” hover。
  await percySnapshot(page, '订阅卡片 - 主按钮 hover', {
    pseudoClassEnabledElements: { selectors: ['#primary-btn'] },
  });
  await expect(btn).toHaveScreenshot('primary-hover.png');
});

test('次按钮 hover', async ({ page }) => {
  const btn = page.locator('#secondary-btn');
  await btn.hover();
  await expect(btn).toHaveCSS('background-color', 'rgb(245, 246, 248)');
  await percySnapshot(page, '订阅卡片 - 次按钮 hover', {
    pseudoClassEnabledElements: { selectors: ['#secondary-btn'] },
  });
  await expect(btn).toHaveScreenshot('secondary-hover.png');
});

test('键盘 Tab 聚焦', async ({ page }) => {
  // 用 Tab 走一遍焦点顺序：输入框 → 订阅 → 以后再说
  await page.keyboard.press('Tab');
  await expect(page.locator('#email')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#primary-btn')).toBeFocused();

  await percySnapshot(page, '订阅卡片 - 主按钮 focus', {
    pseudoClassEnabledElements: { selectors: ['#primary-btn'] },
  });
  await expect(page.locator('.card')).toHaveScreenshot('primary-focus.png');
});

test('输入框 focus', async ({ page }) => {
  await page.locator('#email').focus();
  await expect(page.locator('#email')).toHaveCSS('border-color', 'rgb(37, 99, 235)');
  await percySnapshot(page, '订阅卡片 - 输入框 focus', {
    pseudoClassEnabledElements: { selectors: ['#email'] },
  });
  await expect(page.locator('.card')).toHaveScreenshot('email-focus.png');
});

test('提交无效邮箱显示错误', async ({ page }) => {
  await page.locator('#email').fill('not-an-email');
  await page.locator('#primary-btn').click();
  await expect(page.locator('#error')).toBeVisible();
  await page.locator('#primary-btn').blur();
  await percySnapshot(page, '订阅卡片 - 错误状态');
  await expect(page.locator('.card')).toHaveScreenshot('error.png');
});

test('提交有效邮箱显示成功', async ({ page }) => {
  await page.locator('#email').fill('me@example.com');
  await page.locator('#primary-btn').click();
  await expect(page.locator('#success')).toBeVisible();
  await percySnapshot(page, '订阅卡片 - 成功');
  await expect(page.locator('.card')).toHaveScreenshot('success.png');
});
