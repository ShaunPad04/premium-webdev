import type { Metadata } from "next";

import { PolicyPage } from "@/components/PolicyPage";
import { policyBySlug } from "@/lib/policies";

const policy = policyBySlug("privacy")!;

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What the B Boutique website collects, what it does not, and your rights under UK data protection law.",
  alternates: { canonical: "/privacy" },
};

/* /privacy — the one page on a website that can be checked against the
 * website itself. Almost every block is `technical`: a claim about what this
 * codebase does, read out of the file it names rather than remembered. It
 * stops being true the moment somebody adds an analytics script, which is why
 * it is re-verified at launch. */
export default function PrivacyPage() {
  return <PolicyPage policy={policy} />;
}
