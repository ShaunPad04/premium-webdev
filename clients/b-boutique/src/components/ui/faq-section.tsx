"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { ArrowButton } from "@/components/ArrowButton";
import { cn } from "@/lib/utils";

/* Vendored from the supplied FaqSection component.
 *
 * The structure, the public API and the interaction are the original's: a
 * forwardRef <section>, a header, a list of independently-toggling rows each
 * with its own open state, a rotating mark, a height-and-opacity panel, and
 * an optional contact block at the foot. What follows is every place it
 * deviates, recorded so a future reader does not diff this against the
 * original and assume it drifted by accident.
 *
 * 1. `motion/react`, not `framer-motion`. They are the same library — Motion
 *    is Framer Motion after the rename — and `motion@13` is already a
 *    dependency here for CornerMenu and the testimonial rail. Installing
 *    framer-motion would have put a second copy of the same animation runtime
 *    in the bundle for nothing.
 *
 * 2. The shadcn colour tokens are gone, because this project defines none of
 *    them. `bg-muted`, `text-foreground`, `text-primary`, `border-border`,
 *    `bg-background` and `text-muted-foreground` all resolve to nothing here:
 *    the section would have rendered with invisible borders and no greys.
 *    They are mapped onto this site's own scale instead — see lib/shop.ts's
 *    neighbours in globals.css for the tokens.
 *
 * 3. The heading's gradient is gone. `bg-clip-text text-transparent` over a
 *    gradient is on this project's banned list, and the heading treatment is
 *    a locked decision besides: Bodoni Moda at editorial scale, solid colour.
 *    It keeps the existing `.faq-h2` class rather than restating the clamp.
 *
 * 4. No boxes. The original wraps each row in `rounded-lg border
 *    border-border/50` and fills it with a gradient when open. The client
 *    rejected exactly that twice, in those words, and DESIGN.md's system is
 *    square with no shadow vocabulary at all. A row here is a hairline and
 *    some air, which is what every other list on this site is.
 *
 * 5. `lucide-react` is not installed and is not added for one glyph. The mark
 *    is the same two-stroke plus-to-minus used elsewhere on the site, drawn
 *    inline. It rotates on open, as the original's chevron does; the
 *    original's `scale: 1.1` alongside the rotation is dropped, because the
 *    rotation is the affordance and the scale was decoration on a section the
 *    client has twice asked to calm down.
 *
 * 6. `<h3>` CONTAINS the button rather than sitting inside one. The original
 *    puts an `<h3>` inside `<Button variant="ghost">`, which inverts the
 *    semantics — a heading is not a child of a control. This way the document
 *    outline is right, and shadcn's Button, class-variance-authority and
 *    @radix-ui/react-slot are all unnecessary.
 *
 * 7. `onContact?: () => void` became `href`. A real shop's contact action is
 *    a `tel:` or `mailto:` link: it works with no JavaScript, it can be
 *    long-pressed on a phone, and it shows its destination before it is
 *    tapped. A click handler can do none of that. The site's existing
 *    ArrowButton renders it, rather than a second button being written.
 *
 * 8. `container` is not used — there is no Tailwind container config in this
 *    project, which is Tailwind v4 with its configuration in CSS. The section
 *    keeps the editorial gutters every other section uses, via `.faq`.
 *
 * 9. An `eyebrow` and a `notice` prop are added. The eyebrow is this site's
 *    section grammar. The notice carries the placeholder warning: five of the
 *    eight answers are demo copy, and that line is the only thing stopping
 *    them reading as settled shop policy.
 *
 * ── The one substantive change: answers stay in the document ──────────────
 *
 * The original renders the panel as `{isOpen && <panel>}`, so seven of the
 * eight answers are simply absent from the HTML. Two of these answers are the
 * shop's address and its opening hours, both derived from shop.ts, and they
 * are the most valuable crawlable facts on the page — the questions a person
 * arrives at this site to have answered.
 *
 * So the panel is always mounted. It animates between height 0 and auto with
 * the overflow clipped, and carries `inert` while closed so that assistive
 * technology does not read out eight answers at once. The source stays
 * complete and the accessibility tree stays correct.
 *
 * Known cost, stated rather than hidden: this is a client component with
 * state, so with JavaScript disabled the rows no longer open. The
 * implementation this replaces was a native <details> group and needed no
 * script at all. `defaultOpen` exists to soften that — the first row is open
 * on arrival, so the section always says something — but it is a real
 * regression against what PRODUCT.md records, and that document is being
 * corrected in the same pass rather than left to disagree with the code. */

