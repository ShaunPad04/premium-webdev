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

  /* Five frames since 2026-09-24 (a slideshow again): swipe a full lap
     and one more, which is the sequence that crashed it in September. */
  const box = (await page.locator('.lm').boundingBox())!;
  const y = box.y + box.height * 0.3;
  const titles: string[] = [];
  for (let i = 0; i < 6; i++) {
    await page.mouse.move(box.x + box.width * 0.7, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.3, y, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(1900);
    titles.push((await page.locator('.lm-pic[data-on] img').getAttribute('src')) ?? '');
  }

  expect(errors, errors.join('\n')).toEqual([]);
  await expect(page.getByText(/couldn.t load/)).toHaveCount(0);
  // It really moved through the frames.
  expect(new Set(titles).size).toBeGreaterThan(1);
  await expect(page.locator('.lm-title')).toContainText(/b boutique/i);
});
