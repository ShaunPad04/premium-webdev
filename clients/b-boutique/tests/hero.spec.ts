import { expect, test } from '@playwright/test';

/* The home hero (2026-09-24 editorial rebuild): one photograph, one line,
 * one button. The slideshow this file used to step through is gone, so it
 * now checks what the hero promises instead: the page loads without a
 * runtime error or Next's "This page couldn't load" screen, the photograph
 * actually decodes, the one h1 is the hero line and names the shop, and the
 * button goes to the shop. */
test('the home hero renders its photograph, heading and button', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/', { waitUntil: 'networkidle' });

  const img = page.locator('.hh-img');
  await expect(img).toBeVisible();
  expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);

  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText(/for every woman who walks in/i);
  await expect(page.locator('h1')).toContainText(/b boutique/i);

  const cta = page.locator('.hh').getByRole('link', { name: /shop new in/i });
  await expect(cta).toHaveAttribute('href', '/shop');

  expect(errors, errors.join('\n')).toEqual([]);
  await expect(page.getByText(/couldn.t load/)).toHaveCount(0);
});
