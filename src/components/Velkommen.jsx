import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import ShortsModal from "./ShortsModal"; // Juster path hvis nødvendig
import { Link } from "react-router-dom";
import { getCache, setCache } from "../lib/cache"; // Legg til denne importen

const bibelvers = [
  { vers: "Salme 46:2", tekst: "Gud er vår tilflukt og styrke, en hjelp i nød og alltid nær" },
  { vers: "Romerne 8:1", tekst: "Så er det da ingen fordømmelse for dem som er i Kristus Jesus." },
  { vers: "Johannes 3:16", tekst: "For så har Gud elsket verden at han gav sin Sønn, den enbårne, for at hver den som tror på ham, ikke skal fortapes, men ha evig liv." },
  { vers: "Filipperne 4:13", tekst: "Alt makter jeg i Ham som gjør meg sterk." },
  { vers: "2 Korinter 5:17", tekst: "Derfor, om noen er i Kristus, da er han en ny skapning. Det gamle er forbi, se, alt er blitt nytt." },
  { vers: "Salme 23:1", tekst: "Herren er min hyrde, jeg mangler ikke noe." },
  { vers: "Jesaja 41:10", tekst: "Frykt ikke, for jeg er med deg. Se deg ikke engstelig om, for jeg er din Gud." },
  { vers: "Matteus 11:28", tekst: "Kom til meg, alle dere som strever og har tungt å bære, og jeg vil gi dere hvile." },
  { vers: "Johannes 14:27", tekst: "Fred etterlater jeg dere. Min fred gir jeg dere, ikke den fred som verden gir." },
  { vers: "Klag 3:22–23", tekst: "Herrens miskunn er det at det ikke er forbi med oss, for hans barmhjertighet har ikke tatt slutt. Den er ny hver morgen. Din trofasthet er stor." },
];

