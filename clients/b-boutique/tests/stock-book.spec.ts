import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/* The stock book, /stock/book (2026-10-10). Locally there is no database, so
   the page shows the not-ready screen; on a deployment it shows the passcode
   gate. Both are staff screens and both must be clean. The book itself needs
   the PIN and the live database, so it is checked by hand on a preview. */
test('/stock/book answers, is noindex, and has no WCAG A/AA violations', async ({ page }) => {
  const res = await page.goto('/stock/book');
  expect(res?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('main')).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
});

test('/stock/api/book refuses a stranger', async ({ request }) => {
  const get = await request.get('/stock/api/book');
  expect([401, 503]).toContain(get.status());
  const post = await request.post('/stock/api/book', { data: { action: 'add', entry: {} } });
  expect([401, 503]).toContain(post.status());
});
