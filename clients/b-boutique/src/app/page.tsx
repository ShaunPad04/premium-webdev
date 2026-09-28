import type { Metadata } from "next";
import { pageMeta, siteDescription } from "@/lib/site";
import { Nav } from "@/components/Nav";

import { HeroCampaign } from "@/components/HeroCampaign";
import { NewArrivalRail } from "@/components/NewArrivalRail";
import { CategoryTabs } from "@/components/CategoryTabs";
import { NewInSlides } from "@/components/NewInSlides";
import { WhyUs } from "@/components/home/WhyUs";
import { UpClose } from "@/components/home/UpClose";
import { OwnerCard } from "@/components/OwnerCard";
import { Reviews } from "@/components/home/Reviews";
import { Visit } from "@/components/Visit";
import { Footer } from "@/components/Footer";
import { SocialStrip } from "@/components/SocialStrip";
import { ShortFaq } from "@/components/ShortFaq";
import { MotionLayer } from "@/components/MotionLayer";

/* Every other page names its own canonical; the home page did not. */
export const metadata: Metadata = pageMeta({ path: "/", description: siteDescription });

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
 *   Up close      the cloth
 *   Hayley        who runs it
 *   Reviews       her three Google reviews, static (hidden until supplied)
 *   Visit         the address, hours and map
 *
 * Taken off the home page, not deleted: the Homeware band (the category row
 * has a Homeware tile), the delivery/returns/visit strip (delivery is in the
 * announcement bar and the bag, the visit is the section below it) and the
 * long FAQ (the full one is back above the footer since 2026-09-27, when
 * /faq came out). The cinematic statement scene it
 * replaced showed each piece three times with four full buy blocks. */
export default function Home() {
  return (
    <>
      <MotionLayer />
      {/* See-through over the hero photograph, solid once the reader scrolls. */}
      <Nav />
      {/* home-rise is only a hook for the home page's section rules now; the
          hero scrolls normally (2026-09-27, Brad). */}
      <main id="main" className="flex-1 home-rise">
        {/* The campaign hero since 2026-09-27 (Brad's pick, C of three), in
            place of the Fair Isle turn, which is kept in HeroTurn.tsx with its
            Inter word-ring font. */}
        <HeroCampaign />
        <div className="rise">
        {/* The marquee is the first thing up over the hero (2026-09-26,
            Brad): white, carrying the philosophy sentence. The quote section
            (PointOfView) came off the home page; the component is kept. */}
        <NewArrivalRail />
        {/* Four category panels since 2026-09-27 (Brad picked C of three). */}
        <CategoryTabs />
        {/* New arrivals straight after the categories, then the shop owner
            (2026-09-27, Brad: Hayley came "too soon" right under the
            categories). Up close follows her. */}
        <NewInSlides />
        <OwnerCard />
        {/* Shop the look ("Straight from the window") came off the home
            page on 2026-09-26 at Brad's request; the component is kept. */}
        <UpClose />
        <WhyUs />
        {/* Renders nothing until lib/reviews.ts holds her real Google reviews. */}
        <Reviews />
        <Visit />
        </div>
      </main>
      <SocialStrip />
      <ShortFaq all />
      <Footer />
    </>
  );
}
