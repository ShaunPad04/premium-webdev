import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { StatementRail } from "@/components/StatementRail";
import { PointOfView } from "@/components/PointOfView";
import { HorizontalRails } from "@/components/HorizontalRails";
import { NewInRail } from "@/components/NewInRail";
import { Homeware } from "@/components/Homeware";
import { Testimonials } from "@/components/Testimonials";
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
        <NewInRail />
        {/* 04 A second world — homeware */}
        <Homeware />
        {/* The customer voice — the black break between two light sections */}
        <Testimonials />
        {/* 05 The practical questions, once they are interested */}
        <Faq />
        {/* 06 The ask — a postcode, not a basket */}
        <Visit />
      </main>
      <Footer />
    </>
  );
}
