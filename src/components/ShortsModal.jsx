import React, { useEffect, useCallback } from "react";

export default function ShortsModal({ videos, index, onClose }) {
  const [current, setCurrent] = React.useState(index || 0);

  const goNext = () => {
    if (current < videos.length - 1) setCurrent(current + 1);
  };

  const goPrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleKey = useCallback((e) => {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "Escape") onClose();
  }, [current]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // For mobil swipe
  useEffect(() => {
    const handleTouch = {
      startX: 0,
      endX: 0,
      onTouchStart(e) {
        this.startX = e.touches[0].clientX;
      },
      onTouchEnd(e) {
        this.endX = e.changedTouches[0].clientX;
        if (this.endX - this.startX > 50) goPrev();
        if (this.startX - this.endX > 50) goNext();
      }
    };

    const el = document.getElementById("shorts-modal");
    if (el) {
      el.addEventListener("touchstart", handleTouch.onTouchStart.bind(handleTouch));
      el.addEventListener("touchend", handleTouch.onTouchEnd.bind(handleTouch));
    }

    return () => {
      if (el) {
        el.removeEventListener("touchstart", handleTouch.onTouchStart.bind(handleTouch));
        el.removeEventListener("touchend", handleTouch.onTouchEnd.bind(handleTouch));
      }
    };
  }, [current]);

  return (
    <div
      id="shorts-modal"
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center px-4"
    >
      {/* Lukke-knapp */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-red-400"
        aria-label="Lukk"
      >
        ×
      </button>

      <div className="flex flex-col items-center w-full max-w-sm">
        {/* Video-visning i 9:16-format */}
        <div className="relative w-full rounded-lg overflow-hidden" style={{ aspectRatio: "9/16" }}>
          <iframe
            key={videos[current]}
            src={`https://www.youtube.com/embed/${videos[current]}?autoplay=1&rel=0&modestbranding=1`}
            title={`Short ${current + 1}`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>

        {/* Info og navigering */}
        <p className="text-white mt-3 text-sm">
          Video {current + 1} av {videos.length}
        </p>

        <div className="flex gap-4 mt-3">
          {current > 0 && (
            <button
              onClick={goPrev}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-300 text-sm"
            >
              ◀ Forrige
            </button>
          )}
          {current < videos.length - 1 && (
            <button
              onClick={goNext}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-300 text-sm"
            >
              Neste ▶
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
