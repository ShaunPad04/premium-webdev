import type { Metadata } from "next";

import { PolicyPage } from "@/components/PolicyPage";
import { policyBySlug } from "@/lib/policies";

const policy = policyBySlug("returns")!;

export const metadata: Metadata = {
  title: "Returns",
  description:
    "Changing your mind, faulty pieces, and the 14-day cancellation right you have when you buy online from B Boutique, Cleethorpes.",
  alternates: { canonical: "/returns" },
};

/* /returns — the other required page, and the more dangerous of the two.
 * A returns window published here is enforceable against the shop, so the
 * statutory rights are stated in full and every commercial decision is left
 * as a visible blank. See lib/policies.ts. */
export default function ReturnsPage() {
  return <PolicyPage policy={policy} />;
}
