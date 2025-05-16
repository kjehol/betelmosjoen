// src/components/Podcast.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import PodcastModal from "./PodcastModal";

export default function Podcast() {
  const [episodes, setEpisodes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get("/api/podcasts");
        const data = res.data;

        if (Array.isArray(data)) {
          setEpisodes(data);
        } else if (typeof data === "string") {
          try {
            const parsed = JSON.parse(data);
            setEpisodes(Array.isArray(parsed) ? parsed : []);
          } catch (err) {
            console.warn("Klarte ikke å parse podcast-data:", err);
            setEpisodes([]);
          }
        } else {
          console.warn("Ugyldig format fra /api/podcasts:", data);
          setEpisodes([]);
        }
      } catch (err) {
        console.error("Feil ved henting av podcastepisoder:", err);
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Pinsekirken Betel Podcast</h1>
      <p className="text-m text-gray-600 mb-6 text-center">
        Her kan du høre forkynnelse og undervisning fra Gudstjenester & Samlinger.
      </p>

      {/* Lenker til tjenester */}
      <div className="flex flex-wrap gap-1 mb-6 justify-center border-b pb-2">
        <a
          href="https://podcasts.apple.com/no/podcast/pinsekirken-betel-podcast/id1741524525?l=nb"
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 w-16"
        >
          <img src="/images/logos/apple-podcast.png" alt="Apple Podcasts" className="object-contain h-full w-full" />
        </a>
        <a
          href="https://youtube.com/playlist?list=PLVK1cH92NjJM9CRryVNuwcHwtoAuAwz8p&si=qDUcbhN2IstUjiIC"
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 w-16"
        >
          <img src="/images/logos/youtube_logo.png" alt="YouTube" className="object-contain h-full w-full" />
        </a>
        <a
          href="https://pinsekirkenbetel.podbean.com"
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 w-16"
        >
          <img src="/images/logos/podbean-app.png" alt="Podbean" className="object-contain h-full w-full" />
        </a>
        <a
          href="https://open.spotify.com/show/5nqOPnybWSz8btZJfsaure"
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 w-16"
        >
          <img src="/images/logos/spotify.png" alt="Spotify" className="object-contain h-full w-full" />
        </a>
      </div>

      {loading ? (
        <p className="text-gray-500">Laster podcast…</p>
      ) : episodes.length === 0 ? (
        <p>Ingen episoder funnet.</p>
      ) : (
        episodes.map((ep, index) => (
          <div key={index} className="mb-8 border-b pb-4">
            <h2 className="text-xl font-semibold">{ep.title}</h2>

            {/* Dato og varighet */}
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <span>
                {new Date(ep.pubDate).toLocaleDateString("nb-NO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {ep.duration && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <span role="img" aria-label="varighet">
                    🕒
                  </span>
                  {ep.duration}
                </span>
              )}
            </p>

            {/* Beskrivelse */}
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-sm text-gray-700 mt-2">
              {ep.description.replace(/(<([^>]+)>)/gi, "").length > 200 ? ep.description.replace(/(<([^>]+)>)/gi, "").substring(0, 200) + "..." : ep.description.replace(/(<([^>]+)>)/gi, "")}
            </blockquote>

            {/* Avspiller */}
            <audio controls className="w-full mt-2">
              <source src={ep.audioUrl} type="audio/mpeg" />
              Din nettleser støtter ikke lydavspilling.
            </audio>

            {/* Full visning */}
            <button
              onClick={() => setSelected(ep)}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm mr-2"
            >
              Mer info
            </button>
            <button
              onClick={() => {
                navigator.share({
                  title: ep.title,
                  url: ep.episodeLink,
                });
              }}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm"
            >
              Del
            </button>
          </div>
        ))
      )}

      {selected && (
        <PodcastModal episode={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
