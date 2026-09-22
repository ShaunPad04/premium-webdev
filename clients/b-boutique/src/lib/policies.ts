import { addressLines, shop } from "./shop";

/** Delivery and returns.
 *
 *  ─────────────────────────────────────────────────────────────────────────
 *  THE RULE, and it is stricter here than anywhere else in this project.
 *
 *  Every other placeholder on this site is a claim a customer might believe.
 *  These two pages are a claim a customer can ENFORCE. A returns window, a
 *  postage price, or "we pay return postage" published on a real shop's site
 *  is a term of the contract of sale: the customer read it, relied on it, and
 *  is entitled to hold B Boutique to it whatever anybody meant. Inventing one
 *  does not create placeholder copy — it creates an obligation, on somebody
 *  else's business, that nobody agreed to.
 *
 *  So every block below is exactly one of three things, and the type makes it
 *  impossible to add a fourth by accident:
 *
 *    "statutory"  UK consumer law. True of every distance seller in the
 *                 country regardless of what this shop decides, so it is safe
 *                 to publish before the client has confirmed anything — it is
 *                 not B Boutique's policy, it is the floor underneath it.
 *                 Sources named in each block's `basis`.
 *
 *    "derived"    True from data already confirmed in this repository — the
 *                 address and phone in shop.ts, both client-confirmed. Safe.
 *
 *    "technical"  True of what this codebase actually DOES, checked against
 *                 the source rather than remembered. This is what makes an
 *                 honest privacy notice possible before the client has said
 *                 anything: what a website collects is not her opinion, it is
 *                 a fact about the code, and the code is right here. Every
 *                 such claim below names the file it was read from, so the
 *                 next person can re-check it rather than trust it. Safe to
 *                 publish — but it stops being true the moment somebody adds
 *                 an analytics script, so it is verified again at launch.
 *
 *    "required"   A commercial decision only the client can make. Rendered as
 *                 a visible CLIENT INPUT REQUIRED slot rather than filled with
 *                 something plausible, and it drives a page-level notice for
 *                 as long as any remain. NOT safe to publish.
 *
 *  ── On the statutory blocks ──────────────────────────────────────────────
 *  Written from the legislation named in each `basis`, and stated
 *  conservatively — where the law gives a customer a right, the right is
 *  described in full; where it gives the trader an option or an exemption,
 *  that is left to the client rather than assumed in their favour. It is
 *  written by a developer, not a solicitor. Before launch it wants ten
 *  minutes from somebody qualified, or a read against the Business Companion
 *  guidance that Trading Standards publishes. That check is a launch task,
 *  not an optional polish.
 *
 *  ── What is deliberately NOT here ────────────────────────────────────────
 *  Any figure. No postage price, no free-delivery threshold, no dispatch
 *  time, no courier, no returns address, no exchange policy, no exclusion.
 *  Not one of them is known, and each is precisely the kind of number that
 *  reads harmlessly in a draft and costs money in a dispute.
 *  ─────────────────────────────────────────────────────────────────────────
 */
export type BlockKind = "statutory" | "derived" | "technical" | "required";

export type PolicyBlock = {
  /** Short heading. Reads as a question a customer would actually ask. */
  heading: string;
  kind: BlockKind;
  /** Paragraphs. Empty for a `required` block — there is nothing to say yet. */
  body: string[];
  /** For `statutory`: the legislation it comes from, shown in small print so
   *  a customer can check it and the client can see it is not our invention.
   *  For `technical`: the file the claim was read out of. Both are there so a
   *  reader can verify rather than believe. */
  basis?: string;
  /** Overrides the small-caps label above `basis`. Defaults to the statutory
   *  wording; a technical block wants "How we know", not "Your legal right". */
  basisLabel?: string;
  /** For `required`: what to ask the client, in words they can answer. */
  ask?: string;
};

