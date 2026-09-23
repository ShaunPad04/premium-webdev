import { expect, test } from '@playwright/test';

/* The home hero must survive changing slides.
 *
 * Added 2026-09-22 after the live site showed Next's "This page couldn't
 * load" screen: SplitText rewrote the title's children, React later tried to
 * remove the originals, and the page crashed on the SECOND slide change. The
 * first change passed, so a test that clicks once would not catch it. This
 * steps a full lap and one more. */
test.skip(({ viewport }) => (viewport?.width ?? 0) < 1200, 'desktop; the phone path was checked by hand');
test.setTimeout(60_000);

test('stepping through every slide does not crash the page', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/', { waitUntil: 'networkidle' });

  /* The Lumina list since 2026-09-23: the slide list along the foot is the
     control. Each change runs the 1.7s glass transition, so wait past it. */
  const titles: string[] = [];
  for (let i = 0; i < 6; i++) {
    await page.locator('.lm-item').nth((i + 1) % 5).click();
    await page.waitForTimeout(2200);
    titles.push((await page.locator('.lm-title .sr-only').textContent()) ?? '');
  }

  expect(errors, errors.join('\n')).toEqual([]);
  await expect(page.getByText(/couldn.t load/)).toHaveCount(0);
  // A full lap of five, then the first of the next: the titles really moved.
  expect(new Set(titles).size).toBe(5);
  expect(titles[5]).toBe(titles[0]);
});
