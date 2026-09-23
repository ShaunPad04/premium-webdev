import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { StatementRail } from "@/components/StatementRail";
import { PointOfView } from "@/components/PointOfView";
import { HorizontalRails } from "@/components/HorizontalRails";
import NewsLetter from "@/components/ui/pinky-news-letter";
import CinematicProducts from "@/components/ui/cinematic-product-scroll-section";
import { SafeBoundary } from "@/components/SafeBoundary";
import { CoverFlowCarousel } from "@/components/ui/3-d-coverflow-carousel";
import { Homeware } from "@/components/Homeware";
import { OwnerCard } from "@/components/OwnerCard";
import { Service } from "@/components/Service";
import { Faq } from "@/components/Faq";
import { Visit } from "@/components/Visit";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";

export default function Home() {
  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        {/* The numbers below are the eyebrow each section actually prints, so
            this list and the page read the same. They run 01–06 over the six
            numbered sections in document order; Hero and StatementRail carry
            no section number — the band under the hero is a breath between
            two sections, not a place in this sequence. Renumber both ends
            together, or the page starts lying about itself — a stale copy of
            this list is how Visit and the FAQ both ended up at 05. */}

        {/* Hook — what this is */}
        <Hero />
        {/* A breath — what the shop is, moving slowly. Was eight brand
            logos until 2026-09-21; see lib/statements.ts for why they went. */}
        <StatementRail />
        {/* 01 Editorial interlude — the statement, lit word by word */}
        <PointOfView />
        {/* 02 The rails — the heroic interaction */}
        <HorizontalRails />
        {/* 03 Proof — actual stock, moving weekly */}
        <CoverFlowCarousel />

        <SafeBoundary name="statement pieces" fallback={null}>
          <CinematicProducts />
        </SafeBoundary>
        {/* 04 A second world — homeware */}
        <Homeware />
        {/* The person. This is the slot the six invented customer quotes
            occupied until 2026-09-21 — the client has three real reviews,
            not six, and a section whose composition argues "many people say
            this" is weaker with three than with none. She asked for an
            editorial owner card here instead, which is the better answer to
            the same question: an independent boutique's credibility is a
            named person, not a wall of anonymous praise. */}
        <OwnerCard />
        {/* How buying from the shop works — hours, delivery, returns. It
            follows the owner card deliberately: who she is, then how it
            works. Every line derives from confirmed data. See Service.tsx. */}
        <Service />
        {/* 05 The practical questions, once they are interested */}
        <Faq />
        {/* 06 The ask — a postcode, not a basket */}
        <SafeBoundary name="new on the rails" fallback={null}>
          <NewsLetter />
        </SafeBoundary>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
