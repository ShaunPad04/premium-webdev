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
  '/homeware',
  '/about',
  '/contact',
  '/faq',
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

/* The search has two states the loop above never reaches, because both
   only exist after somebody types: a list of matches, and the empty result
   with its own help text and chips. An empty state is exactly where a
   contrast or naming mistake hides, so each is audited as a state.

   Since 2026-09-26 both live in the header's search panel: the /shop page,
   whose field these tests used to drive, was removed at the client's request
   and every match is now listed in the panel itself. */
async function openSearch(page: import('@playwright/test').Page, q: string) {
  /* A plain text page, so nothing under the open panel skews the audit. */
  await page.goto('/delivery');
  await page.locator('.sdock-trigger').click();
  await page.locator('.sdock-input').fill(q);
}

test('search: the list of matches has no WCAG A/AA violations', async ({ page }) => {
  await openSearch(page, 'coat');
  /* An exact count, not toBeGreaterThan(0): it proves the filter ran before
     axe looks. Seven Coats & Jackets match "coat" in the client's stock. */
  await expect(page.locator('.navsearch-hit')).toHaveCount(7);

  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
});

test('search: the empty result has no WCAG A/AA violations', async ({ page }) => {
  await openSearch(page, 'wellingtons');
  await expect(page.locator('.navsearch-empty')).toBeVisible();

  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
});
