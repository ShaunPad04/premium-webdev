import type { Metadata } from "next";

import { PolicyPage } from "@/components/PolicyPage";
import { policyBySlug } from "@/lib/policies";

const policy = policyBySlug("terms")!;

export const metadata: Metadata = {
  title: "Terms of sale",
  description:
    "What you agree to when you buy from B Boutique, 18 Sea View Street, Cleethorpes — and the statutory rights none of it affects.",
  alternates: { canonical: "/terms" },
};

/* /terms — the contract. See lib/policies.ts for the rule: a term published
 * here binds the shop, so every commercial decision is a visible blank rather
 * than a plausible default. */
export default function TermsPage() {
  return <PolicyPage policy={policy} />;
}
