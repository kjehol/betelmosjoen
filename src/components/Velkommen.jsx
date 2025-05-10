// src/components/Velkommen.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import ShortsModal from "./ShortsModal";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import SubscribeInstructionsModal from "./SubscribeInstructionsModal";

const bibelvers = [
  { vers: "Salme 46:2", tekst: "Gud er vår tilflukt og styrke, en hjelp i nød og alltid nær" },
  { vers: "Romerne 8:1", tekst: "Så er det da ingen fordømmelse for dem som er i Kristus Jesus." },
  { vers: "Johannes 3:16", tekst: "For så har Gud elsket verden at han gav Sin Sønn, den enbårne, for at hver den som tror på ham, ikke skal fortapes, men ha evig liv." },
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
  const [events, setEvents] = useState([]);
  const [kalenderLastet, setKalenderLastet] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [podcast, setPodcast] = useState(null);
  const [shortsOpen, setShortsOpen] = useState(false);
  const [shortsList, setShortsList] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showInstr, setShowInstr] = useState(false);
  
  // --- 1 Funksjon for å hente varsler fra API-et ---
  const loadNotifications = useCallback(() => {
    axios.get('/api/onesignal-history')
      .then(res => {
        if (Array.isArray(res.data)) {
          setNotifications(res.data);
          setNotificationError(false);
        } else {
          setNotifications([]);
          setNotificationError(true);
        }
      })
      .catch(err => {
        console.error('Kunne ikke hente varsler:', err);
        setNotificationError(true);
      });
  }, []);

  // Initialize OneSignal
  useEffect(() => {
    window.OneSignal = window.OneSignal || [];
    OneSignal.push(() => {
      OneSignal.init({
        appId: "91a37b72-ff1d-466b-a530-067784114675",
        allowLocalhostAsSecureOrigin: true,
        notifyButton: { enable: true, position: "bottom-left" },
      });
    });
  }, []);

  // Når man trykker på Abonner-knappen: vis instruksjons-modal
  function subscribePush() {
      setShowInstr(true);
  }

  // Velg tilfeldig bibelvers
  useEffect(() => {
      const idx = Math.floor(Math.random() * bibelvers.length);
      setDagensVers(bibelvers[idx]);
    }, []);
  
  // 2 Initial henting av varsler
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Hent kalenderhendelser med robust håndtering
  useEffect(() => {
    axios.get("/api/kalender")
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          setEvents(data);
        } else if (typeof data === "string") {
          try {
            const parsed = JSON.parse(data);
            setEvents(Array.isArray(parsed) ? parsed : []);
          } catch (err) {
            console.warn("Kunne ikke parse kalender-data som JSON:", err);
            setEvents([]);
          }
        } else {
          console.warn("Ugyldig kalender-format:", data);
          setEvents([]);
        }
      })
      .catch(err => {
        console.error("Feil ved henting av kalender:", err);
        setEvents([]);
      })
      .finally(() => setKalenderLastet(true));
  }, []);

  // Hent siste podcast
  useEffect(() => {
    axios.get("/api/podcast")
      .then(res => setPodcast(res.data))
      .catch(err => console.error("Feil ved henting av podcast:", err));
  }, []);

  // Hent YouTube-shorts
  useEffect(() => {
    axios.get("/api/shorts")
      .then(res => setShortsList(res.data))
      .catch(err => console.error("Feil ved henting av shorts:", err));
  }, []);

  // 3 Når appen (fanen) blir synlig igjen => refetch varsler
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadNotifications();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loadNotifications]);
  
  return (
    <Layout>
      {/* Modal for instruksjoner */}
      <SubscribeInstructionsModal
        show={showInstr}
        onClose={() => setShowInstr(false)}
      />

      {/* Topptekst */}
      <h1 className="text-3xl font-bold mb-6 text-center">Betel-appen</h1>

      {/* Dagens bibelvers */}
      {dagensVers && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8 shadow-sm rounded">
          <p className="text-gray-800 text-lg">“{dagensVers.tekst}”</p>
          <p className="text-sm text-right text-blue-800 font-semibold mt-2">— {dagensVers.vers}</p>
        </div>
      )}

      {/* Siste nytt med abonner-knapp */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">🛎️ Siste nytt</h2>
          <button onClick={subscribePush} className="text-blue-600 hover:underline text-sm">
            Abonner på varsler
          </button>
        </div>
        {notifications.length > 0 ? (
          <ul className="space-y-4">
          {notifications.map((n, i) => (
            <li key={i} className="p-4 bg-gray-50 rounded shadow-sm">
              <h3 className="font-bold text-lg">{n.title}</h3>
              <p className="text-gray-700 mt-1">{n.body}</p>
              <small className="text-gray-500">
                {new Date(n.time).toLocaleString('nb-NO', {
                   day: 'numeric',
                   month: 'long',
                   year: 'numeric',
                   hour: '2-digit',
                   minute: '2-digit',
                })}
              </small>
            </li>
          ))}
        </ul>
        ) : (
          <p className="text-gray-500 italic">Ingen nye varsler.</p>
        )}
      </div>

      {/* Kommende uke */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">📅 Kommende uke</h2>
          <Link to="/kalender" className="text-blue-600 hover:underline text-sm">
            Vis hele kalenderen
          </Link>
        </div>

        {!kalenderLastet ? (
          <p className="text-gray-500 text-sm italic">Laster kalender…</p>
        ) : Array.isArray(events) && events.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Ingen kommende hendelser.</p>
        ) : Array.isArray(events) ? (
          events.map((evt, i) => (
            <div key={i} className="mb-4 p-4 bg-gray-50 rounded shadow-sm">
              <h3 className="font-semibold">{evt.title}</h3>
              <p className="text-sm text-gray-600">
                {new Date(evt.start).toLocaleString("nb-NO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {evt.location && <p className="text-sm text-gray-500">{evt.location}</p>}

              {evt.description && expandedEvent === i && (
                <p className="mt-1 text-sm text-gray-700">{evt.description}</p>
              )}
              {evt.description && (
                <button
                  onClick={() => setExpandedEvent(expandedEvent === i ? null : i)}
                  className="mt-1 text-blue-600 hover:underline text-sm"
                >
                  {expandedEvent === i ? "Skjul" : "Les mer..."}
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-red-600 text-sm">Ugyldig kalenderdata mottatt.</p>
        )}
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
              day: "numeric", month: "long", year: "numeric"
            })}
            {podcast.duration && (
              <span className="text-xs text-gray-400 ml-2">🕒 {podcast.duration}</span>
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
      {shortsList.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">🎬 Siste Shorts</h2>
            <a
              href="https://www.youtube.com/playlist?list=PLVK1cH92NjJOzN1Ufj84wpZUVWysGLOQE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Vis hele spillelisten (YouTube)
            </a>
          </div>
          <div
            className="relative mx-auto w-[180px] sm:w-[220px] md:w-[260px] rounded-xl overflow-hidden shadow-md cursor-pointer"
            onClick={() => setShortsOpen(true)}
          >
            <div className="w-full" style={{ paddingBottom: "177.78%" }} />
            <div
              className="absolute top-0 left-0 w-full h-full bg-center bg-cover"
              style={{
                backgroundImage: `url(https://img.youtube.com/vi/${shortsList[0].id}/maxresdefault.jpg)`,
              }}
            />
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => setShortsOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm mt-3"
            >
              Se Shorts-videoer
            </button>
          </div>
          {shortsOpen && (
            <ShortsModal
              videos={shortsList}
              //index={0} åpner den første videoen
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
          <a href="https://www.facebook.com/pinsekirken/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-blue-600 hover:text-blue-800 text-3xl">
            <FaFacebook />
          </a>
          <a href="https://www.instagram.com/pinsekirkenbetel/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-pink-500 hover:text-pink-700 text-3xl">
            <FaInstagram />
          </a>
          <a href="https://www.youtube.com/channel/UCTh9NjVRJloHl7XXCiP_f3A" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-red-600 hover:text-red-800 text-3xl">
            <FaYoutube />
          </a>
        </div>
      </div>
    </Layout>
  );
}