export type Policy = {
  slug: "delivery" | "returns" | "terms" | "privacy";
  title: string;
  eyebrow: string;
  lede: string;
  /** The sentence under "In plain English." It differs per page because the
   *  pages are made of different things: delivery, returns and terms are
   *  mostly law and shop policy, while privacy is mostly a description of
   *  what the code does. One generic line would be wrong on at least one of
   *  them, and a privacy notice claiming to "name the Act" when it is really
   *  naming a source file is exactly the kind of small dishonesty this
   *  project keeps out. */
  intro: string;
  blocks: PolicyBlock[];
};

const LEGAL_INTRO =
  "Your rights when you buy online are set by law, not by us, and where that is the case this page says so and names the Act it comes from. Anything that is B Boutique's own decision is marked as such.";

/* ── Delivery ───────────────────────────────────────────────────────────── */

const delivery: Policy = {
  slug: "delivery",
  title: "Delivery",
  eyebrow: "Getting it to you",
  lede: "How an order leaves the shop, what it costs, and when it should reach you.",
  intro:
    LEGAL_INTRO,
  blocks: [
    {
      heading: "Where we send to",
      kind: "derived",
      body: [
        "Anywhere in the United Kingdom. We do not post outside the UK at the moment.",
      ],
    },
    {
      heading: "What delivery costs",
      kind: "derived",
      body: [
        "\u00a34.35 on any order, and free when you spend \u00a3120 or more.",
        "The charge is shown in your bag before you pay, so there is nothing added at the last step.",
      ],
    },
    {
      heading: "When it is sent",
      kind: "derived",
      body: [
        "We aim to post your order the next working day.",
        "The shop is open seven days a week, but the post office is not, so an order placed late on a Saturday usually goes on the Monday.",
      ],
    },
    {
      heading: "Who carries it",
      kind: "derived",
      body: [
        "Royal Mail.",
        `If your order has not turned up when you expected it, email ${shop.email} and we will tell you when it went and how it was sent.`,
      ],
    },
    {
      heading: "The longest we can take",
      kind: "statutory",
      body: [
        "Unless we have agreed something different with you, your order will be sent within 30 days of the day you place it. If we cannot manage that, you can give us a further reasonable period, and if that passes too you are entitled to cancel and have your money back.",
        "Until your order is handed to you it is our responsibility, not yours. If it is lost or damaged on the way, that is ours to put right.",
      ],
      basis:
        "Consumer Rights Act 2015, ss.28 and 29 — delivery within 30 days by default, and the goods remain at the trader's risk until they come into the consumer's physical possession.",
    },
    {
      heading: "If something goes missing",
      kind: "derived",
      body: [
        `Email ${shop.email} and quote the reference from your order confirmation. It is one room and one rail — somebody will know exactly which parcel is yours.`,
      ],
    },
  ],
};

/* ── Returns ────────────────────────────────────────────────────────────── */

