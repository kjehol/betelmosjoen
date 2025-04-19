import { useEffect, useState } from "react";
import axios from "axios";

export default function Podcast() {
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const proxy = "https://api.allorigins.win/raw?url=";
        const feedUrl = "https://feed.podbean.com/pinsekirkenbetel/feed.xml";
        const fullUrl = proxy + encodeURIComponent(feedUrl);

        const { data } = await axios.get(fullUrl);
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "text/xml");

        const items = xml.querySelectorAll("item");
        const list = Array.from(items).map((item) => ({
          title: item.querySelector("title")?.textContent || "",
          link: item.querySelector("link")?.textContent || "",
          pubDate: item.querySelector("pubDate")?.textContent || "",
          audioUrl: item.querySelector("enclosure")?.getAttribute("url") || "",
        }));

        setEpisodes(list);
      } catch (err) {
        console.error("Feil ved henting av podcast:", err);
      }
    };

    fetchPodcast();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Podkast</h1>
      {episodes.length === 0 && <p>Ingen episoder funnet.</p>}
      {episodes.map((ep, index) => (
  <div key={index} className="mb-8">
    <h2 className="text-xl font-semibold">{ep.title}</h2>
    <p className="text-sm text-gray-500">
  {new Date(ep.pubDate).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}
</p>
    <audio controls className="w-full mt-2">
      <source src={ep.audio} type="audio/mpeg" />
      Din nettleser støtter ikke lydavspilling.
    </audio>
    <div className="flex flex-wrap gap-2 mt-4">
  <a
    href={ep.link}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm"
  >
    Åpne i Podbean
  </a>
  <a
    href="https://podcasts.apple.com/no/podcast/pinsekirken-betel-podcast/id1741524525?l=nb"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm"
  >
    Åpne i Apple Podcasts
  </a>
</div>
        </div>
))}
    </div>
  );
}
