import { isBuyable, products, type Product } from "./catalogue";

/* "Style it with" (2026-09-24, Brad): two or three real pieces from the
 * shop that make an outfit with this one. A rule, not a stylist: each
 * category pairs with the categories you would wear it with, buyable pieces
 * first. Nothing here claims two pieces were designed together. */
const GOES_WITH: Record<string, string[]> = {
  Knitwear: ["Trousers", "Coats & Jackets"],
  Tops: ["Trousers", "Coats & Jackets", "Knitwear"],
  Trousers: ["Knitwear", "Tops", "Coats & Jackets"],
  "Coats & Jackets": ["Knitwear", "Trousers", "Tops"],
  Dresses: ["Coats & Jackets", "Knitwear"],
  "Co-ords": ["Coats & Jackets", "Knitwear"],
  Homeware: ["Homeware"],
};

export function styleWith(product: Product, limit = 3): Product[] {
  const wanted = GOES_WITH[product.category] ?? [];
  const out: Product[] = [];
  for (const cat of wanted) {
    const pick = products.find(
      (p) => p.category === cat && p.slug !== product.slug && isBuyable(p) && !out.includes(p),
    );
    if (pick) out.push(pick);
    if (out.length >= limit) break;
  }
  if (out.length < 2) return [];
  return out;
}
