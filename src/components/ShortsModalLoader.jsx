// /components/ShortsModalLoader.jsx
import React, { useEffect, useState } from "react";
import ShortsModal from "./ShortsModal";

export default function ShortsModalLoader({ onClose }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shorts")
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Feil ved henting av shorts:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center text-white">
        Laster Shorts...
      </div>
    );
  }

  return <ShortsModal videos={videos} onClose={onClose} />;
}