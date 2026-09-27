import { expect, test } from '@playwright/test';

/* Controls Brad asked for on 2026-09-26, each checked where it lives. */

test('the product page opens with every fold closed', async ({ page }) => {
  await page.goto('/shop/fair-isle-jumper', { waitUntil: 'networkidle' });
  const folds = page.locator('details.pdp-fold');
  await expect(folds.first()).toBeVisible();
  expect(await folds.evaluateAll((ds) => ds.filter((d) => (d as HTMLDetailsElement).open).length)).toBe(0);
});

test('a New Arrivals size is a switch and rides on the link', async ({ page }, testInfo) => {
  /* Phones show one piece at a time with arrows and no sizes (2026-09-27,
     Brad's pick); the sizes live on the larger screens. */
  test.skip(testInfo.project.name === 'mobile', 'no sizes in New In on phones; see the arrows test');
  await page.goto('/', { waitUntil: 'networkidle' });
  const size = page.locator('#new-in .ps-size').first();
  await size.scrollIntoViewIfNeeded();
  const label = (await size.textContent())!.trim();
  await expect(size).toHaveAttribute('aria-pressed', 'false');
  await size.click();
  await expect(size).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#new-in .ps-cta')).toHaveAttribute('href', new RegExp(`\\?size=${encodeURIComponent(label)}$`));
});

test('New In on phones: one piece, no sizes, no arrows', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'phone layout only');
  await page.goto('/', { waitUntil: 'networkidle' });
  const cta = page.locator('#new-in .ps-cta');
  await cta.scrollIntoViewIfNeeded();
  await expect(cta).toBeVisible();
  await expect(page.locator('#new-in .ps-size').first()).toBeHidden();
  await expect(page.locator('#new-in .ps-step').first()).toBeHidden();
});

test('Up close: three fabrics, each linking to its piece', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const links = page.locator('.scw .scw-spec-link');
  await expect(links).toHaveCount(3);
  expect(await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual([
    '/shop/cosy-hooded-boucle-coat',
    '/shop/fair-isle-jumper',
    '/shop/leopard-embroidered-velvet-bomber',
  ]);
});
