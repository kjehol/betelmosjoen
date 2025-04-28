// src/components/ShortsModal.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useSwipeable } from "react-swipeable";

export default function ShortsModal({ videos, index = 0, onClose }) {
  const [current, setCurrent] = useState(index);

  // Oppdater current når index endres utenfra
  useEffect(() => {
    setCurrent(index);
  }, [index]);

  // Gå til neste video
  const goNext = useCallback(() => {
    setCurrent((i) => Math.min(i + 1, videos.length - 1));
  }, [videos.length]);

  // Gå til forrige video
  const goPrev = useCallback(() => {
    setCurrent((i) => Math.max(i - 1, 0));
  }, []);

  // Tastaturnavigasjon: pil opp/ned, Escape for å lukke
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowUp") goNext();
      if (e.key === "ArrowDown") goPrev();
      if (e.key === "Escape") onClose();
    },
    [goNext, goPrev, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Swipe-oppsett: sveip opp = neste, sveip ned = forrige
  const handlers = useSwipeable({
    onSwipedUp: goNext,
    onSwipedDown: goPrev,
    trackTouch: true,
    trackMouse: false,
  });

  return (
    <div
      {...handlers}
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-sm mx-auto select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* YouTube-iframe i 9:16-format */}
        <div className="relative w-full h-full rounded-lg overflow-hidden" style={{ aspectRatio: "9/16" }}>
          <iframe
            key={videos[current]}
            src={`https://www.youtube.com/embed/${videos[current]}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
            title={`Short ${current + 1}`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>

        {/* Lukk-knapp */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-red-400"
          aria-label="Lukk"
        >
          ×
        </button>

        {/* Indikator-punkter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {videos.map((_, i) => (
            <span
              key={i}
              className={`block w-2 h-2 rounded-full ${
                i === current ? "bg-white" : "bg-gray-500"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
