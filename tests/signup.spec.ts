import { test, expect, type Page } from '@playwright/test';
import percySnapshot from '@percy/playwright';

// Division of labour:
//   - Playwright assertions check behaviour: hover changes the colour, Tab moves focus
//     in the right order, submitting shows the right message. No baseline images.
//   - Percy checks how it looks: every snapshot is rendered in 4 browsers x 2 widths
//     (.percy.yml) and reviewed on percy.io. Baselines live in Percy, not in git.
// percySnapshot is a no-op unless the run is wrapped in `percy exec` with PERCY_TOKEN set.

// Percy re-renders the serialized DOM in its own browsers, so the pointer and focus
// do not travel with it. Interactive states are passed explicitly:
//   hover -> pseudoClassEnabledElements (the documented option; Percy never detects hover).
//   focus -> FOCUS_STATES. pseudoClassEnabledElements copies ~400 computed styles as
//            !important, including -webkit-text-fill-color resolved to rgb(0,0,0), which
//            turns an input's placeholder black; it also forces :hover/:active.
//            enablePseudoClassSerialization (@percy/cli >= 1.32.8) only rewrites :focus
//            rules and stamps the focused element. It is missing from the SnapshotOptions
//            type in @percy/playwright 1.1.2, hence the cast.
const FOCUS_STATES = { enablePseudoClassSerialization: true } as Parameters<typeof percySnapshot>[2];

const COLORS = {
  primary: 'rgb(37, 99, 235)',
  primaryHover: 'rgb(29, 78, 216)',
  secondaryHover: 'rgb(245, 246, 248)',
};

// A click leaves the pointer over the button and focus on it. Clear both before
// snapshotting a result state so it is not captured mid-interaction.
async function clearInteraction(page: Page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the signup card', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#email')).toHaveValue('');
  await expect(page.locator('#error')).toHaveCount(0);
  await percySnapshot(page, 'Signup card - default');
});

test('primary button darkens on hover', async ({ page }) => {
  const button = page.locator('#primary-btn');
  await expect(button).toHaveCSS('background-color', COLORS.primary);
  await button.hover();
  await expect(button).toHaveCSS('background-color', COLORS.primaryHover);
  await percySnapshot(page, 'Signup card - primary button hover', {
    pseudoClassEnabledElements: { selectors: ['#primary-btn'] },
  });
});

test('secondary button gets a background on hover', async ({ page }) => {
  const button = page.locator('#secondary-btn');
  await button.hover();
  await expect(button).toHaveCSS('background-color', COLORS.secondaryHover);
  await percySnapshot(page, 'Signup card - secondary button hover', {
    pseudoClassEnabledElements: { selectors: ['#secondary-btn'] },
  });
});

test('Tab moves focus from the input to the primary then the secondary button', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.locator('#email')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#primary-btn')).toBeFocused();
  await expect(page.locator('#primary-btn')).toHaveCSS('outline-style', 'solid');
  await percySnapshot(page, 'Signup card - primary button focus', FOCUS_STATES);

  await page.keyboard.press('Tab');
  await expect(page.locator('#secondary-btn')).toBeFocused();
});

test('email input shows a focus ring', async ({ page }) => {
  const input = page.locator('#email');
  await input.focus();
  await expect(input).toHaveCSS('border-color', COLORS.primary);
  await expect(input).toHaveCSS('box-shadow', /rgba\(37, 99, 235, 0\.25\)/);
  await percySnapshot(page, 'Signup card - email input focus', FOCUS_STATES);
});

test('an invalid email shows an error', async ({ page }) => {
  await page.locator('#email').fill('not-an-email');
  await page.locator('#primary-btn').click();
  await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#success')).toHaveCount(0);
  await clearInteraction(page);
  await percySnapshot(page, 'Signup card - invalid email');
});

test('a valid email shows the success message', async ({ page }) => {
  await page.locator('#email').fill('me@example.com');
  await page.locator('#primary-btn').click();
  await expect(page.locator('#success')).toBeVisible();
  await expect(page.locator('form')).toHaveCount(0);
  await clearInteraction(page);
  await percySnapshot(page, 'Signup card - subscribed');
});
