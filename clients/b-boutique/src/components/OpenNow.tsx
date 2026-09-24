"use client";

import { useEffect, useState } from "react";

import { hours, formatHour } from "@/lib/shop";

/* "Open now · until 16:00" / "Closed · opens 10:00" (2026-09-24, Brad).
 *
 * Worked out on the SHOP's clock, not the visitor's: the old badge was
 * removed because it read the visitor's time zone and told anyone abroad
 * the wrong thing. Intl with timeZone "Europe/London" gives the weekday and
 * time in Cleethorpes wherever the reader is. It renders only after mount
 * (the server cannot know the time the page is read), into a line that
 * already has its height, so nothing shifts. Rechecked every minute. */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function londonNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { day: get("weekday"), mins: Number(get("hour")) * 60 + Number(get("minute")) };
}

function status(): { open: boolean; text: string } {
  const { day, mins } = londonNow();
  const today = hours.find((d) => d.day === day)?.hours;
  if (today && mins >= today.open * 60 && mins < today.close * 60) {
    return { open: true, text: `until ${formatHour(today.close)}` };
  }
  if (today && mins < today.open * 60) return { open: false, text: `opens ${formatHour(today.open)}` };
  // After closing, or a closed day: the next day that opens.
  const i = DAYS.indexOf(day);
  for (let k = 1; k <= 7; k++) {
    const d = DAYS[(i + k) % 7];
    const h = hours.find((x) => x.day === d)?.hours;
    if (h) return { open: false, text: k === 1 ? `opens ${formatHour(h.open)}` : `opens ${d} ${formatHour(h.open)}` };
  }
  return { open: false, text: "" };
}

export function OpenNow() {
  const [s, setS] = useState<ReturnType<typeof status> | null>(null);
  useEffect(() => {
    const tick = () => setS(status());
    tick();
    const t = window.setInterval(tick, 60_000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <p className="vx-now" data-open={s?.open ? "" : undefined} aria-live="polite">
      {s ? (
        <>
          <span className="vx-now-dot" aria-hidden="true" />
          <span className="vx-now-state">{s.open ? "Open now" : "Closed"}</span>
          {s.text ? <span className="vx-now-when"> · {s.text}</span> : null}
        </>
      ) : null}
    </p>
  );
}
