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
        const { data } = await axios.get("/api/podcasts");
        setEpisodes(data);
      } catch (err) {
        console.error("Feil ved henting av alle podcastepisoder:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Podcast</h1>
      <p className="text-sm text-gray-600 mb-6">
        Her kan du høre forkynnelse og undervisning fra Gudstjenester & Samlinger i
        Pinsekirken Betel, Mosjøen.
      </p>

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
              {ep.description}...
            </blockquote>

            {/* Avspiller */}
            <audio controls className="w-full mt-2">
              <source src={ep.audioUrl} type="audio/mpeg" />
              Din nettleser støtter ikke lydavspilling.
            </audio>

            {/* Full visning */}
            <button
              onClick={() => setSelected(ep)}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm"
            >
              Vis mer info
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
