"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* The location panel, and the map it expands into.
 *
 * ── Why the collapsed state is not a live map ─────────────────────────────
 * Three problems solve themselves by mounting the iframe only on intent:
 *   - Google's embed sets third-party cookies. Loading it unprompted on a UK
 *     high-street site is a consent question; loading it when someone asks to
 *     see the map is not.
 *   - A collapsed map is a wheel trap. An iframe sitting in the page swallows
 *     scroll the moment the pointer crosses it, halfway down a homepage.
 *   - It is a third-party frame on the critical path of a section near the
 *     bottom of the page, which nobody should pay for on load.
 * So the collapsed state is a typographic panel — the address, set large.
 * NOT a drawn map: no fake streets, no invented pins, nothing pretending to
 * be cartography. The real map is real, and it opens when asked.
 *
 * ── The expanded state is a dialog ────────────────────────────────────────
 * Focus moves in, is trapped while open, and returns to the button that
 * opened it. Escape closes. The page behind is locked — including Lenis,
 * which keeps scrolling under an overlay if you only set overflow:hidden,
 * because it drives the scroll itself.
 *
 * It is PORTALLED to document.body, and that is not cosmetic. This component
 * lives inside <main>, and the lock marks <main> inert. Rendered in place,
 * the dialog was inside its own inert subtree: focus could not move into it
 * and the close button could not be clicked. Playwright reported the body
 * intercepting the click, which is exactly what inert looks like from the
 * outside. Portalling puts the dialog beside main rather than within it. */
