"use client";

import { useEffect, useState } from "react";

/* The policy pages' on-this-page list, after 21st.dev "Table of Contents"
   (hirael): links on a left rule; the section in view carries the dark
   marker and aria-current. Plain anchor links, so it works without script. */
export function PolicyToc({ items }: { items: { id: string; text: string }[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const cur = items.find(({ id }) => {
        const r = document.getElementById(id)?.getBoundingClientRect();
        return r ? r.bottom > 120 && r.top < innerHeight * 0.6 : false;
      });
      setActive(cur ? cur.id : null);
    };
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, [items]);

  return (
    <nav aria-label="On this page" className="pol-toc">
      <p className="pol-toc-label">On this page</p>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} aria-current={active === i.id ? "true" : undefined}>
              {i.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
