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

test('the home hero survives a swipe and carries no product dots', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/', { waitUntil: 'networkidle' });

  /* The hero is the Fair Isle turn under the B Boutique masthead since
     2026-09-27 (Brad; the horses are kept in components/Hero.tsx). A swipe
     must not crash it. */
  const box = (await page.locator('.th').boundingBox())!;
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
  await expect(page.locator('.th .th-cta')).toBeVisible();
  /* She turns on her own (the stacked-alpha video drawn to a canvas), and
     the note saying the turn is generated stays on the page until the
     client has checked the back of the jumper against the real garment. */
  await expect(page.locator('.th-canvas[data-ready]')).toHaveCount(1, { timeout: 20_000 });
  await expect(page.locator('.th-note')).toBeVisible();
});
