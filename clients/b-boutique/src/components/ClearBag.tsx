"use client";

import { useEffect } from "react";

import { useCart } from "@/lib/useCart";

/* Empties the bag when the customer lands back from the payment page.
 *
 * Deliberately on the success route only, and deliberately not before the
 * customer leaves for SumUp: emptying the bag at the moment they go means
 * anybody who abandons the payment page comes back to nothing and has to
 * start again. Clearing on return is the behaviour that survives a change of
 * mind.
 *
 * Renders nothing. It is an effect with a URL for a trigger. */
export function ClearBag() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
