import { test, expect } from '@playwright/test';

// Keyboard accessibility. Behaviour only, no Percy snapshots: these run in their own
// CI job (tagged @a11y) and never reach Percy.

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Tab and Shift+Tab move through the form in reading order', { tag: '@a11y' }, async ({ page }) => {
  const email = page.getByRole('textbox', { name: 'Email' });
  const subscribe = page.getByRole('button', { name: 'Subscribe' });
  const later = page.getByRole('button', { name: 'Maybe later' });

  await page.keyboard.press('Tab');
  await expect(email).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(subscribe).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(later).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(subscribe).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(email).toBeFocused();
});

test('the form can be submitted with the keyboard alone', { tag: '@a11y' }, async ({ page }) => {
  await page.keyboard.press('Tab');
  await page.keyboard.type('reader@example.com');
  await page.keyboard.press('Enter');
  await expect(page.getByText("You're subscribed")).toBeVisible();
});
