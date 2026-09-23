"use client";

import { useEffect } from "react";

/* On a phone the category pills are one swipeable row, so the current one
   can start off-screen ("Trousers" was the fourth of seven). This slides the
   ROW, not the page, so the chosen pill is in view on arrival. Horizontal
   scrollLeft only: scrollIntoView would also move the page vertically. */
export function CatbarScroll() {
  useEffect(() => {
    const list = document.querySelector<HTMLElement>(".catbar-list");
    const on = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !on || list.scrollWidth <= list.clientWidth) return;
    list.scrollLeft = on.offsetLeft - (list.clientWidth - on.offsetWidth) / 2;
  }, []);
  return null;
}
