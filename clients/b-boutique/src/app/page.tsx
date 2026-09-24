import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { NewArrivalRail } from "@/components/NewArrivalRail";
import { PointOfView } from "@/components/PointOfView";
import { HorizontalRails } from "@/components/HorizontalRails";
import { CoverFlowCarousel } from "@/components/ui/3-d-coverflow-carousel";
import { StepInside } from "@/components/home/StepInside";
import { UpClose } from "@/components/home/UpClose";
import { OwnerCard } from "@/components/OwnerCard";
import { Reviews } from "@/components/home/Reviews";
import { Visit } from "@/components/Visit";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";

/* The home page, cut from ~17 screens to about half that (2026-09-24, Brad,
 * after the homepage critique). It answered the same questions four or five
 * times and kept "is it open, where is it" at the bottom. Now each section
 * says one thing, once:
 *
 *   Hero          the name, one button, and open every day · the street
 *   Marquee       decorative, aria-hidden
 *   Quote         the shop's point of view
 *   Categories    where to go
 *   New In        what has just come in, each card links to its page
 *   Step inside   her photographs of the shop, stacked on scroll (it
 *                 replaced the statement pieces on 2026-09-24: a second row
 *                 of the same garments straight after New In)
 *   Up close      the cloth
 *   Hayley        who runs it
 *   Reviews       her three Google reviews, static (hidden until supplied)
 *   Visit         the address, hours and map
 *
 * Taken off the home page, not deleted: the Homeware band (the category row
 * has a Homeware tile), the delivery/returns/visit strip (delivery is in the
 * announcement bar and the bag, the visit is the section below it) and the
 * FAQ, which is its own page at /faq. The cinematic statement scene it
 * replaced showed each piece three times with four full buy blocks. */
export default function Home() {
  return (
    <>
      <MotionLayer />
      <Nav />
      {/* home-rise: the hero holds still and the rest of the page slides up
          over it on a slanted edge that levels out (2026-09-24, Brad's
          reference: fuel.framer.website). CSS only; see globals.css. */}
      <main id="main" className="flex-1 home-rise">
        <Hero />
        <div className="rise">
        <NewArrivalRail />
        <PointOfView />
        <HorizontalRails />
        <CoverFlowCarousel />
        <StepInside />
        <UpClose />
        <OwnerCard />
        {/* Renders nothing until lib/reviews.ts holds her real Google reviews. */}
        <Reviews />
        <Visit />
        </div>
      </main>
      <Footer />
    </>
  );
}
