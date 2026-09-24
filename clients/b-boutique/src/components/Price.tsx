import { formatPriceShort, wasPriceP } from "@/lib/catalogue";

/* A price, with her usual price struck through beside it while the sale is
   on (lib/catalogue.ts SALE). Renders inline content only, so every caller
   keeps its own element and class. The strike is not read out as a
   strike, so the words "was" and "now" say it for a screen reader. */
export function Price({ priceP }: { priceP: number }) {
  const was = wasPriceP(priceP);
  if (was === null) return <>{formatPriceShort(priceP)}</>;
  return (
    <>
      <s className="price-was">
        <span className="sr-only">Was </span>
        {formatPriceShort(was)}
      </s>{" "}
      <span className="price-now">
        <span className="sr-only">now </span>
        {formatPriceShort(priceP)}
      </span>
    </>
  );
}
