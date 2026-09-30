import { expect, test } from '@playwright/test';

/* Controls Brad asked for on 2026-09-26, each checked where it lives. */

test('the product page opens with every fold closed', async ({ page }) => {
  await page.goto('/shop/fair-isle-jumper', { waitUntil: 'networkidle' });
  const folds = page.locator('details.pdp-fold');
  await expect(folds.first()).toBeVisible();
  expect(await folds.evaluateAll((ds) => ds.filter((d) => (d as HTMLDetailsElement).open).length)).toBe(0);
});

test('a Shop the collection size is a switch and rides on the link', async ({ page }, testInfo) => {
  /* The swipe slides, "Shop the collection" (#collection) since
     2026-09-29, when #new-in became the product grid above them. Phones
     show one piece at a time and no sizes; the sizes live on larger screens. */
  test.skip(testInfo.project.name === 'mobile', 'no sizes in New In on phones; see the arrows test');
  await page.goto('/', { waitUntil: 'networkidle' });
  /* A one-size piece has no size buttons, so step on to one that has; on
     these screens the next piece itself is the control (tabIndex 0). */
  const next = page.locator('#collection button.ps-model[tabindex="0"]').last();
  await next.scrollIntoViewIfNeeded();
  for (let i = 0; i < 10 && (await page.locator('#collection button.ps-size').count()) === 0; i++) {
    await next.click();
    await page.waitForTimeout(900);
  }
  const size = page.locator('#collection button.ps-size').first();
  await size.scrollIntoViewIfNeeded();
  const label = (await size.textContent())!.trim();
  await expect(size).toHaveAttribute('aria-pressed', 'false');
  await size.click();
  await expect(size).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#collection .ps-cta')).toHaveAttribute('href', new RegExp(`\\?size=${encodeURIComponent(label)}$`));
});

test('Shop the collection on phones: one piece, no sizes, no arrows', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'phone layout only');
  await page.goto('/', { waitUntil: 'networkidle' });
  const cta = page.locator('#collection .ps-cta');
  await cta.scrollIntoViewIfNeeded();
  await expect(cta).toBeVisible();
  await expect(page.locator('#collection .ps-size').first()).toBeHidden();
  await expect(page.locator('#collection .ps-step').first()).toBeHidden();
});

test('Up close: eight materials, each a close-up named by its material only', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  /* The tilted grid (2026-09-28): eight cards in order, each a link to its
     garment, named by its material, the image described by material and
     piece. The cards render their photographs only once the grid is near,
     so bring it close first. ScrollReset holds a fresh page still for
     700ms against any scroll no person made, so wait that out first. */
  await page.waitForTimeout(800);
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

