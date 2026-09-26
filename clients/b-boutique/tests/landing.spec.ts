import { expect, test, type Page } from '@playwright/test';

/* Every link lands where it says it goes.
 *
 * Added 2026-09-22 after the client clicked "View piece" and landed on a
 * product's FOOTER, twice, on the live site. It happens when the click comes
 * while the page is still gliding — which is how a person clicks — so every
 * test here clicks 250ms after scrolling, not once the page has settled. An
 * earlier check that waited for the page to go still passed while the bug
 * was live; that is the trap this file exists to keep shut.
 *
 * Desktop only: the landing logic is the same code at every width, and the
 * full sweep at three widths would triple the suite for no new information.
 * The mobile sweep was run by hand on 2026-09-22 (96 of 96). */

test.skip(({ viewport }) => (viewport?.width ?? 0) < 1200, 'desktop sweep');
test.setTimeout(240_000);

/** Wait until the scroll position stops changing, then return it. */
async function settle(page: Page) {
  let prev = -1;
  let cur = -2;
  for (let i = 0; i < 40 && prev !== cur; i++) {
    prev = cur;
    await page.waitForTimeout(120);
    cur = await page.evaluate(() => Math.round(window.scrollY));
  }
  return cur;
}

/** Scroll a link into view, and click it while the page is still moving. */
async function clickMidGlide(page: Page, href: string, scope = 'main') {
  await page.evaluate(
    ([h, s]) => [...document.querySelectorAll(`${s} a[href="${h}"]`)].pop()!.scrollIntoView({ block: 'center' }),
    [href, scope],
  );
  await page.waitForTimeout(250);
  await page.evaluate(
    ([h, s]) => ([...document.querySelectorAll(`${s} a[href="${h}"]`)].pop() as HTMLElement).click(),
    [href, scope],
  );
}

test('every product in the shop opens at the top of its page', async ({ page }) => {
  await page.goto('/clothing', { waitUntil: 'networkidle' });
  const products = await page.evaluate(() => [
    ...new Set([...document.querySelectorAll('main a[href^="/shop/"]')].map((a) => a.getAttribute('href')!)),
  ]);
  expect(products.length).toBeGreaterThan(20);

  const wrong: string[] = [];
  for (const href of products) {
    await page.goto('/clothing', { waitUntil: 'networkidle' });
    await clickMidGlide(page, href);
    await page.waitForURL(`**${href}`);
    const y = await settle(page);
    const h1Top = await page.evaluate(() => document.querySelector('h1')?.getBoundingClientRect().top ?? -1);
    if (y !== 0 || h1Top < 0 || h1Top > 900) wrong.push(`${href}: scrollY ${y}, h1 at ${Math.round(h1Top)}`);
  }
  expect(wrong, `products that did not open at the top:\n${wrong.join('\n')}`).toEqual([]);
});

/* The client's own report, reproduced exactly: scroll down to New In, click
   a product half a second later. On the code before the fix this landed
   every product ~1,830px down — at the footer. Keep this one verbatim. */
test('the reported bug: New In product clicked after scrolling opens at the top', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const hrefs = await page.evaluate(() => [
    ...new Set([...document.querySelectorAll('#new-in a[href^="/shop/"]')].map((a) => a.getAttribute('href')!)),
  ]);
  const wrong: string[] = [];
  for (const href of hrefs) {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelector('#new-in')!.scrollIntoView());
    await page.waitForTimeout(500);
    await page.evaluate((h) => (document.querySelector(`#new-in a[href="${h}"]`) as HTMLElement).click(), href);
    await page.waitForURL(`**${href}`);
    const y = await settle(page);
    if (y !== 0) wrong.push(`${href}: scrollY ${y}`);
  }
  expect(wrong, `New In products that did not open at the top:\n${wrong.join('\n')}`).toEqual([]);
});

test('a product in "You may also like" opens at the top', async ({ page }) => {
  await page.goto('/shop/fair-isle-jumper', { waitUntil: 'networkidle' });
  const href = await page.evaluate(
    () => [...document.querySelectorAll('main a[href^="/shop/"]')].map((a) => a.getAttribute('href')!).find((h) => h !== location.pathname)!,
  );
  await clickMidGlide(page, href);
  await page.waitForURL(`**${href}`);
  expect(await settle(page)).toBe(0);
});

test('Back returns to exactly where you were', async ({ page }) => {
  await page.goto('/clothing', { waitUntil: 'networkidle' });
  const href = await page.evaluate(() => {
    const links = [...document.querySelectorAll('main a[href^="/shop/"]')];
    const a = links[Math.floor(links.length * 0.7)];
    a.scrollIntoView({ block: 'center' });
    return a.getAttribute('href')!;
  });
  const left = await settle(page);
  expect(left).toBeGreaterThan(500);
  await page.evaluate((h) => ([...document.querySelectorAll(`main a[href="${h}"]`)].pop() as HTMLElement).click(), href);
  await page.waitForURL(`**${href}`);
  expect(await settle(page)).toBe(0);
  await page.goBack();
  expect(Math.abs((await settle(page)) - left)).toBeLessThanOrEqual(2);
});

test('a section link from another page lands on the section', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const a = document.createElement('a');
    a.href = '/#new-in';
    a.textContent = 'New In';
    document.body.appendChild(a);
    a.click();
  });
  await page.waitForURL('**/#new-in');
  await settle(page);
  const top = await page.evaluate(() => document.getElementById('new-in')!.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(-5);
  expect(top).toBeLessThanOrEqual(160);
});
