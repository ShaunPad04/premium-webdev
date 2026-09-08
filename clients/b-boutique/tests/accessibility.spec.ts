import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Routes to audit. Add each new page here as the site grows.
const ROUTES = [
  '/',
  '/clothing',
  '/clothing/coats',
  '/accessories',
  '/about',
  '/contact',
  '/shop',
  '/shop/charcoal-overcoat',
  '/bag',
  /* Dynamic, and the state reachable without SumUp keys is the honest
     "we cannot confirm this" page — which is exactly the one a client demo
     shows, so it is audited like any other route. */
  '/checkout/success?ref=BB-TEST',
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
  await expect(page.locator('.prod')).toHaveCount(2);

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