export default function Velkommen() {
  const [dagensVers, setDagensVers] = useState(null);
  const [kalenderLastet, setKalenderLastet] = useState(false);
  const [podcast, setPodcast] = useState(null);
  const [shortsOpen, setShortsOpen] = useState(false);
  const [shortsVideoIds, setShortsVideoIds] = useState([]);

  useEffect(() => {
    const tilfeldig = Math.floor(Math.random() * bibelvers.length);
    setDagensVers(bibelvers[tilfeldig]);
  }, []);

  useEffect(() => {
    if (!document.getElementById("elvanto-script-3724")) {
      const script = document.createElement("script");
      script.id = "elvanto-script-3724";
      script.src = "https://minbetel.elvanto.eu/calendar_embed.js?c[]=904a47d1-5f81-4ad9-a3c6-f9c1a4898461&ca[]=services&events=1&upcoming[count]=1&upcoming[timeframe]=w&max=3&el_id=3724";
      script.async = true;
      script.onload = () => setKalenderLastet(true);
      document.body.appendChild(script);
    } else {
      setKalenderLastet(true);
    }
    setTimeout(() => {
        const el = document.getElementById("elvanto-events-3724");
        if (el && el.innerHTML.trim().length === 0) {
          setKalenderLastet(false);
        }
      }, 3000);
      
  }, []);

  useEffect(() => {
    const fetchPodcast = async () => {
        try {
          const cachedPodcast = await getCache("latest-podcast");
          if (cachedPodcast) {
            setPodcast(cachedPodcast);
            return;
          }
      
          const proxy = "https://api.allorigins.win/raw?url=";
          const feedUrl = "https://feed.podbean.com/pinsekirkenbetel/feed.xml";
          const fullUrl = proxy + encodeURIComponent(feedUrl);
      
          const { data } = await axios.get(fullUrl);
          const parser = new DOMParser();
          const xml = parser.parseFromString(data, "text/xml");
          const first = xml.querySelector("item");
      
          const durationRaw = first.getElementsByTagName("itunes:duration")[0]?.textContent || "";
          const duration = parseDuration(durationRaw);
      
          const episode = {
            title: first.querySelector("title")?.textContent || "",
            pubDate: first.querySelector("pubDate")?.textContent || "",
            audioUrl: first.querySelector("enclosure")?.getAttribute("url") || "",
            description: first.querySelector("description")?.textContent.replace(/(<([^>]+)>)/gi, "").substring(0, 150) + "...",
            duration,
          };
      
          await setCache("latest-podcast", episode, 3600); // Cache i 1 time
          setPodcast(episode);
        } catch (err) {
          console.error("Feil ved henting av podcast:", err);
        }
      };
      
  
    fetchPodcast();
  }, []);
  
  useEffect(() => {
    const fetchAllShorts = async () => {
      const allIds = [];
      let nextPageToken = null;
  
      try {
        do {
          const response = await axios.get("https://www.googleapis.com/youtube/v3/playlistItems", {
            params: {
              part: "contentDetails",
              maxResults: 50,
              playlistId: "PLVK1cH92NjJOzN1Ufj84wpZUVWysGLOQE",
              key: "AIzaSyALsDU-cXaIxAU52QtOO-A-muJboPt-CBo",
              pageToken: nextPageToken,
            },
          });
  
          const ids = response.data.items.map((item) => item.contentDetails.videoId);
          allIds.push(...ids);
          nextPageToken = response.data.nextPageToken;
        } while (nextPageToken);
  
        setShortsVideoIds(allIds);
      } catch (err) {
        console.error("Feil ved henting av shorts:", err);
      }
    };
  
    fetchAllShorts();
  }, []);
  

  const parseDuration = (str) => {
    if (!str) return null;
    const parts = str.split(":").map(Number);
    if (parts.length === 1) return `${Math.round(parts[0] / 60)} min`;
    if (parts.length === 2) return `${Math.round(parts[0] + parts[1] / 60)} min`;
    if (parts.length === 3) return `${Math.round(parts[0] * 60 + parts[1] + parts[2] / 60)} min`;
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Velkommen til Betel-appen!</h1>

      {dagensVers && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8 shadow-sm rounded">
          <p className="text-gray-800 text-lg">“{dagensVers.tekst}”</p>
          <p className="text-sm text-right text-blue-800 font-semibold mt-2">— {dagensVers.vers}</p>
        </div>
      )}

     {/* Kommende uke */}
        <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">📅 Kommende uke</h2>
            <Link to="/kalender" className="text-blue-600 hover:underline text-sm">
            Vis hele kalenderen
            </Link>
        </div>
        <div id="elvanto-events-3724" className="bg-gray-50 rounded p-4 shadow-inner">
            {!kalenderLastet && (
            <p className="text-gray-500 text-sm italic">Laster kalender...</p>
            )}
        </div>
        <div id="elvanto-events-3724" className="bg-gray-50 rounded p-4 shadow-inner">
            {!kalenderLastet && (
        <div className="text-sm text-gray-500 text-center italic">
        Kalenderen lastet ikke.{" "}
        <button
            className="underline text-blue-600"
            onClick={() => window.location.reload()}
        >
            Last siden på nytt
        </button>
        </div>
  )}
</div>

        </div>

    {/* Podcast */}
        {podcast && (
        <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">🎧 Siste tale</h2>
            <Link to="/podcast" className="text-blue-600 hover:underline text-sm">
                Vis alle episoder
            </Link>
            </div>
            <h3 className="text-xl font-bold mb-1">{podcast.title}</h3>
            <p className="text-sm text-gray-500 mb-2">
            {new Date(podcast.pubDate).toLocaleDateString("nb-NO", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })}
            {podcast.duration && (
                <span className="text-xs text-gray-400 ml-2">
                🕒 {podcast.duration}
                </span>
            )}
            </p>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-sm text-gray-700 mb-3">
            {podcast.description}
            </blockquote>
            <audio controls className="w-full">
            <source src={podcast.audioUrl} type="audio/mpeg" />
            </audio>
        </div>
        )}


      {/* Shorts */}
      {shortsVideoIds.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">🎬 Siste Shorts</h2>
            <a
              href="https://www.youtube.com/playlist?list=PLVK1cH92NjJOzN1Ufj84wpZUVWysGLOQE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Vis hele spillelisten
            </a>
          </div>

          <div
            className="relative mx-auto w-[180px] sm:w-[220px] md:w-[260px] rounded-xl overflow-hidden shadow-md cursor-pointer"
            onClick={() => setShortsOpen(true)}
          >
            <div className="w-full" style={{ paddingBottom: "177.78%" }}></div>
            <div
              className="absolute top-0 left-0 w-full h-full bg-center bg-cover"
              style={{
                backgroundImage: shortsVideoIds[0]
                ? `url(https://img.youtube.com/vi/${shortsVideoIds[0]}/maxresdefault.jpg)`
                : "none",
              }}
              onError={(e) => {
                e.currentTarget.style.backgroundImage = `url(https://img.youtube.com/vi/${shortsVideoIds[0]}/hqdefault.jpg)`;
              }}
            ></div>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={() => setShortsOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm mt-3"
            >
              Åpne Shorts-video
            </button>
          </div>

          {shortsOpen && (
            <ShortsModal
              videos={shortsVideoIds}
              index={0}
              onClose={() => setShortsOpen(false)}
            />
          )}
        </div>
      )}

      {/* Nettside */}
      <div className="mb-10 text-center">
        <p className="mb-4 text-gray-700">Nettsiden vår har mye mer info og ressurser</p>
        <a
          href="https://www.betelmosjoen.no"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg"
        >
          Gå til nettsiden
        </a>
      </div>

      {/* Sosiale medier */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Følg oss på sosiale medier</h2>
        <div className="flex justify-center space-x-6">
          <a href="https://www.facebook.com/pinsekirken/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-blue-600 hover:text-blue-800 text-3xl"><FaFacebook /></a>
          <a href="https://www.instagram.com/pinsekirkenbetel/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-pink-500 hover:text-pink-700 text-3xl"><FaInstagram /></a>
          <a href="https://www.youtube.com/channel/UCTh9NjVRJloHl7XXCiP_f3A" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-red-600 hover:text-red-800 text-3xl"><FaYoutube /></a>
        </div>
      </div>
    </div>
  );
}
