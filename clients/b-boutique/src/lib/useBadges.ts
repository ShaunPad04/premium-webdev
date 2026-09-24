"use client";

import { useEffect, useState } from "react";
import type { Badge } from "./scarcity";

/* One request per page for every scarcity badge, shared by every card and
   the product page. Empty until it lands, and empty for good when stock is
   not configured: no badge is ever shown on a guess. */
let cache: Promise<Record<string, Badge>> | null = null;

function load(): Promise<Record<string, Badge>> {
  cache ??= fetch("/api/badges")
    .then((r) => (r.ok ? r.json() : null))
    .then((d: { badges?: Record<string, Badge> } | null) => d?.badges ?? {})
    .catch(() => ({}));
  return cache;
}

export function useBadges(): Record<string, Badge> {
  const [badges, setBadges] = useState<Record<string, Badge>>({});
  useEffect(() => {
    let live = true;
    load().then((b) => live && setBadges(b));
    return () => {
      live = false;
    };
  }, []);
  return badges;
}
