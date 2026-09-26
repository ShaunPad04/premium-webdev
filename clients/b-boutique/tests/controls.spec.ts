import { expect, test } from '@playwright/test';

/* Controls Brad asked for on 2026-09-26, each checked where it lives. */

test('the product page opens with every fold closed', async ({ page }) => {
  await page.goto('/shop/fair-isle-jumper', { waitUntil: 'networkidle' });
  const folds = page.locator('details.pdp-fold');
  await expect(folds.first()).toBeVisible();
  expect(await folds.evaluateAll((ds) => ds.filter((d) => (d as HTMLDetailsElement).open).length)).toBe(0);
});

test('a New Arrivals size is a switch and rides on the link', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const size = page.locator('#new-in .ps-size').first();
  await size.scrollIntoViewIfNeeded();
  const label = (await size.textContent())!.trim();
  await expect(size).toHaveAttribute('aria-pressed', 'false');
  await size.click();
  await expect(size).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#new-in .ps-cta')).toHaveAttribute('href', new RegExp(`\\?size=${encodeURIComponent(label)}$`));
});

test('Up close: three fabrics, each linking to its piece', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const links = page.locator('.scw .scw-link');
  await expect(links).toHaveCount(3);
  expect(await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual([
    '/shop/cosy-hooded-boucle-coat',
    '/shop/fair-isle-jumper',
    '/shop/leopard-embroidered-velvet-bomber',
  ]);
});
