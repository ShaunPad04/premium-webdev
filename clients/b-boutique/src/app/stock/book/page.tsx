import "@/app/offhome.css";
import type { Metadata } from "next";

import { bookIsConfigured, listBook } from "@/lib/stock-book";
import { isSignedIn, stockAuthIsConfigured } from "@/lib/stock-auth";
import { StockNotReady } from "../StockNotReady";
import { StockSignIn } from "../StockSignIn";
import { StockBook } from "./StockBook";

/** The stock book: where Hayley logs each new piece (2026-10-10, Brad).
 *
 *  A staff page like /stock: same passcode, same cookie, noindex regardless
 *  of ALLOW_INDEXING, nothing on the shop links to it. See lib/stock-book.ts
 *  for what an entry is and why this replaced the Claude artifact. */
export const metadata: Metadata = {
  title: "New stock",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function StockBookPage() {
  if (!bookIsConfigured() || !stockAuthIsConfigured()) {
    return <StockNotReady database={bookIsConfigured()} passphrase={stockAuthIsConfigured()} />;
  }
  if (!(await isSignedIn())) return <StockSignIn />;

  const entries = await listBook();
  if (!entries) return <StockNotReady database={false} passphrase />;
  return <StockBook entries={entries} />;
}
