"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { RevealText } from "@/components/RevealText";

/* The FAQ as an editorial index (2026-09-23, Brad: the accordion was
 * "extremely generic").
 *
 * Desktop: the questions are a numbered list set large in the display face;
 * the chosen one's answer sits in an ink panel beside them that stays put
 * while you read down the list. Phone: the same list, and the answer opens
 * in place under its question, because a panel above or below a list of
 * eight is out of view by the time you tap.
 *
 * Both answer surfaces exist in the DOM; CSS shows exactly one per
 * breakpoint with display:none, so a screen reader never meets it twice.
 * The first answer is open on the server render, so without JavaScript the
 * section still says something. Content is untouched: lib/faq.ts. */

const EASE = [0.22, 1, 0.36, 1] as const;

export type FaqIndexItem = { question: string; answer: string };

export function FaqIndex({
  id,
  eyebrow,
  title,
  items,
  contact,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  items: FaqIndexItem[];
  contact?: { title: string; description: string; label: string; href: string };
}) {
  const headingId = React.useId();
  const panelId = React.useId();
  const base = React.useId();
  const reduce = useReducedMotion();
  const [sel, setSel] = React.useState(0);
  const [inlineOpen, setInlineOpen] = React.useState(true);
  const pad = (n: number) => String(n + 1).padStart(2, "0");
  const current = items[sel];

  return (
    <section id={id} aria-labelledby={headingId} className="fqx">
      <div className="fqx-inner">
        <header className="fqx-head">
          {eyebrow ? <p className="fqx-eyebrow">{eyebrow}</p> : null}
          <RevealText id={headingId} className="fqx-h2">
            {title}
          </RevealText>
        </header>

        <div className="fqx-body">
          <ol className="fqx-list">
            {items.map((item, i) => {
              const on = i === sel;
              const inlineId = `${base}-a${i}`;
              return (
                <li key={item.question} className={`fqx-row${on ? " is-on" : ""}`}>
                  <h3 className="fqx-q-wrap">
                    <button
                      type="button"
                      className="fqx-q"
                      aria-expanded={on && inlineOpen}
                      aria-controls={`${inlineId} ${panelId}`}
                      onClick={() => {
                        if (on) setInlineOpen((v) => !v);
                        else {
                          setSel(i);
                          setInlineOpen(true);
                        }
                      }}
                    >
                      <span className="fqx-n" aria-hidden="true">{pad(i)}</span>
                      <span className="fqx-q-text">{item.question}</span>
                      <span className="fqx-mark" aria-hidden="true" />
                    </button>
                  </h3>
                  <div
                    id={inlineId}
                    className="fqx-inline"
                    hidden={!(on && inlineOpen)}
                  >
                    <p>{item.answer}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="fqx-aside">
            <div id={panelId} className="fqx-panel" aria-live="polite">
              {/* The big number sits OUTSIDE the animated answer (2026-09-24,
                  Brad: it "glitches and falls"). Inside it, the number was
                  positioned against the answer while its slide-in transform
                  ran, then jumped to the panel's corner when the transform
                  ended. Out here it has one anchor and only fades. */}
              <span key={sel} className="fqx-panel-n" aria-hidden="true" data-n={pad(sel)} />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={sel}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: reduce ? 0.01 : 0.38, ease: EASE }}
                >
                  <p className="fqx-panel-q">{current.question}</p>
                  <p className="fqx-panel-a">{current.answer}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {contact ? (
              <div className="fqx-contact">
                <p className="fqx-contact-t">{contact.title}</p>
                <p className="fqx-contact-d">{contact.description}</p>
                <a href={contact.href} className="fqx-contact-link">
                  {contact.label}
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
