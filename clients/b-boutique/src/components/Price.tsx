import { formatPriceShort, wasPriceP } from "@/lib/catalogue";

/* A price, then her usual price struck through after it while the sale is
   on (lib/catalogue.ts SALE). Renders inline content only, so every caller
   keeps its own element and class. The strike is not read out as a
   strike, so the words "was" and "now" say it for a screen reader. */
export function Price({ priceP, slug }: { priceP: number; slug?: string }) {
  const was = wasPriceP(priceP, slug);
  if (was === null) return <>{formatPriceShort(priceP)}</>;
  return (
    <>
      <span className="price-now">
        <span className="sr-only">Now </span>
        {formatPriceShort(priceP)}
      </span>{" "}
      <s className="price-was">
        <span className="sr-only">was </span>
        {formatPriceShort(was)}
      </s>
    </>
  );
}
