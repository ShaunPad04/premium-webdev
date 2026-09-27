import { expect, test } from '@playwright/test';

/* The home hero must not crash, and must stay what Brad approved.
 *
 * Added 2026-09-22 after the live site showed Next's "This page couldn't
 * load" screen: SplitText rewrote the title's children, React later tried to
 * remove the originals, and the page crashed on the SECOND slide change. The
 * hero is one still frame now (the campaign horses, 2026-09-27), but a swipe
 * across it is still the gesture most likely to find a crash, so it stays. */
test.skip(({ viewport }) => (viewport?.width ?? 0) < 1200, 'desktop; the phone path was checked by hand');
test.setTimeout(60_000);

test('the campaign hero survives a swipe and shows one frame, one h1, one button', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/', { waitUntil: 'networkidle' });

  const hero = page.locator('.hx-c');
  const box = (await hero.boundingBox())!;
  const y = box.y + 300;
  for (let i = 0; i < 2; i++) {
    await page.mouse.move(box.x + box.width * 0.7, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.3, y, { steps: 6 });
    await page.mouse.up();
  }
  /* The product dots were removed (Brad, 26 Sep); none may come back. */
  await expect(page.locator('.lk-dot, .lk-spot')).toHaveCount(0);
  await expect(page.locator('.lk-look')).toHaveCount(0);
  expect(errors, errors.join('\n')).toEqual([]);
  await expect(page.getByText(/couldn.t load/)).toHaveCount(0);

  /* The page's one h1, and one button. */
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(hero.getByRole('link', { name: /shop all/i })).toBeVisible();
  /* The frame actually arrived, as the desktop art (not the phone crop). */
  const img = hero.locator('.hx-c-photo img');
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  expect(await img.evaluate((el: HTMLImageElement) => el.currentSrc)).toMatch(/horses-d/);
  /* The header starts see-through over the photograph. */
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('header').first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});
