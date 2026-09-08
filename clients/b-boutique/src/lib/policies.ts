import { addressLines, phoneDisplay, shop } from "./shop";

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
      kind: "required",
      body: [],
      ask: "Do you post anywhere in the UK? Anywhere outside it? Is collection from the shop an option for online orders?",
    },
    {
      heading: "What delivery costs",
      kind: "required",
      body: [],
      ask: "One flat price for every order is simplest to start with. Is there a spend above which it is free?",
    },
    {
      heading: "When it is sent",
      kind: "required",
      body: [],
      ask: "How soon after an order do you get to the post office — same day, next working day, twice a week? Say what is actually true on a busy week, not the best case.",
    },
    {
      heading: "Who carries it",
      kind: "required",
      body: [],
      ask: "Royal Mail, a courier, or both? Tracked or not? A customer asking 'where is it' needs an answer.",
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
        `Ring the shop on ${phoneDisplay} and quote the reference from your order confirmation. It is one room and one rail — somebody will know exactly which parcel is yours.`,
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
      kind: "required",
      body: [],
      ask: "The law lets you make the customer pay return postage on a change of mind — but ONLY if you tell them before they order, which is what this page is for. If you would rather cover it, say so. Either answer is fine; not answering is what causes the argument. (A faulty item is always at your cost, whatever you decide here.)",
    },
    {
      heading: "Where to send it",
      kind: "derived",
      body: [
        `${addressLines.join(", ")}.`,
        `Ring ${phoneDisplay} before you post anything, so we know to expect it.`,
      ],
    },
    {
      heading: "Anything that cannot come back",
      kind: "required",
      body: [],
      ask: "Pierced earrings and anything sealed for hygiene are the usual ones a boutique excludes, and the law does allow certain exclusions — but only where they genuinely apply. Do you want any, and exactly which? We will not write one you have not asked for.",
    },
    {
      heading: "Exchanges",
      kind: "required",
      body: [],
      ask: "Do you offer them at all? Given most pieces are one of one, 'no, but here is a refund' may be the honest answer and it is a perfectly good one.",
    },
    {
      heading: "Bought in the shop rather than online",
      kind: "required",
      body: [],
      ask: "Everything above is online-only — a customer who buys over the counter has no automatic right to change their mind, so whatever you offer in the shop is your own goodwill policy. What is it? Worth stating, because people assume the online rules apply and they do not.",
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
        `${shop.name}, ${addressLines.join(", ")}. Telephone ${phoneDisplay}.`,
        "One shop, on one street. There is no warehouse and no second branch — the pieces on this website are the pieces on the rail.",
      ],
    },
    {
      heading: "The trading name behind the shop",
      kind: "required",
      body: [],
      ask: "Are you a sole trader or a limited company? If it is a company, we need the registered name, the company number and the registered office address, because an online shop has to display them. If you are a sole trader, your own name is what goes here.",
    },
    {
      heading: "When the order becomes a contract",
      kind: "required",
      body: [],
      ask: "Standard wording, and it protects you: 'Your order is an offer to buy. The contract is formed when we confirm we have your piece and it is on its way — not when the payment goes through.' That single sentence is what lets you refund somebody lawfully when a one-of-one piece sold in the shop an hour earlier. Say yes and we will use it, or tell us how you would rather it read.",
    },
    {
      heading: "Prices and VAT",
      kind: "required",
      body: [],
      ask: "Are you VAT registered? If so we need the number, and the prices shown will say they include VAT. If not, the page simply says the price is the price and no VAT is charged — which is also completely normal for a shop this size.",
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
      heading: "If a piece has already gone",
      kind: "required",
      body: [],
      ask: "This is the same question as the oversell one on your list, and the answer belongs here as a term as well as a promise. Refund straight away and ring to apologise, or ring first and offer something similar? Your words.",
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
      kind: "required",
      body: [],
      ask: "For a shop trading in Cleethorpes the ordinary answer is 'the law of England and Wales, and you can bring a claim in the English courts — and if you live elsewhere in the UK, the consumer protection of where you live still applies to you.' Confirm that is what you want and we will use it.",
    },
    {
      heading: "If something goes wrong",
      kind: "derived",
      body: [
        `Ring the shop on ${phoneDisplay}. A conversation settles almost everything, and it is quicker than writing.`,
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
        "It only leaves your device when you press Checkout, and then only as a list of pieces and sizes so the payment can be worked out.",
      ],
      basis:
        "Read from src/lib/useCart.tsx — the bag is stored in the browser's localStorage under one key.",
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
      body: [
        "The pieces and sizes in your bag go to our server, which prices them and asks SumUp to set up a payment. Your name, address and card details are given to SumUp on their own page and never come back to us.",
      ],
      basis:
        "Read from src/app/api/checkout/route.ts — the request carries slugs, sizes and quantities, and no customer detail.",
      basisLabel: "How we know",
    },
    {
      heading: "The three companies involved",
      kind: "technical",
      body: [
        "Vercel hosts the website and keeps ordinary server logs. SumUp takes the payment and holds whatever a payment needs. Resend delivers the contact form's email to the shop. Each has its own privacy notice.",
        "Nobody else receives anything. Your details are not sold, shared for advertising, or passed to a mailing list — there is no mailing list.",
      ],
      basis:
        "Read from the project's dependencies and route handlers: no other third party is contacted by this site.",
      basisLabel: "How we know",
    },
    {
      heading: "How long the shop keeps things",
      kind: "required",
      body: [],
      ask: "How long do you keep an enquiry email — a few months, a year? And once orders start, how long do you keep the record? There is a real answer: HMRC generally expects business records to be kept for six years, so order records usually stay that long, but enquiry emails are your choice.",
    },
    {
      heading: "Who to ask, and how",
      kind: "required",
      body: [],
      ask: "A privacy notice has to name who is responsible for the information and give a way to contact them. That means the same trading name as the terms page, and an email address to send a request to — the enquiries address is fine.",
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
  phone: phoneDisplay,
  /** CLIENT INPUT REQUIRED: sole trader or limited company, and the
   *  registered number and registered office if there is one. */
  legalEntity: "",
  /** CLIENT INPUT REQUIRED — see shop.email, empty for the same reason. */
  email: shop.email,
};