export function VisitMap({
  street,
  town,
  postcode,
  embedSrc,
  directionsHref,
  title,
}: {
  street: string;
  town: string;
  postcode: string;
  embedSrc: string;
  directionsHref: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  /* Can this browser reach Google Maps at all? (2026-09-24, homepage
     critique.) A blocked frame still fires `load` and paints the browser's
     own broken-page tile, so the iframe cannot tell us. A no-cors fetch of
     the same embed URL can: an ad blocker or offline network rejects it.
     Asked only as the section nears the screen, which is when the lazy
     iframe used to load anyway, so /privacy stays true. Until the answer
     is in, and if it is no, her shopfront photograph fills the panel. */
  const [mapOk, setMapOk] = useState<boolean | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    let done = false;
    const probe = () => {
      if (done) return;
      done = true;
      const ctl = new AbortController();
      const t = window.setTimeout(() => ctl.abort(), 6000);
      fetch(embedSrc, { mode: "no-cors", signal: ctl.signal })
        .then(() => setMapOk(true))
        .catch(() => setMapOk(false))
        .finally(() => window.clearTimeout(t));
    };
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { probe(); io.disconnect(); }
    }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [embedSrc]);
  /* No map on the page until it is asked for (2026-09-23). The panel used
     to hold a lazy Google iframe as a preview, which (1) reached Google as
     soon as a visitor scrolled near it, contradicting /privacy ("nothing
     reaches Google unless you press it"), and (2) under an ad blocker or
     consent tool showed the browser's own broken-page tile, because a
     blocked frame still fires `load`. The panel is now her own photograph
     of the window onto Sea View Street and one button; the real map mounts
     only in the dialog that button opens. */
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  /* Only flips the state. Focus is restored in the effect's cleanup, NOT
     here: at this moment <main> is still inert, and focusing an element
     inside an inert subtree is silently dropped — the call succeeds and
     nothing happens. Measured exactly that; focus ended up on <body>. */
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    /* Captured here rather than read in the cleanup. It is the same node
       either way — the trigger does not move while this component is
       mounted — but reading a ref during cleanup is the pattern that bites
       when it isn't, and the linter is right to say so. */
    const openedBy = opener.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      const f = dialog.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), iframe',
      );
      if (!f?.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);

    // Lock the page. Lenis first — overflow:hidden alone does not stop it.
    window.__lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const main = document.getElementById("main");
    main?.setAttribute("inert", "");

    const t = window.setTimeout(
      () => dialog.current?.querySelector<HTMLElement>("button")?.focus(),
      60,
    );

    return () => {
      document.removeEventListener("keydown", onKey);
      // Restore exactly, in reverse. Leaving either of these on is how a page
      // ends up permanently unscrollable after a modal.
      document.body.style.overflow = prevOverflow;
      main?.removeAttribute("inert");
      window.__lenis?.start();
      window.clearTimeout(t);
      // Now that main is interactive again, send focus back where it came
      // from. Guarded because this cleanup also runs on unmount.
      if (openedBy?.isConnected) openedBy.focus();
    };
  }, [open, close]);

  return (
    <>
      <div className="vm-panel" ref={panel} data-map={mapOk === true ? "on" : undefined}>
        <picture className="vm-photo">
          <source type="image/avif" srcSet="/img/about/shopfront-640.avif 640w, /img/about/shopfront-960.avif 960w, /img/about/shopfront-1024.avif 1024w" sizes="(min-width: 1024px) 45vw, 92vw" />
          <source type="image/webp" srcSet="/img/about/shopfront-640.webp 640w, /img/about/shopfront-960.webp 960w, /img/about/shopfront-1024.webp 1024w" sizes="(min-width: 1024px) 45vw, 92vw" />
          <img src="/img/about/shopfront-960.jpg" alt="" loading="lazy" decoding="async" />
        </picture>
        {/* ── The address used to be printed here, over the map ───────────
            It was the fallback for a blocked embed, which is a real case —
            consent tools and ad blockers stop Google Maps for a large share
            of UK visitors, and a grey hole is not an acceptable answer.

            But it was ALSO printed, at the same moment, in the column
            immediately to its left. The client saw the result: the address
            twice on one screen, the second copy needing a heavy dark plate
            over the map to stay legible, which dimmed the map she had just
            asked to be put in colour.

            The fallback requirement is that a visitor is never left with
            nothing, and they are not: `Visit` sets the address in real text
            beside this panel, always, independent of whether any third party
            loads. That is a better fallback than this was — it does not
            depend on the iframe failing in a particular way to be seen.

            So the duplicate is gone and the plate with it. The scrim that
            remains is a thin gradient at the foot, and it is there for the
            EXPAND MAP button's contrast, not for type. */}

        {/* The map, visible in place rather than only behind a button.
            Three things make that safe:
              loading="lazy"  — nothing is fetched until the section is near
                                the viewport, so it stays off the critical path
                                and the top of the page still loads with zero
                                third-party requests;
              pointer-events  — none, in CSS. An iframe sitting in a page eats
                                the wheel the moment the pointer crosses it,
                                halfway down a homepage. This one cannot: it is
                                a picture of a map, and "Expand map" is the way
                                in to a real one;
              tabIndex/aria   — a frame is focusable and would otherwise be a
                                second, dead stop in the tab order announcing a
                                duplicate map. The interactive one is in the
                                dialog. Both attributes are needed together:
                                aria-hidden on a focusable element is itself a
                                violation. */}
        {/* The map itself, as the client asked (2026-09-23: "just keep the
            Map"). Lazy, so it loads only as the Visit section comes near,
            and inert (pointer-events none, out of the tab order): "View map"
            opens the interactive one. /privacy says exactly this. Her
            address is always set in real text beside this panel, so a
            visitor whose blocker stops Google still has it. */}
        {mapOk ? (
          <iframe
            title={`Map showing ${street}, ${town}`}
            src={embedSrc}
            referrerPolicy="no-referrer-when-downgrade"
            className="vm-preview"
            tabIndex={-1}
            aria-hidden="true"
          />
        ) : null}
        <span className="vm-preview-scrim" aria-hidden="true" />

        <button
          ref={opener}
          type="button"
          className="vm-expand"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          View map <span aria-hidden="true">&#8599;</span>
        </button>
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
        <div className="vm-overlay" role="presentation">
          <div className="vm-backdrop" onClick={close} aria-hidden="true" />
          <div
            ref={dialog}
            className="vm-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <button type="button" className="vm-close" onClick={close} aria-label="Close expanded map">
              <span aria-hidden="true">Close</span>
              <span aria-hidden="true" className="vm-close-x">&times;</span>
            </button>

            {/* Mounted only now, so it is fully interactive here and cannot
                have trapped a single wheel event before this point. */}
            <iframe
              title={title}
              src={embedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="vm-frame"
            />

            {/* The map is a third-party frame that a blocker, a network or a
                consent tool can all remove. This sits underneath it, so the
                address and a working link survive whatever happens to it. */}
            <div className="vm-frame-fallback" aria-hidden="true">
              <p className="vm-panel-street">{street}</p>
              <p className="vm-panel-sub">{town} &middot; {postcode}</p>
            </div>

            <a
              className="vm-open-external"
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps <span aria-hidden="true">&#8599;</span>
            </a>
          </div>
        </div>,
        document.body,
      )
        : null}
    </>
  );
}
