import { Nav } from "@/components/Nav";
import { NewArrivalRail } from "@/components/NewArrivalRail";
import { HomeHero } from "@/components/home/HomeHero";
import { JustIn } from "@/components/home/JustIn";
import { TheEdit } from "@/components/home/TheEdit";
import { CategoryBento } from "@/components/home/CategoryBento";
import { MeetHayley } from "@/components/home/MeetHayley";
import { InstaGrid } from "@/components/home/InstaGrid";
import { Reviews } from "@/components/home/Reviews";
import { Newsletter } from "@/components/home/Newsletter";
import { VisitCompact } from "@/components/home/VisitCompact";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";

/* The editorial home page (2026-09-24, Brad's rebuild): fewer products,
 * more story, seven sections and no two neighbours in the same layout.
 *
 *   1 Hero          full-bleed photograph, one line, one button
 *   2 Marquee       NEW IN · ONE OF ONE · SEA VIEW STREET, CLEETHORPES
 *   3 Just in       six pieces, a row
 *   4 The Edit      three styled looks (drafts, previews only)
 *   5 Categories    2x2 and one wide homeware tile
 *   6 Meet Hayley   portrait, quote, the shop floor moving
 *   7 Instagram, the list, one Visit block
 *
 * Removed in the rebuild: the statement-pieces scroll scene, the coverflow
 * with its expanded first piece, the three service cards (delivery and
 * returns are in the footer now), the philosophy statement, homeware band,
 * FAQ, and every repeat of the hours and address. */
export default function Home() {
  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        <HomeHero />
        <NewArrivalRail />
        <JustIn />
        <TheEdit />
        <CategoryBento />
        <MeetHayley />
        {/* Renders nothing until lib/reviews.ts has real reviews. */}
        <Reviews />
        <InstaGrid />
        <Newsletter />
        <VisitCompact />
      </main>
      <Footer />
    </>
  );
}
