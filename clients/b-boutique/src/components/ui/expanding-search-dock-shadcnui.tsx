"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* The 21st.dev "Expanding Search Dock", adapted (2026-09-23).
 *
 * The original imports `framer-motion` and `lucide-react`. Neither is added:
 * `motion/react` is the same library under its current name and is already in
 * the header bundle (CornerMenu), and the site draws its icons as inline SVG.
 * Installing both would ship a second copy of the animation runtime for one
 * button.
 *
 * Also changed from the original, deliberately:
 * - It is controlled. NavSearch owns the query so the live results panel
 *   under the header keeps working; this is only the field.
 * - The expand is a clip-path reveal plus an opacity fade, not an animated
 *   `width`. The pill is drawn at its final size and uncovered from the icon
 *   outwards, so nothing in the header row is re-laid out mid-animation.
 * - The trigger never unmounts. It is hidden while the field is open and gets
 *   focus back on close, so Escape returns a keyboard user where they were. */

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  /** id of the results panel the field drives. */
  controls?: string;
  triggerRef?: RefObject<HTMLButtonElement | null>;
  children?: ReactNode;
};

const Glass = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export function ExpandingSearchDock({
  open,
  onOpenChange,
  value,
  onValueChange,
  onSearch,
  placeholder = "Search...",
  controls,
  triggerRef,
  children,
}: Props) {
  const reduce = usePrefersReducedMotion();
  /* The field's fade in and out is CSS (globals.css, .sdock-form), not the
     motion library: this sits in the header on every page, and the library
     was ~50KB of the first download for an 180ms opacity fade. `shown`
     keeps the field mounted while it fades out; it is set during render,
     not in an effect, and cleared when the fade-out ends. */
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);
  if (!open && shown && reduce) setShown(false);
  const closing = !open && shown;
  const input = useRef<HTMLInputElement>(null);
  const ownTrigger = useRef<HTMLButtonElement>(null);
  const trigger = triggerRef ?? ownTrigger;
  const wasOpen = useRef(open);

  useEffect(() => {
    if (open) {
      input.current?.focus({ preventScroll: true });
      wasOpen.current = true;
      return;
    }
    /* Only hand focus back if focus was inside the field when it closed.
       A click elsewhere on the page closes it too, and must not yank focus
       back up to the header. */
    if (wasOpen.current && document.activeElement === document.body) {
      trigger.current?.focus();
    }
    wasOpen.current = false;
  }, [open, trigger]);

  return (
    <div className="sdock" data-open={open || undefined}>
      <button
        ref={trigger}
        type="button"
        className="sdock-trigger"
        aria-expanded={open}
        aria-controls={controls}
        onClick={() => onOpenChange(true)}
      >
        <span className="sr-only">Search</span>
        <Glass />
      </button>

      {shown ? (
          <form
            role="search"
            className="sdock-form"
            data-closing={closing || undefined}
            inert={closing || undefined}
            onAnimationEnd={(e) => {
              if (e.animationName === "sdock-fade-out") setShown(false);
            }}
            onSubmit={(e) => {
              e.preventDefault();
              const q = value.trim();
              if (q) onSearch?.(q);
            }}
          >
            <span className="sdock-icon">
              <Glass size={16} />
            </span>
            <input
              ref={input}
              type="search"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder={placeholder}
              aria-label="Search the shop"
              aria-controls={controls}
              className="sdock-input"
              enterKeyHint="search"
            />
            <button
              type="button"
              className="sdock-close"
              onClick={() => {
                onOpenChange(false);
                requestAnimationFrame(() => trigger.current?.focus());
              }}
            >
              <span className="sr-only">Close search</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </form>
        ) : null}
      {children}
    </div>
  );
}
