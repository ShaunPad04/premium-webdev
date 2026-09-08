#!/usr/bin/env node
// Everything this site knows to be untrue about itself.
//
//   pnpm launch-check
//
// Exits 0 when nothing invented, unconfirmed or self-contradicting remains.
// Exits 1, with a list, when something does.
//
// ── Why this is a separate command, and NOT part of `pnpm verify` ─────────
// Today it fails, loudly, on ten counts. That is correct: the prices are
// invented and the client has not answered. But a gate that fails on every
// run for a known, correct reason trains people to ignore it, and `verify` is
// run several times a day. So the day-to-day gate stays green and honest
// about code quality, and this one is the thing you run before launch — and
// then actually read.
//
// ── What it cannot check ─────────────────────────────────────────────────
// Stated in the output every time, because a checklist that implies it is
// exhaustive is worse than no checklist:
//
//   - Whether a price is CORRECT. It can only see that one is no longer
//     flagged as invented. Somebody has to compare the list to hers.
//   - Whether the legal wording on the four selling-terms pages is right.
//     A developer wrote it; a solicitor has not read it.
//   - Whether a photograph is any good, or is even of the right garment.
//   - Whether the SumUp round trip works. That needs real credentials and a
//     real card, once.
//   - Whether the shop is registered with the ICO.

import { readFileSync, existsSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');

/** Lines carrying a flag as real object syntax, never as prose in a comment.
 *  The comment blocks in these files talk ABOUT `pending: true` at length, so
 *  a naive grep counts the documentation as data — it did, the first time. */
function flagCount(source, flag) {
  const re = new RegExp(`^\\s*${flag}:\\s*true\\s*,?\\s*$`);
  return source.split('\n').filter((l) => re.test(l)).length;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|css)$/.test(name)) out.push(full);
  }
  return out;
}

const blockers = [];
const notes = [];

const block = (label, detail) => blockers.push({ label, detail });

/* ── 1. Invented prices ─────────────────────────────────────────────────── */
/* The flag is written `demo: true as const`, so a line-anchored match for
   `true` alone found nothing and reported the single most dangerous file in
   the project as clean. The count comes from the price table itself. */
const catalogue = read('src/lib/catalogue.ts');
if (/\bdemo:\s*true\b/.test(catalogue)) {
  const priced = (catalogue.match(/priceP:\s*\d+/g) ?? []).length;
  block(
    `${priced} product${priced === 1 ? '' : 's'} still priced with invented figures`,
    'src/lib/catalogue.ts — every one is a price nobody agreed to. Published, it is a price the customer is entitled to pay.',
  );
}
if (/DELIVERY_IS_DEMO\s*=\s*true/.test(catalogue)) {
  block('The delivery charge is invented', 'src/lib/catalogue.ts — DELIVERY_IS_DEMO is still true.');
}

/* ── 2. Unanswered selling terms ────────────────────────────────────────── */
const policies = read('src/lib/policies.ts');
const slots = (policies.match(/kind:\s*"required"/g) ?? []).length;
if (slots > 0) {
  block(
    `${slots} unanswered question${slots === 1 ? '' : 's'} on the delivery, returns, terms and privacy pages`,
    'src/lib/policies.ts — each renders as a visible CLIENT INPUT REQUIRED slot to every visitor.',
  );
}
if (/legalEntity:\s*""/.test(policies)) {
  block(
    "The trader's legal identity is not set",
    'src/lib/policies.ts — a shop selling online has to show who is behind it: sole trader or company, and the number if there is one.',
  );
}

/* ── 3. Invented words ──────────────────────────────────────────────────── */
const pending = flagCount(read('src/lib/testimonials.ts'), 'pending');
if (pending > 0) {
  block(`${pending} invented testimonials`, 'src/lib/testimonials.ts — words attributed to customers who did not say them.');
}
for (const [file, label] of [
  ['src/lib/faq.ts', 'FAQ answers'],
  ['src/lib/about.ts', 'About paragraphs'],
]) {
  const n = flagCount(read(file), 'temporary');
  if (n > 0) block(`${n} unconfirmed ${label}`, `${file} — stated as shop policy or shop history, confirmed by nobody.`);
}
if (/NOT CONFIRMED STOCKISTS/.test(read('src/lib/brands.ts'))) {
  block(
    'The brands rail is still marked NOT CONFIRMED',
    'src/lib/brands.ts — naming a label the shop does not stock is a claim that gets a letter.',
  );
}

