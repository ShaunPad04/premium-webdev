import type { Product } from "./catalogue";

/** The shop's search.
 *
 *  ── What this is, and deliberately is not ────────────────────────────────
 *  Twenty-six products. That is a list you filter in the browser, not a
 *  corpus you index: no search service, no embeddings, no dependency, no
 *  network round trip and nothing to keep in step with the catalogue. The
 *  whole thing runs on the array the page already has.
 *
 *  It is a real search, not a placeholder — locked decision 3 said the
 *  header's inert SEARCH span becomes a control "the moment it becomes real",
 *  and this is that moment.
 *
 *  ── The one rule that matters here ───────────────────────────────────────
 *  Search must not assert anything about a product that the product's own
 *  data does not say. That is why there are NO colour synonyms: "black" would
 *  have to guess from `tone`, which is the artwork ramp for the photograph's
 *  fallback — onyx and marble are the design system's names for dark stone,
 *  not statements that a garment is black. Returning a coat for "black" would
 *  be the site telling a customer the coat is black. Nobody has confirmed
 *  that. So a colour search returns nothing, and nothing is the honest answer
 *  until the client supplies colours.
 *
 *  The synonyms below are all language, never stock: "jumper" and "knitwear"
 *  are two words for one category, and mapping them is a dictionary fact, not
 *  a claim about B Boutique.
 */

/** Query word → the words it should also match.
 *
 *  Deliberately short. Every entry is a British/American or shop-floor/label
 *  pair for something already in the catalogue's own names and categories. If
 *  a word is not here, the prefix and substring rules below usually still get
 *  it: "coat" already finds "overcoat", "neck" already finds "roll-neck". */
const SYNONYMS: Record<string, readonly string[]> = {
  jumper: ["knitwear", "crew", "rollneck"],
  jumpers: ["knitwear", "crew", "rollneck"],
  sweater: ["knitwear", "crew", "rollneck"],
  pullover: ["knitwear", "crew", "rollneck"],
  knit: ["knitwear"],
  pants: ["trouser"],
  jean: ["denim"],
  jeans: ["denim"],
  denim: ["jean"],
  bag: ["tote", "crossbody"],
  bags: ["tote", "crossbody"],
  handbag: ["tote", "crossbody"],
  purse: ["tote", "crossbody"],
  earring: ["hoop"],
  earrings: ["hoop"],
  jacket: ["blazer", "overshirt"],
  jackets: ["blazer", "overshirt"],
  blazer: ["jacket"],
  tshirt: ["tee"],
  tee: ["tops"],
  shirt: ["blouse", "poplin"],
  vase: ["carafe"],
  jug: ["carafe"],
};

/** Lowercase, strip accents, and reduce everything that is not a letter or a
 *  digit to a space. Hyphens matter here: "roll-neck", "bias-cut" and
 *  "wide-leg" all become two searchable words, so "neck" and "leg" work. */
function normalise(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** What a product can be found by: its name and its category, and nothing
 *  else. Not the slug (it is a URL, and it only ever repeats the name), and
 *  not the size run — searching "12" would return two thirds of the shop,
 *  which is a filter pretending to be a search, and the sizes are invented. */
function haystack(p: Product): string {
  return normalise(`${p.name} ${p.category}`);
}

function tokenMatches(words: readonly string[], joined: string, token: string): boolean {
  /* A word starting with the token: "trouser" finds "trousers", "jean" finds
     "jeans", "sil" finds "silk" as you type. */
  if (words.some((w) => w.startsWith(token))) return true;
  /* Or the token inside a longer word, but only once it is specific enough to
     mean something: "coat" finds "overcoat", while a two-letter "at" does not
     find every garment in the shop. */
  return token.length >= 4 && joined.includes(token);
}

/** The products matching `query`, in catalogue order.
 *
 *  Every word in the query must match something (AND, not OR), so typing more
 *  narrows rather than widens — "wool coat" is two garments, not thirty. An
 *  empty query is not a search: it returns everything, which is what the shop
 *  shows at rest. */
export function searchProducts(items: readonly Product[], query: string): Product[] {
  const tokens = normalise(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return [...items];

  return items.filter((p) => {
    const joined = haystack(p);
    const words = joined.split(" ");
    return tokens.every((token) => {
      if (tokenMatches(words, joined, token)) return true;
      const also = SYNONYMS[token];
      return also ? also.some((alt) => tokenMatches(words, joined, alt)) : false;
    });
  });
}

/** The handful of words offered under an empty result, so that a search that
 *  finds nothing still ends somewhere. These are categories that exist in the
 *  catalogue, checked against it at build time by the caller — never a list of
 *  things the shop might stock. */
export const SEARCH_SUGGESTIONS = [
  "Coats",
  "Knitwear",
  "Dresses",
  "Denim",
  "Accessories",
] as const;
