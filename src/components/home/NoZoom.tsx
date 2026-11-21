"use client";

import { useEffect } from "react";

// The homepage ignores zooming (on request, 2026-11-21: on laptops set to 80% the page looked
// small with wide empty sides). Two halves:
// - CSS (globals.css, `:root:has(main[data-no-zoom])`): from 1536px wide the whole page scales up
//   with the window, so zooming out, or a browser whose default zoom is 80%, shows the same page,
//   filling the width, and a big monitor looks like a laptop.
// - This: Ctrl/Cmd + / - / 0, Ctrl + mouse wheel and trackpad pinches do nothing here, and on
//   phones the page can't be pinched (with the page's viewport: maximumScale 1, userScalable false).
// A zoom picked from the browser's own menu can't be blocked by any website; the CSS still evens
// out zooming out. Every other page zooms as normal.
export function NoZoom() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["+", "=", "-", "_", "0"].includes(e.key)) e.preventDefault();
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault(); // Ctrl + wheel, and trackpad pinches in Chrome, Edge, Firefox
    };
    const stop = (e: Event) => e.preventDefault(); // Safari's pinch (Mac trackpad, iPhone)
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault(); // two-finger pinch on phones
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchmove", onTouch, { passive: false });
    document.addEventListener("gesturestart", stop);
    document.addEventListener("gesturechange", stop);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouch);
      document.removeEventListener("gesturestart", stop);
      document.removeEventListener("gesturechange", stop);
    };
  }, []);
  return null;
}