/* ── 4. Contactability ──────────────────────────────────────────────────── */
if (/email:\s*""/.test(read('src/lib/shop.ts'))) {
  block(
    'No email address',
    'src/lib/shop.ts — the privacy page has to give people a way to make a data request, and none exists.',
  );
}

/* ── 5. Photography ─────────────────────────────────────────────────────── */
const remote = (read('src/lib/images.ts').match(/_min\.webp/g) ?? []).length;
if (remote > 0) {
  block(
    `${remote} photographs are not vendored`,
    'src/lib/images.ts — they load from a CDN that may not outlive the project. Run `pnpm images` on a machine with normal internet, then LOOK at all of them.',
  );
}

/* ── 6. The privacy page's claims, which expire ─────────────────────────── */
/* /privacy states as fact that this site has no analytics, no tracking and no
   cookies. That was true when it was written and is one npm install away from
   being a false statement to every visitor. So it is re-checked here rather
   than trusted — which is the whole reason each block on that page cites the
   file it was read from. */
/* Every entry has to be something ordinary prose cannot contain. The first
   version of this list had the bare word "plausible" in it, and this project's
   own comments use "a plausible invention" and "never as plausible prose" —
   so it reported three source files as analytics and would have blocked a
   launch over a comment. A false alarm in a launch gate is not a harmless
   bug: it is how a gate stops being read. */
const TRACKERS = [
  'googletagmanager.com',
  'google-analytics.com',
  'gtag(',
  'plausible.io',
  'fbq(',
  'mixpanel.init',
  'static.hotjar.com',
  'clarity.ms',
  'cdn.segment.com',
  'posthog.init',
  'document.cookie',
];

/* Comments are stripped before scanning, so a file may still discuss these
   things — the privacy page's own citations do exactly that. */
const stripComments = (t) =>
  t.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');

const offenders = [];
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  const text = stripComments(readFileSync(file, 'utf8'));
  for (const t of TRACKERS) if (text.includes(t)) offenders.push(`${rel} → ${t}`);
}
if (offenders.length) {
  block(
    'The privacy page is now telling visitors something untrue',
    `It states this site runs no analytics and sets no cookies. Found: ${offenders.join(', ')}. Either remove it, or rewrite /privacy and add a consent banner.`,
  );
}

/* ── 7. Indexing, reported rather than judged ───────────────────────────── */
notes.push(
  process.env.ALLOW_INDEXING === 'true'
    ? 'ALLOW_INDEXING is true — the site WILL be indexed by search engines on the next deploy. Correct only if everything above is clear.'
    : 'ALLOW_INDEXING is not set, so the site stays noindex. That is what has been keeping invented prices out of Google. Set it last, deliberately, and confirm the deployed page after.',
);

/* ── Report ─────────────────────────────────────────────────────────────── */
const B = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const R = '\x1b[0m';

console.log(`\n${B}B Boutique — launch check${R}\n`);

if (blockers.length === 0) {
  console.log(`${GREEN}Nothing invented, unconfirmed or self-contradicting remains.${R}\n`);
} else {
  console.log(`${RED}${B}${blockers.length} blocker${blockers.length === 1 ? '' : 's'}.${R} None of these may ship.\n`);
  blockers.forEach((b, i) => {
    console.log(`  ${RED}${String(i + 1).padStart(2)}${R}  ${B}${b.label}${R}`);
    console.log(`      ${DIM}${b.detail}${R}\n`);
  });
}

for (const n of notes) console.log(`  ${DIM}note  ${n}${R}\n`);

console.log(`${DIM}This check cannot tell you whether a price is CORRECT, whether the legal
wording is sound, whether a photograph is of the right garment, whether the
SumUp round trip works, or whether the shop is registered with the ICO.
Those are read by a person. See CLAUDE.md.${R}\n`);

process.exit(blockers.length === 0 ? 0 : 1);