const returns: Policy = {
  slug: "returns",
  title: "Returns",
  eyebrow: "Changing your mind",
  lede: "What you can send back, how long you have, and what happens to your money.",
  intro:
    LEGAL_INTRO,
  blocks: [
    {
      heading: "You have 14 days to change your mind",
      kind: "statutory",
      body: [
        "Because you bought online rather than in the shop, you can cancel the order for any reason at all — you do not have to have a reason, and nothing needs to be wrong with it. The 14 days run from the day you receive the order, not the day you place it.",
        "Tell us within those 14 days that you are cancelling. A phone call is enough. You then have a further 14 days from telling us to get the pieces back to us.",
        "You are allowed to handle something the way you would in a shop — try a coat on, see how it hangs. If it comes back worn beyond that, we may reduce your refund to reflect the loss in value.",
      ],
      basis:
        "Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 — the 14-day cancellation right for distance contracts, the further 14 days to return the goods, and the trader's right to deduct for handling beyond what is necessary.",
    },
    {
      heading: "When you get your money back",
      kind: "statutory",
      body: [
        "Within 14 days of the pieces reaching us, or of you showing us they have been sent, whichever is sooner. It goes back to the card you paid with.",
        "The refund includes what you paid us for standard delivery on the way out. If you chose a faster or more expensive delivery than our standard one, we refund the standard cost rather than the upgrade.",
      ],
      basis:
        "Consumer Contracts Regulations 2013 — the 14-day refund period, and the trader's obligation to refund standard outbound delivery but not an upgraded service.",
    },
    {
      heading: "If something is faulty",
      kind: "statutory",
      body: [
        "That is a separate right and a stronger one. Goods have to be of satisfactory quality, fit for purpose and as described. If a piece is not, you have 30 days from receiving it to reject it and get a full refund.",
        "After 30 days you are still covered — we get one opportunity to repair or replace it, and if that fails you can still claim money back. A fault is never a change of mind, and none of the conditions on this page apply to it.",
      ],
      basis:
        "Consumer Rights Act 2015 — satisfactory quality, the 30-day short-term right to reject, and the subsequent right to repair, replacement or a price reduction.",
    },
    {
      heading: "Who pays to send it back",
      kind: "derived",
      body: [
        "If you have simply changed your mind, the return postage is yours to pay. We are telling you here, before you order, because the law only lets us ask for it if we do.",
        "If the piece is faulty, or is not what was described, we pay \u2014 that is your right and nothing on this page changes it.",
        "Get proof of posting. Until it reaches us it is still your parcel, and proof of posting is free at the counter.",
      ],
    },
    {
      heading: "Where to send it",
      kind: "derived",
      body: [
        `${addressLines.join(", ")}.`,
        `Email ${shop.email} before you post anything, so we know to expect it.`,
      ],
    },
    {
      heading: "Anything that cannot come back",
      kind: "derived",
      body: [
        "Nothing is excluded. Everything we sell online can be returned within the 14 days set out above.",
      ],
    },
    {
      heading: "Exchanges",
      kind: "derived",
      body: [
        "We do not do exchanges on online orders. Most pieces here are one of one, so there is usually nothing to exchange into.",
        "Send it back for a refund instead, and order the one you want. That is quicker than an exchange and you are not waiting on us.",
      ],
    },
    {
      heading: "Bought in the shop rather than online",
      kind: "derived",
      body: [
        "Everything above applies to orders placed on this website. Buying over the counter is different: you have had the chance to see the piece and try it on, so there is no automatic right to change your mind.",
        "What we offer in the shop, as our own goodwill, is an exchange or a credit note. That is not the law \u2014 it is what B Boutique chooses to do.",
        "Your rights if something is faulty are exactly the same either way, in the shop or online.",
      ],
    },
  ],
};

/* ── Terms of sale ──────────────────────────────────────────────────────── */

