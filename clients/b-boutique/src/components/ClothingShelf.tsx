import type { ReactNode } from "react";

import { CategoryBar } from "./CategoryBar";
import { pendingPriceNotice } from "@/lib/catalogue";

/* The layout shared by /clothing and /clothing/[category] (2026-09-27, Brad
 * picked A, "Title and sticky filter", of three 21st-ui-explore directions,
 * with B's side menu: "a but i also like this"). The page names itself in
 * large type with its count; on a desktop the categories run down a sticky
 * list on the left and the pieces sit three across beside it; on a phone
 * the categories are one swipeable row pinned under the header. */
export function ClothingShelf({ title, current, count, children }: {
  title: string;
  current: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby="shelf-h" className="page-section cat-page shelf">
      <div className="page-inner">
        <div className="shelf-head">
          <h1 id="shelf-h" className="shelf-title">{title}</h1>
          <p className="shelf-count">{count} {count === 1 ? "piece" : "pieces"}</p>
        </div>
        {pendingPriceNotice() ? <p className="page-pending">{pendingPriceNotice()}</p> : null}
        <div className="shelf-body">
          <div className="shelf-side"><CategoryBar current={current} /></div>
          <div className="shelf-grid">{children}</div>
        </div>
      </div>
    </section>
  );
}
