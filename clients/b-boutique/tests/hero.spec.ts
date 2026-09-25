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

test('the lookbook hero survives a swipe and its pieces open to real pages', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/', { waitUntil: 'networkidle' });

  /* The lookbook hero (2026-09-25): one frame with a dot on each piece.
     A swipe must not crash it, and both pieces must open to their pages. */
  const box = (await page.locator('.lk').boundingBox())!;
  const y = box.y + box.height * 0.3;
  for (let i = 0; i < 2; i++) {
    await page.mouse.move(box.x + box.width * 0.7, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.3, y, { steps: 6 });
    await page.mouse.up();
  }
  /* Each dot is the link to its piece (Brad, 25 Sep): hover previews the
     card, a click lands on the product itself. */
  const dots = page.locator('.lk-dot');
  await expect(dots).toHaveCount(2);
  for (const href of await dots.evaluateAll((els) => els.map((e) => e.getAttribute('href')))) {
    const res = await page.request.get(href!);
    expect(res.status(), href!).toBe(200);
  }
  await dots.first().hover();
  await expect(page.locator('.lk-spot[data-open]')).toHaveCount(1);
  await expect(page.locator('.lk-look')).toHaveCount(0);
  expect(errors, errors.join('\n')).toEqual([]);
  await expect(page.getByText(/couldn.t load/)).toHaveCount(0);
  await expect(page.locator('.lk-title')).toBeVisible();
});
