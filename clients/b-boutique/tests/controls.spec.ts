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

test('Up close: seven materials, each a close-up named by its material only', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  /* The Scroll Gallery (2026-09-27): seven full-bleed slides in order, each
     image described by its material and piece; the band names the one in
     view and links to its garment. */
  /* The slides render their photographs only once the gallery is near
     (2026-09-28), so bring it close first. */
  await page.evaluate(() => {
    const y = document.querySelector<HTMLElement>('.uc3')!.getBoundingClientRect().top + scrollY - innerHeight;
    const l = (window as unknown as { __lenis?: { scrollTo: (y: number, o: object) => void } }).__lenis;
    if (l) l.scrollTo(y, { immediate: true });
    else scrollTo(0, y);
  });
  await expect(page.locator('.uc3 .ucg-slide img')).toHaveCount(7);
  const alts = await page.locator('.uc3 .ucg-slide img').evaluateAll((els) => els.map((e) => e.getAttribute('alt')));
  expect(alts).toHaveLength(7);
  const order = ['velvet', 'bouclé', 'jacquard knit', 'lace', 'tweed check', 'chunky knit', 'velour'];
  alts.forEach((a, i) => expect(a).toMatch(new RegExp(`^Close-up of the ${order[i]} of the `)));
  await expect(page.locator('.uc3 .ucg-title')).toHaveText('Velvet');
  await expect(page.locator('.uc3 .ucg-link')).toHaveAttribute('href', '/shop/leopard-embroidered-velvet-bomber');
});

