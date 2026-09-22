import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Routes to audit. Add each new page here as the site grows.
const ROUTES = [
  '/',
  '/clothing',
  /* A category page and a product page, named explicitly so the audit covers
     the two dynamic templates. Both were changed on 2026-09-22 when the 26
     invented products were replaced by the client's real stock: '/clothing/
     coats' and '/shop/charcoal-overcoat' no longer exist, and the suite
     failed on them rather than silently skipping, which is the behaviour to
     keep. Pick any real slug if these ever change again. */
  '/clothing/coats-jackets',
  '/accessories',
  '/homeware',
  '/about',
  '/contact',
  '/shop',
  '/shop/fair-isle-jumper',
  /* One whose price is still a placeholder: it renders a different control
     path (no bag button, an email link instead) and that path needs auditing
     too. */
  '/shop/paisley-fringe-belted-cardigan-vest',
  '/bag',
  /* Dynamic, and the state reachable without SumUp keys is the honest
     "we cannot confirm this" page — which is exactly the one a client demo
     shows, so it is audited like any other route. */
  '/checkout/success?ref=BB-TEST',
  '/delivery',
  '/returns',
  '/terms',
  '/privacy',
];

for (const route of ROUTES) {
  test(`${route} has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto(route);

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Print a readable failure rather than a wall of JSON.
    if (violations.length) {
      const report = violations
        .map((v) => `  [${v.impact}] ${v.id}: ${v.help}\n      ${v.nodes.map((n) => n.target.join(' ')).join('\n      ')}`)
        .join('\n');
      throw new Error(`${violations.length} accessibility violation(s) on ${route}:\n${report}`);
    }

    expect(violations).toEqual([]);
  });

  test(`${route} is keyboard navigable`, async ({ page }) => {
    await page.goto(route);
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName ?? null);
    expect(focused, 'nothing received focus on first Tab').not.toBeNull();
    expect(focused).not.toBe('BODY');
  });
}

/* The shop's search has two states the loop above never reaches, because both
   only exist after somebody types: a filtered grid, and the empty result with
   its own heading, chips and phone link. An empty state is exactly where a
   contrast or naming mistake hides — nobody looks at it until a customer
   does. So it is audited as a state, not as a route. */
test('/shop search: filtered results have no WCAG A/AA violations', async ({ page }) => {
  await page.goto('/shop');
  await page.locator('#shop-q').fill('coat');
  /* Five, not two. The count changed on 2026-09-22 when the 26 invented
     products were replaced by the client's real stock — and the assertion is
     kept as an exact number rather than loosened to toBeGreaterThan(0),
     because its job here is to prove the FILTER ACTUALLY RAN before axe
     looks at the page. A test that accepts any count passes just as happily
     against an unfiltered grid, which is the state it exists to rule out.
     Seven since the client's photographs arrived for the Leopard Embroidered
     Velvet Bomber and the Cosy Hooded Boucle Coat, both Coats & Jackets. */
  await expect(page.locator('.prod')).toHaveCount(7);

  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
});

test('/shop search: the empty result has no WCAG A/AA violations', async ({ page }) => {
  await page.goto('/shop');
  await page.locator('#shop-q').fill('wellingtons');
  await expect(page.locator('.find-empty')).toBeVisible();

  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
});