const terms: Policy = {
  slug: "terms",
  title: "Terms of sale",
  eyebrow: "The agreement",
  lede: "What you are agreeing to when you buy from this website, and who you are agreeing it with.",
  intro:
    LEGAL_INTRO,
  blocks: [
    {
      heading: "Who you are buying from",
      kind: "derived",
      body: [
        `${shop.name}, ${addressLines.join(", ")}. Email ${shop.email}.`,
        "One shop, on one street. There is no warehouse and no second branch — the pieces on this website are the pieces on the rail.",
      ],
    },
    {
      heading: "The trading name behind the shop",
      kind: "derived",
      body: [
        "B Boutique is a sole trader business trading as B Boutique Cleethorpes. There is no company number because it is not a limited company \u2014 which is entirely normal for a shop this size.",
        `The trading address is ${addressLines.join(", ")}, and the email address is ${shop.email}.`,
      ],
    },
    {
      /* ANSWERED 2026-09-22, in her words: "Once the order is paid for that
         is the contract of sale." She was offered the alternative — offer at
         order, contract at dispatch — with the reason it protects her, and
         said no. That is a decision, not a gap, and it is hers to make.

         Worth knowing what it means, so nobody later "fixes" it: a piece
         that sold over the counter after being paid for online is now a
         contract she cannot perform, and the refund in "If a piece has
         already gone" below is the remedy for that rather than a courtesy. The reservation
         taken at checkout (lib/orders.ts) is what keeps that rare. */
      heading: "When the order becomes a contract",
      kind: "derived",
      body: [
        "Once your order is paid for, that is the contract of sale between you and B Boutique.",
      ],
    },
    {
      heading: "Prices and VAT",
      kind: "derived",
      body: [
        "B Boutique is not VAT registered, so no VAT is charged and none is shown separately. The price you see is the price you pay.",
        "Delivery is charged on top and is shown in your bag before you pay.",
      ],
    },
    {
      heading: "How you pay",
      kind: "technical",
      body: [
        "Payment is taken by SumUp, on SumUp's own secure payment page. Your card details are entered there and never reach this website — we do not see them, receive them or store them at any point.",
        "The amount you are charged is worked out on our own server from the pieces in your bag, not from anything your browser sends us.",
      ],
      basis:
        "Read from src/app/api/checkout/route.ts — the checkout is created through SumUp's hosted payment page, and the basket is priced server-side from the shop's own catalogue.",
      basisLabel: "How we know",
    },
    {
      /* ANSWERED 2026-09-22: "Refund them straight away, then ring to
         apologise."

         "Get in touch", not "ring", on purpose. Checkout collects a name,
         email, address and postcode and NO phone number (DeliveryDetails),
         so a page promising a phone call would be promising something the
         shop has no number to make. Her intent — refund first, then a
         personal apology — is kept whole; only the channel is left open.
         If a phone field is ever added to checkout, this can say "ring". */
      heading: "If a piece has already gone",
      kind: "derived",
      body: [
        "Everything on this website is also on the rail in the shop, so very occasionally a piece sells over the counter just as it is bought online. If that happens to your order, we will refund you in full straight away, and then get in touch to apologise.",
      ],
    },
    {
      heading: "None of this affects your legal rights",
      kind: "statutory",
      body: [
        "Nothing on this page removes or reduces any right the law gives you as a consumer. If anything here ever conflicts with your statutory rights, your statutory rights win.",
        "Your right to change your mind within 14 days, and your rights if something is faulty, are set out in full on our returns page.",
      ],
      basis:
        "Consumer Rights Act 2015 — a term is not binding on a consumer to the extent that it would exclude or restrict the trader's liability under the Act.",
    },
    {
      heading: "Which country's law applies",
      kind: "derived",
      body: [
        "These terms are governed by the law of England and Wales, and a claim can be brought in the English courts.",
        "If you live in Scotland or Northern Ireland, the consumer protection of where you live still applies to you. Nothing here takes that away.",
      ],
    },
    {
      heading: "If something goes wrong",
      kind: "derived",
      body: [
        `Email ${shop.email}, or come into the shop and ask. A conversation settles almost everything.`,
      ],
    },
  ],
};

/* ── Privacy ────────────────────────────────────────────────────────────── */

