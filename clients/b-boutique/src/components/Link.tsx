"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";

import { usePainted } from "@/lib/painted";

/* next/link, prefetching only once the first screen has painted (2026-09-28).
 * Next prefetches every link as it comes into view, straight after hydration;
 * on a slow phone that is before the first paint, so the next pages' data and
 * stylesheet competed with this one. Link re-registers when `prefetch`
 * changes, so the same links prefetch as before, just after the paint. */
export default function Link({ prefetch, ...props }: ComponentProps<typeof NextLink>) {
  const painted = usePainted();
  return <NextLink {...props} prefetch={painted ? prefetch : false} />;
}
