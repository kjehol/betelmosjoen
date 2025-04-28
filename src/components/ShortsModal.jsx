// src/components/ShortsModal.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useSwipeable } from "react-swipeable";

export default function ShortsModal({ videos, index = 0, onClose }) {
  const [current, setCurrent] = useState(index);
  const [isMobile, setIsMobile] = useState(false);

  // Oppdater current når index prop endres
  useEffect(() => {
    setCurrent(index);
  }, [index]);

  // Sjekk om vi er på mobil (bredde <= 640px)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Navigasjons-funksjoner
  const goNext = useCallback(() => {
    setCurrent((i) => Math.min(i + 1, videos.length - 1));
  }, [videos.length]);

  const goPrev = useCallback(() => {
    setCurrent((i) => Math.max(i - 1, 0));
  }, []);

  // Tastaturnavigasjon (Escape + piler)
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (isMobile && e.key === "ArrowUp") goNext();
      if (isMobile && e.key === "ArrowDown") goPrev();
      if (e.key === "Escape") onClose();
    },
    [goNext, goPrev, onClose, isMobile]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  // Swipe‐handlers (kun på mobil)
  const swipeHandlers = useSwipeable({
    onSwipedUp: goNext,
    onSwipedDown: goPrev,
    trackTouch: true,
    trackMouse: false,
  });

  return (
    <div
      {...(isMobile ? swipeHandlers : {})}
      id="shorts-modal"
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center px-4"
      style={{ touchAction: isMobile ? "none" : "auto" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-auto flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* YouTube i 9:16-format */}
        <div
          className="relative w-full rounded-lg overflow-hidden"
          style={{ aspectRatio: "9/16" }}
        >
          <iframe
            key={videos[current]}
            src={`https://www.youtube.com/embed/${videos[current]}?autoplay=1&rel=0&modestbranding=1`}
            title={`Short ${current + 1}`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>

        {/* Lukke‐knapp */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-red-400"
          aria-label="Lukk"
        >
          ×
        </button>

        {/* Navigasjonsknapper (kun på desktop) */}
        {!isMobile && (
          <div className="flex gap-4 mt-4">
            <button
              onClick={goPrev}
              disabled={current === 0}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-300 text-sm disabled:opacity-50"
            >
              ◀ Forrige
            </button>
            <button
              onClick={goNext}
              disabled={current === videos.length - 1}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-300 text-sm disabled:opacity-50"
            >
              Neste ▶
            </button>
          </div>
        )}

        {/* Indikator (dots) */}
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
