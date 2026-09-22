"use client";

import { useState } from "react";

/* The questions the client has to answer, as something she can fill in on a
 * phone.
 *
 * ── Why this is a page on her own site ───────────────────────────────────
 * She uses a phone and nothing else. That rules out the two obvious answers:
 * a printed sheet she writes on, and an HTML file emailed as an attachment —
 * mail apps on both platforms open those unreliably, often in a preview that
 * runs no JavaScript at all.
 *
 * What does work on a phone is a link in a text message. So this is a real
 * page: unlisted, noindex, nothing links to it, same arrangement as /stock.
 *
 * ── TEMPORARY ────────────────────────────────────────────────────────────
 * It answers a one-off question and it should be deleted once she has. The
 * whole thing is this folder — delete src/app/questions and it is gone, with
 * nothing left behind in globals.css or anywhere else. That is why the
 * styles are in the page rather than the stylesheet.
 */

/** ───────────────────────────────────────────────────────────────────────
 *  SET THIS before sending her the link: the address her answers go to.
 *  Left empty deliberately rather than guessed. While it is empty the
 *  button copies her answers to the clipboard instead, which works but
 *  makes her paste them into an email herself — three steps on a phone
 *  instead of one.
 *  ─────────────────────────────────────────────────────────────────────── */
const SEND_TO = "";

const PRICES: [string, string][] = [
  ["Paisley Fringe Belted Cardigan Vest", "Burgundy"],
  ["Paisley Fringe Belted Cardigan Vest", "Brown"],
  ["Fine Knit Jumper With Asymmetric Hem", "Brown"],
  ["Fine Knit Jumper With Asymmetric Hem", "Taupe"],
  ["Lace Blouse With Layered Ruffle", "Burgundy"],
  ["Lace Blouse With Layered Ruffle", "Brown"],
  ["Striped Fuzzy Zip Up Jumper", "Taupe"],
  ["Striped Fuzzy Zip Up Jumper", "Red"],
  ["Paisley Oversized Knitted Jumper", "Brown"],
  ["Paisley Oversized Knitted Jumper", "Burgundy"],
  ["Plaid Check Hooded Jacket", "Beige"],
  ["Piping Detail Denim Jacket & Trouser Set", "Denim Blue"],
  ["Italian Knit Ribbed Cardigan", "Cream"],
];

const FAQS: [string, string][] = [
  [
    "Do you offer alterations?",
    "Yes, for pieces bought in the shop. Hems and simple adjustments are usually turned around within the week, and we will tell you honestly if a garment is not worth altering.",
  ],
  [
    "Can you hold an item for me?",
    "We can put something aside for a couple of days while you think about it. Ask in the shop and we will keep it behind the counter with your name on it.",
  ],
  [
    "Do you sell gift cards?",
    "Yes, in any amount, and they can be used against anything in the shop. They are bought and redeemed in person.",
  ],
];

const ABOUTS: [string, string][] = [
  [
    "How you choose what goes on the rails",
    "Pieces are picked one at a time rather than ordered by the pack, which is why you will rarely see the same jacket twice on the same street. If something does not hang properly on a real person it does not go on the rail. The buy leans towards natural cloth and clothes that outlast the season they were bought in — wool, linen, cotton, silk.",
  ],
  [
    "What happens when somebody comes in",
    "Nobody follows you round the shop. If you want to be left alone to look, that is the default; if you want an honest opinion on whether something suits you, ask and you will get one, including when the answer is no.",
  ],
];

type Answers = Record<string, string>;

