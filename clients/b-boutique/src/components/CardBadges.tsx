"use client";

import { useBadges } from "@/lib/useBadges";

/* NEW IN and, where counted stock earns one, the scarcity badge on a card.
   See lib/scarcity.ts: no count, no badge. */
export function CardBadges({ slug, isNew }: { slug: string; isNew: boolean }) {
  const badge = useBadges()[slug];
  if (!isNew && !badge) return null;
  return (
    <span className="card-tags">
      {isNew ? <span className="tag tag--new">New in</span> : null}
      {badge ? <span className="tag tag--scarce">{badge.label}</span> : null}
    </span>
  );
}
