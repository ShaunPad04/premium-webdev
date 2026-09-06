/** Copy for the About page.
 *
 *  ─────────────────────────────────────────────────────────────────────────
 *  RULE, the same one that governs lib/faq.ts and lib/testimonials.ts: this
 *  file may not state a fact about the business that nobody has confirmed.
 *
 *  An About page is the single most dangerous page on a local business site,
 *  because everything it wants to say is unverifiable from a repository: who
 *  runs the shop, when it opened, why, what they did before, how long they
 *  have been on the street. Every one of those is a checkable claim about
 *  real people. Invented and published, it is not placeholder copy — it is a
 *  false biography of a named business at a real address.
 *
 *  So each block below is one of two things:
 *
 *    - DERIVED. True from data already in this repository or already approved
 *      on the site: the address and hours out of shop.ts, the philosophy line
 *      signed off on 2026-09-01, the fact that the boutique sells in person
 *      rather than online (there is no shop route, basket or checkout
 *      anywhere in this codebase). Safe to publish.
 *    - TEMPORARY, carrying `temporary: true`. Written for the client demo at
 *      their request so the page reads finished. NOT safe to publish. The
 *      page renders one notice for as long as any of these remain.
 *
 *  What is deliberately NOT here, in any form: a founder's name, a year the
 *  shop opened, a number of years in business, a backstory, staff, awards,
 *  press, stockist relationships, or anything about the building's history.
 *  None of it is known. Ask the client and put their words here.
 *  ─────────────────────────────────────────────────────────────────────────
 */
export type AboutBlock = {
  /** Small caps label to the left of the block. */
  label: string;
  heading: string;
  body: string[];
  /** True while this block is demo copy rather than confirmed fact. */
  temporary?: boolean;
};

export const aboutBlocks: AboutBlock[] = [
  {
    label: "01",
    heading: "One shop, on one street.",
    /* Derived. Everything here is either in shop.ts or is a description of
       what this codebase actually is. Nothing is asserted about the people. */
    body: [
      "B Boutique is an independent shop at 18 Sea View Street in Cleethorpes. Womenswear, accessories and a small amount of homeware, all of it in one room, all of it chosen a piece at a time.",
      "There is no online shop and there is not going to be one soon. Stock changes weekly and turns faster than a website keeps up with, so the rails are the catalogue and the door is the checkout.",
    ],
  },
  {
    label: "02",
    heading: "How the rails are chosen.",
    body: [
      "Pieces are picked one at a time rather than ordered by the pack, which is why you will rarely see the same jacket twice on the same street. If something does not hang properly on a real person it does not go on the rail.",
      "The buy leans towards natural cloth and clothes that outlast the season they were bought in — wool, linen, cotton, silk — and towards pieces that work with what is already in your wardrobe rather than replacing it.",
    ],
    temporary: true,
  },
  {
    label: "03",
    heading: "What happens when you come in.",
    body: [
      "Nobody follows you round the shop. If you want to be left alone to look, that is the default; if you want an honest opinion on whether something suits you, ask and you will get one, including when the answer is no.",
      "Sizes, fit and what is worth altering are all easier to settle in person than on a screen, which is most of the reason the shop works the way it does.",
    ],
    temporary: true,
  },
];

/** True while any block is demo copy. The page uses this to show one notice
 *  for the section, and it is the thing to check before launch. */
export const aboutTemporary = aboutBlocks.some((b) => b.temporary);

/** The signed-off philosophy line, and its four-line annotation.
 *
 *  Imported from here rather than retyped so the About page and PointOfView
 *  cannot drift into two slightly different versions of an approved sentence.
 *  PointOfView still owns how it is set on the home page; this is the same
 *  words, quieter, on a page that exists to explain them. */
export const philosophy = {
  statement:
    "Clothes you won’t meet coming the other way down the high street.",
  lines: ["One shop", "One street", "Every piece", "chosen by hand."],
};