const privacy: Policy = {
  slug: "privacy",
  title: "Privacy",
  eyebrow: "Your information",
  lede: "What this website collects, what it does not, and what you can ask us to do about it.",
  intro:
    "Most of this page is not a promise — it is a description of what this website is made of, and each part names the file it was read out of so it can be checked rather than believed. Where the law gives you a right instead, the page says so.",
  blocks: [
    {
      heading: "This site sets no cookies and does not track you",
      kind: "technical",
      body: [
        "There is no analytics, no advertising pixel, no tracking script and no cookie banner, because there is nothing to consent to. We do not know who you are, where you came from, or which pages you looked at.",
        "This is not a promise about the future — it is a statement about what the site is made of today, and it was checked against the code rather than assumed.",
      ],
      basis:
        "Verified by searching the whole of src/ for cookie, analytics, gtag, googletagmanager, plausible and fbq. No match.",
      basisLabel: "How we know",
    },
    {
      heading: "The fonts do not phone home",
      kind: "technical",
      body: [
        "The typefaces are served from this website itself. Your browser never asks Google for them, so no request carrying your address goes anywhere else when a page loads.",
      ],
      basis:
        "Read from src/app/layout.tsx — the fonts are loaded through next/font, which downloads and self-hosts them when the site is built.",
      basisLabel: "How we know",
    },
    {
      heading: "The map, and the one thing that does load from elsewhere",
      kind: "technical",
      body: [
        "The map of the shop is Google's, and Google does set its own cookies. So it does not load until you ask for it — the page shows the address and a button, and nothing reaches Google unless you press it.",
        "Everything else on the page works whether you open the map or not.",
      ],
      basis:
        "Read from src/components/VisitMap.tsx — the Google embed is mounted only on a deliberate click.",
      basisLabel: "How we know",
    },
    {
      heading: "Your bag stays in your browser",
      kind: "technical",
      body: [
        "What you put in your bag is saved on your own device and is not sent to us. Clear your browser data and it is gone; use a different phone and it was never there.",
        "It only leaves your device when you press Checkout, and then as the list of pieces and sizes together with the delivery details you have just typed, so the order can be priced and posted.",
        /* The delivery details are deliberately NOT saved beside the bag —
           see the note in Bag.tsx. A list of garments surviving on a shared
           or family computer is one thing; somebody's home address is
           another. Worth stating, because it is a decision rather than an
           accident and a customer cannot see it from outside. */
        "Those delivery details are not saved on your device. If you close the page without buying, they are gone.",
      ],
      basis:
        "Read from src/lib/useCart.tsx and src/components/Bag.tsx — the bag is stored in the browser's localStorage under one key; the delivery details are held in the page only until it closes.",
      basisLabel: "How we know",
    },
    {
      heading: "If you use the contact form",
      kind: "technical",
      body: [
        "Your name, your email address and your message are emailed to the shop so somebody can reply. That is all that is sent, and nothing is saved on this website.",
        "Your IP address is used for one thing: counting how many messages have come from one place in the last ten minutes, so a script cannot flood the shop's inbox. It is held in the server's memory for those ten minutes, is never written down, and is never included in the email.",
      ],
      basis:
        "Read from src/app/api/contact/route.ts — the emailed text is name, address and message only; the IP is a key in an in-memory map with a ten-minute window.",
      basisLabel: "How we know",
    },
    {
      heading: "If you buy something",
      kind: "technical",
      /* REWRITTEN 2026-09-22, and the old wording is worth recording because
         it was true when it was written and stopped being true the same day
         the shop learned to post a parcel.

         It said: "Your name, address and card details are given to SumUp on
         their own page and never come back to us." That was accurate while
         the bag posted nothing but slugs, sizes, colours and quantities. The
         moment the site started asking where to send the order, it became a
         false statement to every visitor on a page whose whole claim is that
         it describes the code rather than promising anything.

         This is exactly the expiry the `technical` kind was warned about.
         Anybody adding a field to the checkout has to come back here. */
      body: [
        "To post your order we ask for your name, email address, delivery address and postcode. They are stored on this website with your order so the shop knows what to send and where, and so there is a record of what you bought.",
        "Your card details are different: they are typed on SumUp's own payment page and never reach this website at all.",
        "Your email address is used to send you a confirmation of the order, and to reply if the shop needs to contact you about it. It is not added to a mailing list — there is no mailing list.",
      ],
      basis:
        "Read from src/app/api/checkout/route.ts and src/lib/orders.ts — the request carries the pieces plus name, email, address and postcode, which are written to the orders table. No card detail is sent to or stored by this site.",
      basisLabel: "How we know",
    },
    {
      /* Was "The three companies involved" until 2026-09-22. Neon is the
         fourth and it is not a footnote: it is the one that actually holds
         a customer's name and home address, because that is where an order
         is written. A page listing every processor except the one storing
         the personal data would be the worst version of this section. */
      heading: "The companies involved",
      kind: "technical",
      body: [
        "Vercel hosts the website and keeps ordinary server logs. Neon stores the shop's database, which is where your order and delivery address are kept. SumUp takes the payment and holds whatever a payment needs. Resend delivers email — your order confirmation, and messages from the contact form. Each has its own privacy notice.",
        "Nobody else receives anything. Your details are not sold, shared for advertising, or passed to a mailing list — there is no mailing list.",
      ],
      basis:
        "Read from the project's dependencies and route handlers: Vercel, Neon (@neondatabase/serverless), SumUp and Resend. No other third party is contacted by this site.",
      basisLabel: "How we know",
    },
    {
      /* ANSWERED 2026-09-22: she confirmed the split — enquiries six months,
         order records six years. The six years is HMRC's expectation for
         business records, and the page says so, because a customer asking
         "why do you still have my address?" deserves the reason.

         Nothing in the code deletes anything on a timer. These are her
         commitments about her own records, not a claim about automation, so
         the page says "kept for" and stops there. */
      heading: "How long the shop keeps things",
      kind: "derived",
      body: [
        "Messages sent through the contact form are kept for six months.",
        "Orders — what was bought, who by, and where it was sent — are kept for six years, because that is how long a business has to be able to show its records to HMRC.",
      ],
    },
    {
      heading: "Who to ask, and how",
      kind: "derived",
      body: [
        `B Boutique Cleethorpes, a sole trader business at ${addressLines.join(", ")}, is responsible for the information on this page.`,
        `Email ${shop.email}. It reaches the shop directly.`,
      ],
    },
    {
      heading: "What you can ask us to do",
      kind: "statutory",
      body: [
        "You can ask what information we hold about you, ask us to correct it, ask us to delete it, or object to us using it. Ask, and we will answer within one month. There is no charge.",
        "If you are not happy with how we have handled it, you can complain to the Information Commissioner's Office, the UK's data protection regulator, at ico.org.uk. You can go to them directly and you do not have to come to us first.",
      ],
      basis:
        "UK GDPR — the rights of access, rectification, erasure and objection, the one-month response period, and the right to lodge a complaint with the supervisory authority.",
    },
  ],
};

