// src/components/ShortsModal.jsx

import React, { useState } from "react";

export default function ShortsModal({ videos, index = null, onClose }) {
  const [current, setCurrent] = useState(index);
  const [mode, setMode] = useState(index !== null ? "video" : "list");

  const openVideo = (idx) => {
    setCurrent(idx);
    setMode("video");
  };

  const goBackToList = () => {
    setMode("list");
    setCurrent(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-start px-4 py-6 overflow-y-auto"
    >
      {/* Lukke-knapp */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-red-400"
        aria-label="Lukk"
      >
        ×
      </button>

      {mode === "list" && (
        <div className="w-full max-w-md text-white mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">🎬 Shorts-videoer</h2>
          <div className="space-y-2">
            {videos.map((video, idx) => (
              <button
                key={video.id}
                onClick={() => openVideo(idx)}
                className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded shadow text-sm sm:text-base"
              >
                {video.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "video" && current !== null && (
        <div className="w-full max-w-sm mt-16 flex flex-col items-center">
          <div className="relative w-full rounded-lg overflow-hidden" style={{ aspectRatio: "9/16" }}>
            <iframe
              key={videos[current].id}
              src={`https://www.youtube.com/embed/${videos[current].id}?autoplay=1&modestbranding=1&rel=0&controls=1`}
              title={videos[current].title}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>

          <p className="text-white mt-4 text-center text-sm sm:text-base">
            {videos[current].title}
          </p>

          <button
            onClick={goBackToList}
            className="mt-4 text-blue-400 hover:underline text-sm sm:text-base"
          >
            ← Tilbake til liste
          </button>
        </div>
      )}
    </div>
  );
}
