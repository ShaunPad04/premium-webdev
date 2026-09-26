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

test('the lookbook hero survives a swipe and carries no product dots', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/', { waitUntil: 'networkidle' });

  /* The lookbook hero (2026-09-25): one frame. A swipe must not crash it. */
  const box = (await page.locator('.lk').boundingBox())!;
  const y = box.y + box.height * 0.3;
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
  await expect(page.locator('.lk-title')).toBeVisible();
});
