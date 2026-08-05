"use client";

import { useEffect, useRef, useState } from "react";

/**
 * LIKOVA-style custom cursor: a small filled dot that tracks instantly, and a
 * larger ring that trails with easing and swells over interactive elements.
 * Disabled on touch / coarse pointers.
 */
export default function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);

    const mouse = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
      }
      const el = e.target as HTMLElement;
      setHovering(
        !!el.closest(
          'a, button, [role="button"], input, label, [data-cursor="hover"]'
        )
      );
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    const loop = () => {
      ringPos.x += (mouse.x - ringPos.x) * 0.16;
      ringPos.y += (mouse.y - ringPos.y) * 0.16;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      <div
        ref={ring}
        className="fixed left-0 top-0 rounded-full border border-cream/50 transition-[width,height,opacity,background-color] duration-300 ease-out"
        style={{
          width: hovering ? 54 : 34,
          height: hovering ? 54 : 34,
          opacity: down ? 0.4 : 1,
          backgroundColor: hovering
            ? "rgba(201,169,106,0.10)"
            : "transparent",
          borderColor: hovering
            ? "rgba(201,169,106,0.7)"
            : "rgba(241,234,221,0.45)",
        }}
      />
      <div
        ref={dot}
        className="fixed left-0 top-0 h-1 w-1 rounded-full bg-cream"
        style={{ opacity: hovering ? 0 : 1 }}
      />
    </div>
  );
}
