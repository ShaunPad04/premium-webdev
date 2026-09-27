"use client";

import { motion, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* /about's story, after 21st.dev "Scroll Reveal Content A" (abui): her
   photographs held on one side while numbered passages scroll past on the
   other, a line growing with them. Each passage brings in its own photograph.
   On a phone the photo sits above each passage instead (CSS). */
export function StoryScroll({ steps }: { steps: { n: string; title: string; body: ReactNode; pic: ReactNode }[] }) {
  const [on, setOn] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: box, offset: ["start center", "end center"] });

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setOn(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="rb" ref={box}>
      <div className="rb-media" aria-hidden="true">
        {steps.map((s, i) => (
          <div key={s.n} className="rb-img" data-on={on === i ? "" : undefined}>
            {s.pic}
          </div>
        ))}
      </div>
      <div className="rb-text">
        <motion.span className="rb-line" style={{ scaleY: still ? 1 : scrollYProgress }} aria-hidden="true" />
        {steps.map((s, i) => (
          <article
            key={s.n}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-i={i}
            className="rb-step"
            data-on={on === i ? "" : undefined}
          >
            <div className="rb-step-img">{s.pic}</div>
            <p className="rb-n" aria-hidden="true">{s.n}</p>
            <h2 className="rb-title">{s.title}</h2>
            <p className="rb-body">{s.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