/** The site's easing curve, as a cubic-bezier for Motion. Matches --bb-ease
 *  in globals.css; it is restated here because a CSS custom property cannot
 *  be read by a JS animation. */
const EASE = [0.22, 1, 0.36, 1] as const;

export type FaqSectionItem = {
  question: string;
  answer: string;
};

export interface FaqSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Small tracked label above the heading. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Rendered under the description. Used for the placeholder-copy warning. */
  notice?: string;
  items: FaqSectionItem[];
  /** Index of the row open on first paint, or null for none. */
  defaultOpen?: number | null;
  contactInfo?: {
    title: string;
    description: string;
    buttonText: string;
    /** tel: or mailto: — see deviation 7. */
    href: string;
    secondary?: { label: string; href: string };
  };
}

const FaqSection = React.forwardRef<HTMLElement, FaqSectionProps>(
  (
    {
      className,
      eyebrow,
      title,
      description,
      notice,
      items,
      defaultOpen = 0,
      contactInfo,
      ...props
    },
    ref,
  ) => {
    const headingId = React.useId();

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        className={cn("faq", className)}
        {...props}
      >
        <div className="faq-inner">
          <div className="faq-intro">
            {eyebrow ? <p className="faq-eyebrow">{eyebrow}</p> : null}
            <h2 id={headingId} className="faq-h2">
              {title}
            </h2>
            {description ? <p className="faq-lede">{description}</p> : null}
            {notice ? <p className="faq-pending">{notice}</p> : null}
          </div>

          <div>
            {items.map((item, index) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                index={index}
                isLast={index === items.length - 1}
                defaultOpen={defaultOpen === index}
              />
            ))}
          </div>

          {contactInfo ? (
            <div>
              {/* No rule of its own. The last row already closes with one,
                  and `.faq-inner`'s gap sets the distance — a second hairline
                  60px under the first read as a mistake, not a division. */}
              <p className="faq-contact-title">{contactInfo.title}</p>
              <p className="mt-2.5 max-w-[46ch] text-[14px] leading-[1.7] text-bb-grey-dark">
                {contactInfo.description}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
                <ArrowButton href={contactInfo.href} tone="dark">
                  {contactInfo.buttonText}
                </ArrowButton>
                {contactInfo.secondary ? (
                  <a
                    href={contactInfo.secondary.href}
                    className="inline-flex items-center gap-2 text-[14px] text-bb-grey-dark underline decoration-[rgba(26,20,22,0.25)] underline-offset-4 transition-colors hover:text-bb-black hover:decoration-current"
                  >
                    {/* Functional rather than decorative: it identifies the
                        link's kind before the address is read. The original's
                        circled Mail badge above the heading was neither, and
                        a circled icon is the support-desk signal this section
                        is trying not to send. */}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className="shrink-0"
                    >
                      <rect
                        x="1.5"
                        y="3.5"
                        width="13"
                        height="9"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.1"
                      />
                      <path
                        d="M2 4.5l6 4 6-4"
                        stroke="currentColor"
                        strokeWidth="1.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {contactInfo.secondary.label}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    );
  },
);
FaqSection.displayName = "FaqSection";

const FaqItem = React.forwardRef<
  HTMLDivElement,
  {
    question: string;
    answer: string;
    index: number;
    isLast: boolean;
    defaultOpen: boolean;
  }
>(({ question, answer, isLast, defaultOpen }, ref) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const panelId = React.useId();
  const reduced = useReducedMotion();

  return (
    <div
      ref={ref}
      className={cn("group border-t border-line", isLast && "border-b")}
    >
      {/* The heading owns the button, not the other way round — deviation 6. */}
      <h3 className="m-0">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          /* The row is the target: 24px of padding on 26px of type clears
             any touch minimum comfortably, and on a phone the whole width of
             the question is tappable rather than a chevron at the end of it.

             outline-none with an underline on the question instead of a ring:
             a 2px box drawn around a full-width row is what the client
             objected to, and Safari and Firefox both match :focus-visible on
             a mouse click where Chromium does not — so the treatment has to
             look deliberate for pointer users, not only for keyboard ones. */
          className="flex w-full items-center justify-between gap-6 py-6 text-left outline-none"
        >
          <span
            className={cn(
              "font-display text-[clamp(19px,1.9vw,26px)] font-normal leading-[1.18] tracking-[-0.018em] transition-colors duration-200",
              "underline-offset-[10px] decoration-2 group-has-[:focus-visible]:underline",
              isOpen ? "text-bb-black" : "text-bb-black-soft",
            )}
          >
            {question}
          </span>

          {/* Two hairlines rather than a chevron glyph: the vertical stroke
              collapses as the whole mark turns, so a plus becomes a minus in
              one move instead of one character being swapped for another. */}
          <motion.span
            aria-hidden="true"
            animate={{ rotate: isOpen ? 180 : 0 }}
            /* Matched to the panel above, not left at its old 0.3s. The mark
               and the row are one gesture; a mark that lands a fifth of a
               second before the answer does reads as two separate things
               happening. Same open/close asymmetry for the same reason. */
            transition={
              reduced ? { duration: 0 } : { duration: isOpen ? 0.52 : 0.34, ease: EASE }
            }
            className={cn(
              "shrink-0 transition-colors duration-200",
              isOpen ? "text-bb-black" : "text-bb-grey-dark",
            )}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M3 12h18"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <path
                d="M12 3v18"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                style={{
                  transform: isOpen ? "scaleY(0)" : "scaleY(1)",
                  transformOrigin: "center",
                  /* Durations mirror the motion.span that wraps this, so the
                     plus collapses into a minus at exactly the rate the whole
                     mark turns. A CSS custom property cannot be read by the
                     JS tween above, so the curve is restated here — the two
                     must be changed together. */
                  transition: reduced
                    ? "none"
                    : `transform ${isOpen ? 520 : 340}ms cubic-bezier(0.22,1,0.36,1)`,
                }}
              />
            </svg>
          </motion.span>
        </button>
      </h3>

      {/* Always mounted — see the header. `inert` keeps a closed answer out of
          the accessibility tree while leaving it in the HTML.

          ── Why the height and the words animate SEPARATELY ──────────────────
          This used to be one tween: `{ height: auto, opacity: 1 }` at 0.32s.
          Both properties therefore reached full value at the same instant,
          which means the answer was fading up while its own box was still
          growing underneath it. The eye reads that as a snap — the text is
          legible long before the row has finished moving, so the motion looks
          like it arrives late rather than like one gesture.

          Split, it becomes a sequence: the row opens, and the words follow it
          in. The panel takes 0.52s on the site's easing curve; the paragraph
          waits 0.14s and then fades over 0.42s with 8px of travel, so it
          settles just after the height does.

          Closing is deliberately NOT the mirror of opening. It is 0.16s with
          no delay, because a reader who has decided to close a row wants it
          gone, and a slow, graceful collapse reads as the interface being
          reluctant. Open slowly, close briskly.

          The curve is unchanged — EASE, the site's expo-out — because the
          request was for smoother, not for a different character, and a
          bounce or an elastic here would fight every other reveal on the
          page. */}
      <motion.div
        id={panelId}
        inert={!isOpen}
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={
          reduced ? { duration: 0 } : { duration: isOpen ? 0.52 : 0.34, ease: EASE }
        }
        style={{ overflow: "hidden" }}
      >
        <motion.p
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 8 }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  opacity: {
                    duration: isOpen ? 0.42 : 0.16,
                    delay: isOpen ? 0.14 : 0,
                    ease: EASE,
                  },
                  y: {
                    duration: isOpen ? 0.52 : 0.16,
                    delay: isOpen ? 0.1 : 0,
                    ease: EASE,
                  },
                }
          }
          className="max-w-[64ch] pb-7 pr-8 text-[14px] leading-[1.75] text-bb-grey-dark"
        >
          {answer}
        </motion.p>
      </motion.div>
    </div>
  );
});
FaqItem.displayName = "FaqItem";

export { FaqSection };
