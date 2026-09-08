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
export type BlockKind = "statutory" | "derived" | "required";

export type PolicyBlock = {
  /** Short heading. Reads as a question a customer would actually ask. */
  heading: string;
  kind: BlockKind;
  /** Paragraphs. Empty for a `required` block — there is nothing to say yet. */
  body: string[];
  /** For `statutory`: the legislation it comes from, shown in small print so
   *  a customer can check it and the client can see it is not our invention. */
  basis?: string;
  /** For `required`: what to ask the client, in words they can answer. */
  ask?: string;
};

export type Policy = {
  slug: "delivery" | "returns";
  title: string;
  eyebrow: string;
  lede: string;
  blocks: PolicyBlock[];
};

/* ── Delivery ───────────────────────────────────────────────────────────── */

const delivery: Policy = {
  slug: "delivery",
  title: "Delivery",
  eyebrow: "Getting it to you",
  lede: "How an order leaves the shop, what it costs, and when it should reach you.",
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

export const policies: readonly Policy[] = [delivery, returns];

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
