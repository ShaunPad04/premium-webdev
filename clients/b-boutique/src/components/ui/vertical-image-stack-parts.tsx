import Link from "next/link";
/* Shared by the static stack (drawn on the server) and the live one (the
   motion library, loaded later), so the two draw exactly the same cards. */
export type StackItem = {
  id: string;
  sources: { type: string; srcSet: string }[];
  fallback: string;
  alt: string;
  title: string;
  sub: string;
  href: string;
};

export const STYLE = (diff: number) =>
  diff === 0 ? { y: 0, scale: 1, opacity: 1, rotateX: 0, zIndex: 5 }
  : diff === -1 ? { y: -150, scale: 0.82, opacity: 0.55, rotateX: 8, zIndex: 4 }
  : diff === -2 ? { y: -260, scale: 0.7, opacity: 0.25, rotateX: 15, zIndex: 3 }
  : diff === 1 ? { y: 150, scale: 0.82, opacity: 0.55, rotateX: -8, zIndex: 4 }
  : diff === 2 ? { y: 260, scale: 0.7, opacity: 0.25, rotateX: -15, zIndex: 3 }
  : { y: diff > 0 ? 380 : -380, scale: 0.6, opacity: 0, rotateX: diff > 0 ? -20 : 20, zIndex: 0 };

export function StackCard({ item, focusable }: { item: StackItem; focusable: boolean }) {
  return (
    <Link href={item.href} className="vis-card" tabIndex={focusable ? 0 : -1} aria-hidden={focusable ? undefined : true} draggable={false}>
      <picture>
        {item.sources.map((s) => <source key={s.type} type={s.type} srcSet={s.srcSet} sizes="(min-width: 768px) 340px, 70vw" />)}
        <img src={item.fallback} alt={item.alt} loading="lazy" decoding="async" draggable={false} className="vis-img" />
      </picture>
      <span className="vis-cap">
        <span className="vis-title">{item.title}</span>
        <span className="vis-sub">{item.sub}</span>
      </span>
    </Link>
  );
}

export function StackChrome({ n, current, labels, onGo }: { n: number; current: number; labels: string[]; onGo?: (i: number) => void }) {
  return (
    <>
      <div className="vis-count" aria-hidden="true">
        <span className="vis-count-now">{String(current + 1).padStart(2, "0")}</span>
        <span className="vis-count-rule" />
        <span className="vis-count-all">{String(n).padStart(2, "0")}</span>
      </div>
      <div className="vis-dots">
        {labels.map((t, i) => (
          <button
            key={i}
            type="button"
            className="vis-dot"
            data-on={i === current ? "" : undefined}
            aria-label={`Show ${t}`}
            aria-current={i === current ? "true" : undefined}
            onClick={() => onGo?.(i)}
          />
        ))}
      </div>
    </>
  );
}
