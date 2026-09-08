import type { Metadata } from "next";

import { PolicyPage } from "@/components/PolicyPage";
import { policyBySlug } from "@/lib/policies";

const policy = policyBySlug("delivery")!;

export const metadata: Metadata = {
  title: "Delivery",
  description:
    "How an order from B Boutique, 18 Sea View Street, Cleethorpes, is sent — and the delivery rights UK law gives you when you buy online.",
  alternates: { canonical: "/delivery" },
};

/* /delivery — one of the two pages a UK shop selling at a distance has to
 * have. See lib/policies.ts for the rule governing what may and may not be
 * written on it; the short version is that a delivery price published here is
 * a term of the contract, so none is invented. */
export default function DeliveryPage() {
  return <PolicyPage policy={policy} />;
}
