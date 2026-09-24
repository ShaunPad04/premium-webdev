"use client";

import { useState } from "react";

import { useBadges } from "@/lib/useBadges";
import { useSaved } from "@/lib/useSaved";

/* Under the price: the scarcity badge when counted stock earns one (see
   lib/scarcity.ts), then save and share. Share uses the phone's own share
   sheet where there is one and copies the link where there is not. */
export function PdpActions({ slug, name, isNew }: { slug: string; name: string; isNew: boolean }) {
  const badge = useBadges()[slug];
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(slug);
  const [copied, setCopied] = useState(false);

  return (
    <div className="pdpa">
      <div className="pdpa-badges">
        {isNew ? <span className="tag tag--new">New in</span> : null}
        {badge ? <span className="tag tag--scarce">{badge.label}</span> : null}
      </div>
      <div className="pdpa-acts">
        <button
          type="button"
          className="pdpa-btn"
          aria-pressed={saved}
          onClick={() => toggle(slug)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 20.5s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1Z"
              fill={saved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <span className="sr-only">{saved ? `Remove ${name} from saved` : `Save ${name}`}</span>
        </button>
        <button
          type="button"
          className="pdpa-btn"
          onClick={async () => {
            const url = window.location.href.split("?")[0];
            if (navigator.share) {
              try {
                await navigator.share({ title: `${name} · B Boutique`, url });
              } catch {}
              return;
            }
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {}
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7.5h14V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="sr-only">Share this piece</span>
        </button>
        <span className="pdpa-copied" role="status">{copied ? "Link copied" : ""}</span>
      </div>
    </div>
  );
}
