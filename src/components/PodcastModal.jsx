import { useState, useEffect } from "react";

export default function PodcastModal({ episode, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log("Episode data:", episode);
  }, [episode]);

  const handleShare = () => {
    const url = episode?.link; // Use the episode link directly from Podbean
    const shareText = episode?.title; // Use the episode title as the share text

    if (navigator.share) {
      console.log("Sharing URL:", url);
      console.log("Sharing text:", shareText);
      navigator
        .share({
          title: shareText, // Set the title to the episode title
          text: `Hør denne episoden fra Betel Mosjøen: ${shareText}`, // Set the text to the episode title
          url,
        })
        .catch((err) => console.error("Deling avbrutt eller feilet:", err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-lg max-w-xl w-full shadow-lg relative">
          {/* Lukkeknapp */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            aria-label="Lukk"
          >
            &times;
          </button>

          {/* Tittel og dato */}
          <h2 className="text-xl font-bold mb-2">{episode.title}</h2>
          <p className="text-sm text-gray-500 mb-4">
            {new Date(episode.pubDate).toLocaleDateString("nb-NO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {/* Beskrivelse med formatering */}
          <div
            className="mb-4 text-sm prose max-w-none"
            dangerouslySetInnerHTML={{ __html: episode.description }}
          />
        </div>
      </div>

      {/* Toast-melding nederst */}
      {copied && !navigator.share && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-[60] animate-fade-in-out">
          Lenke kopiert til utklippstavlen
        </div>
      )}
    </>
  );
}