export function QuestionsForm() {
  const [a, setA] = useState<Answers>({});
  const [done, setDone] = useState<string | null>(null);
  const set = (k: string, v: string) => setA((prev) => ({ ...prev, [k]: v }));

  /* How many of the 21 things she has actually answered. On a phone this
     page is a long scroll, and a long scroll with no sense of progress is
     one people abandon halfway. */
  const total = PRICES.length + 3 + FAQS.length + ABOUTS.length;
  const answered =
    PRICES.filter((_, i) => (a[`p${i}`] ?? "").trim()).length +
    ["q1", "q2", "q3"].filter((k) => a[k]).length +
    FAQS.filter((_, i) => a[`f${i}`]).length +
    ABOUTS.filter((_, i) => a[`a${i}`]).length;

  function gather() {
    const pick = (k: string) => a[k] || "(not answered)";
    const typed = (k: string) => (a[k] ?? "").trim() || "(nothing written)";
    const out = ["HAYLEY'S ANSWERS — B Boutique", ""];

    out.push("PRICES");
    PRICES.forEach(([item, colour], i) => {
      const v = (a[`p${i}`] ?? "").trim();
      out.push(`  ${item} — ${colour}: ${v ? `£${v}` : "(not answered)"}`);
    });

    out.push("", "ONLINE ORDERS");
    out.push(`  1. Order becomes an agreement when posted: ${pick("q1")}`);
    out.push(`  2. If it has already gone: ${pick("q2")}`);
    out.push(`     In her words: ${typed("q2text")}`);
    out.push(`  3. Enquiries 6 months / orders 6 years: ${pick("q3")}`);

    out.push("", "THE THREE ANSWERS ON THE WEBSITE");
    FAQS.forEach(([q], i) => {
      out.push(`  ${q} — ${pick(`f${i}`)}`);
      out.push(`     Correction: ${typed(`ft${i}`)}`);
    });

    out.push("", "THE TWO ABOUT PARAGRAPHS");
    ABOUTS.forEach(([h], i) => {
      out.push(`  ${h} — ${pick(`a${i}`)}`);
      out.push(`     Instead: ${typed(`at${i}`)}`);
    });

    return out.join("\n");
  }

  async function send() {
    const text = gather();

    /* Copied every time, even when the email opens: a long answer can
       overflow what a mailto link carries, and if it arrives truncated the
       whole thing is still on the clipboard.
     *
     * STARTED, not awaited, and started BEFORE the navigation. Safari on iOS
     * grants clipboard access on the strength of the user gesture that is
     * still running, and an `await` before the call can end that gesture and
     * get it refused. Calling it synchronously here keeps both this and the
     * mailto inside the same tap. */
    const copied = navigator.clipboard
      ?.writeText(text)
      .catch(() => {
        /* Refused, or an older browser with no clipboard at all. Not worth
           telling her about — the email is the path that matters. */
      });

    if (SEND_TO) {
      window.location.href =
        `mailto:${encodeURIComponent(SEND_TO)}` +
        `?subject=${encodeURIComponent("Hayley's answers — B Boutique")}` +
        `&body=${encodeURIComponent(text)}`;
      setDone(
        "Your email should be opening now. If it does not, your answers have also been copied — paste them into a message.",
      );
    } else {
      setDone("Your answers have been copied. Paste them into an email and send them over.");
    }

    await copied;
  }

  const YesNo = ({
    name,
    yes = "Yes",
    no = "No",
  }: {
    name: string;
    yes?: string;
    no?: string;
  }) => (
    <div className="qf-choice">
      {[yes, no].map((label) => (
        <label key={label} className={a[name] === label ? "is-on" : ""}>
          <input
            type="radio"
            name={name}
            checked={a[name] === label}
            onChange={() => set(name, label)}
          />
          {label}
        </label>
      ))}
    </div>
  );

  return (
    <div className="qf">
      <h1 className="qf-h1">Questions for Hayley</h1>
      <p className="qf-sub">B Boutique — the website is nearly finished</p>

      <p>
        Hayley — there are a few things only you can answer, because they are about
        your shop and we must not guess at them.
      </p>
      <p>
        <strong>13 prices and 8 questions.</strong> Take your time. You can stop and
        come back, as long as you do not close this page.
      </p>

      {/* 1 ── PRICES */}
      <h2 className="qf-h2">1. Prices — 13 to fill in</h2>
      <p>
        Everything else in your shop already has a price. These 13 do not, so the
        website cannot sell them yet — it shows them as &ldquo;Price to confirm&rdquo;
        and will not let anyone buy one.
      </p>
      <p className="qf-note">
        If both colours of something are the same price, just put the same number in
        both.
      </p>

      <ul className="qf-prices">
        {PRICES.map(([item, colour], i) => (
          <li key={`${item}-${colour}`}>
            <label htmlFor={`p${i}`}>
              <span className="qf-item">{item}</span>
              <span className="qf-colour">{colour}</span>
            </label>
            <div className="qf-money">
              <span aria-hidden="true">£</span>
              <input
                id={`p${i}`}
                type="text"
                inputMode="decimal"
                value={a[`p${i}`] ?? ""}
                onChange={(e) => set(`p${i}`, e.target.value)}
                aria-label={`Price for ${item} in ${colour}, in pounds`}
              />
            </div>
          </li>
        ))}
      </ul>

      {/* 2 ── ONLINE ORDERS */}
      <h2 className="qf-h2">2. Three questions about online orders</h2>

      <h3 className="qf-h3">When is an order a done deal?</h3>
      <p>Somebody buys something on the website. At what point is it a proper agreement?</p>
      <p>We would like the website to say this:</p>
      <blockquote className="qf-quote">
        Your order is an offer to buy. It becomes an agreement once we have checked we
        have your piece and it is on its way — not the moment your card is paid.
      </blockquote>
      <p>
        <strong>Your stock page already catches nearly all of this.</strong> When you
        tap <em>Sold</em>, the website stops offering that piece straight away.
      </p>
      <p>
        This is the belt-and-braces for the rare times it can still happen: two people
        paying at the same moment, or something selling in the shop before you have had
        a chance to tap it. If it does, these words mean you simply refund them and
        apologise.
      </p>
      <p className="qf-ask">Are you happy for us to put that on the website?</p>
      <YesNo name="q1" />

      <h3 className="qf-h3">What do you say if it has already gone?</h3>
      <p>Somebody has ordered something you have not got any more.</p>
      <div className="qf-choice qf-stack">
        {[
          "Refund them straight away, then ring to apologise",
          "Ring them first and offer something similar",
          "Something else — written below",
        ].map((label) => (
          <label key={label} className={a.q2 === label ? "is-on" : ""}>
            <input
              type="radio"
              name="q2"
              checked={a.q2 === label}
              onChange={() => set("q2", label)}
            />
            {label}
          </label>
        ))}
      </div>
      <p>
        In your own words, if you would rather. Whatever you write goes on the website
        word for word, so say it how you would say it:
      </p>
      <textarea
        value={a.q2text ?? ""}
        onChange={(e) => set("q2text", e.target.value)}
        aria-label="What you would say if an item has already gone"
      />

      <h3 className="qf-h3">How long do you keep people&rsquo;s details?</h3>
      <p>You said six months. That is fine for emails and enquiries, and it is your choice.</p>
      <p>
        But for actual <strong>orders</strong>, the taxman normally expects business
        records kept for <strong>six years</strong>. Throwing an order away after six
        months would put you the wrong side of that.
      </p>
      <p className="qf-ask">
        Can we say: enquiries kept six months, orders kept six years?
      </p>
      <YesNo name="q3" />

      {/* 3 ── FAQ */}
      <h2 className="qf-h2">3. Three things we have written — are they true?</h2>
      <p className="qf-note">
        The website answers common questions. We wrote these three as a best guess so
        the page was not empty. <strong>We need you to tell us if they are right</strong>,
        because at the moment the website is telling customers things you never said.
      </p>

      {FAQS.map(([q, ans], i) => (
        <div key={q}>
          <h3 className="qf-h3">&ldquo;{q}&rdquo;</h3>
          <blockquote className="qf-quote">{ans}</blockquote>
          <YesNo name={`f${i}`} yes="Yes, that is right" no="No, that is not right" />
          <p className="qf-small">If it needs changing, what should it say?</p>
          <textarea
            value={a[`ft${i}`] ?? ""}
            onChange={(e) => set(`ft${i}`, e.target.value)}
            aria-label={`Correction for: ${q}`}
          />
        </div>
      ))}

      {/* 4 ── ABOUT */}
      <h2 className="qf-h2">4. Two bits about the shop — do these sound like you?</h2>
      <p>
        These are on the &ldquo;About&rdquo; page, written in your voice. We made them up
        to fill the space, and they are on there now sounding like you said them.
      </p>

      {ABOUTS.map(([h, body], i) => (
        <div key={h}>
          <h3 className="qf-h3">{h}</h3>
          <blockquote className="qf-quote">{body}</blockquote>
          <YesNo name={`a${i}`} yes="Yes, that sounds like me" no="No, I would put it differently" />
          <p className="qf-small">What would you say instead?</p>
          <textarea
            value={a[`at${i}`] ?? ""}
            onChange={(e) => set(`at${i}`, e.target.value)}
            aria-label={`What you would say instead for: ${h}`}
          />
        </div>
      ))}

      {/* 5 ── ICO */}
      <h2 className="qf-h2">5. One thing to check — not about the website</h2>
      <p>
        There is a government office called the <strong>ICO</strong> — the Information
        Commissioner&rsquo;s Office. Most businesses that keep customer names, addresses
        and emails have to register with them and pay a small yearly fee.
      </p>
      <p>
        Once the website is taking orders you will be keeping customer details, so it is
        worth checking whether you need to register. Their page explains it and tells you
        the fee:
      </p>
      <p>
        <a
          className="qf-link"
          href="https://ico.org.uk/for-organisations/data-protection-fee/"
          target="_blank"
          rel="noopener noreferrer"
        >
          ico.org.uk — the data protection fee
        </a>
      </p>
      <p>
        You would register as a <strong>sole trader trading as B Boutique Cleethorpes</strong>.
        There is no company number to look up.
      </p>
      <p>Nothing to fill in here — we just did not want it to be a surprise later.</p>

      {/* Sticky, because on a phone this page is a long scroll and a button at
          the very bottom is a button found by accident. */}
      <div className="qf-send">
        <p className="qf-progress" aria-live="polite">
          {answered} of {total} answered
        </p>
        <button type="button" className="qf-btn" onClick={send}>
          Send my answers
        </button>
        {done ? (
          <p className="qf-done" role="status">
            {done}
          </p>
        ) : null}
      </div>
    </div>
  );
}