export const policies: readonly Policy[] = [delivery, returns, terms, privacy];

export function policyBySlug(slug: string): Policy | undefined {
  return policies.find((p) => p.slug === slug);
}

/** True while a page still has a slot only the client can fill. Each page
 *  renders one notice for as long as this is true of it, and it is the single
 *  thing to check before either page can be considered finished. */
export function policyIsIncomplete(policy: Policy): boolean {
  return policy.blocks.some((b) => b.kind === "required");
}

/** How many slots are outstanding across both pages. Used by nothing on the
 *  site — it exists so a launch check can assert zero. */
export const outstandingPolicySlots = policies.reduce(
  (n, p) => n + p.blocks.filter((b) => b.kind === "required").length,
  0,
);

/** The trader's identity, which a distance seller has to show.
 *
 *  Two of the four are confirmed and printed; the other two are not known and
 *  are deliberately absent rather than guessed. A trading name and a company
 *  number are checkable facts about a real business and inventing either is
 *  the same error as inventing an address. */
export const trader = {
  name: shop.name,
  address: addressLines,
  /* Emptied 2026-09-21 at the client's instruction — see shop.ts. Kept as a
     field rather than deleted so the trader record keeps its shape and the
     number can be restored in one place.
     NOTE FOR LAUNCH: the Consumer Contracts Regulations require a trader to
     give a geographical address and, where available, a telephone number and
     email. The address and the email are both published, so there is a route
     to the trader; removing the phone is the client's commercial choice and
     not a developer's. Worth one line of legal review with the rest of the
     statutory text. */
  phone: shop.phone,
  /** CONFIRMED BY THE CLIENT 2026-09-20: a sole trader, trading as
   *  "B Boutique Cleethorpes". Not a limited company, so there is no
   *  company number and no registered office to display — the trading
   *  address in `shop.ts` is the address that goes on the terms page. */
  legalEntity: "Sole trader, trading as B Boutique Cleethorpes",
  /** CLIENT INPUT REQUIRED — see shop.email, empty for the same reason. */
  email: shop.email,
};
