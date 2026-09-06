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
