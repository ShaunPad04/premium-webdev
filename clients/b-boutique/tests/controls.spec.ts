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

test('Up close: eight materials, each a close-up named by its material only', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  /* The tilted grid (2026-09-28): eight cards in order, each a link to its
     garment, named by its material, the image described by material and
     piece. The cards render their photographs only once the grid is near,
     so bring it close first. */
  await page.evaluate(() => {
    const y = document.querySelector<HTMLElement>('.uc3')!.getBoundingClientRect().top + scrollY - innerHeight;
    const l = (window as unknown as { __lenis?: { scrollTo: (y: number, o: object) => void } }).__lenis;
    if (l) l.scrollTo(y, { immediate: true });
    else scrollTo(0, y);
  });
  await expect(page.locator('.uc3 .uct-card img')).toHaveCount(8);
  const order = ['Velvet', 'Bouclé', 'Fair Isle knit', 'Lace & ruffle', 'Tweed check', 'Chunky knit', 'Velour', 'Faux feather'];
  await expect(page.locator('.uc3 .uct-name')).toHaveText(order);
  const alts = await page.locator('.uc3 .uct-card img').evaluateAll((els) => els.map((e) => e.getAttribute('alt')));
  alts.forEach((a, i) => expect(a).toMatch(new RegExp(`^${order[i]} close-up, from the `)));
  await expect(page.locator('.uc3 .uct-tile').first()).toHaveAttribute('href', '/shop/leopard-embroidered-velvet-bomber');
  await expect(page.locator('.uc3 .uct-tile').last()).toHaveAttribute('href', '/shop/faux-feather-sleeveless-jumper');
});

