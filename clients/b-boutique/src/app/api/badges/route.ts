import { badgesFrom } from "@/lib/scarcity";
import { readStock, stockIsConfigured } from "@/lib/stock";

/* Scarcity labels for every counted piece. Words only, never counts; see
   lib/scarcity.ts for when a piece earns one. Not configured or failing:
   an empty map, and the shop shows no badges rather than guessing. */
export const dynamic = "force-dynamic";

export async function GET() {
  if (!stockIsConfigured()) return Response.json({ ok: true, badges: {} });
  try {
    const rows = await readStock();
    return Response.json(
      { ok: true, badges: rows ? badgesFrom(rows) : {} },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (err) {
    console.error("badges: query failed", err);
    return Response.json({ ok: true, badges: {} });
  }
}
