"use client";

import { useCallback, useSyncExternalStore } from "react";

/* Saved pieces and recently viewed pieces, per browser (localStorage).
   Conveniences for the visitor only: nothing leaves the device, which keeps
   /privacy true. Every read is guarded, because private windows and blocked
   storage throw. */

function read(key: string): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function write(key: string, v: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(v));
  } catch {}
  window.dispatchEvent(new Event(`bb:${key}`));
}

const snapshots = new Map<string, { raw: string; value: string[] }>();
function snapshot(key: string): string[] {
  let raw = "[]";
  try {
    raw = window.localStorage.getItem(key) ?? "[]";
  } catch {}
  const hit = snapshots.get(key);
  if (hit && hit.raw === raw) return hit.value;
  const value = read(key);
  snapshots.set(key, { raw, value });
  return value;
}
const EMPTY: string[] = [];

function useList(key: string) {
  const subscribe = useCallback(
    (cb: () => void) => {
      window.addEventListener(`bb:${key}`, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(`bb:${key}`, cb);
        window.removeEventListener("storage", cb);
      };
    },
    [key],
  );
  return useSyncExternalStore(subscribe, () => snapshot(key), () => EMPTY);
}

export function useSaved() {
  const list = useList("bb-saved");
  const toggle = (slug: string) => {
    const cur = read("bb-saved");
    write("bb-saved", cur.includes(slug) ? cur.filter((s) => s !== slug) : [slug, ...cur]);
  };
  return { saved: list, isSaved: (slug: string) => list.includes(slug), toggle };
}

export function useRecent() {
  return useList("bb-recent");
}

export function markViewed(slug: string) {
  const cur = read("bb-recent").filter((s) => s !== slug);
  write("bb-recent", [slug, ...cur].slice(0, 12));
}
