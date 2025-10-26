// api/podcasts.js
import axios from "axios";
import { Redis } from "@upstash/redis";
import { XMLParser } from "fast-xml-parser";

const redis = Redis.fromEnv();

// Hjelpefunksjon for å hente ut tekst fra RSS-felt
function getText(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    if (val["#text"]) return val["#text"];
    if (val["#cdata-section"]) return val["#cdata-section"];
    // Hvis det er et objekt med én nøkkel, returner verdien
    const keys = Object.keys(val);
    if (keys.length === 1) return getText(val[keys[0]]);
    return JSON.stringify(val);
  }
  return String(val);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    // 1) Prøv cache
    const cached = await redis.get("podcasts-all");
    if (cached) {
      let episodes;
      try {
        episodes = typeof cached === "string" ? JSON.parse(cached) : cached;
      } catch (err) {
        console.error("Feil ved parsing av cached podcasts-all:", err);
        episodes = [];
      }
      if (Array.isArray(episodes) && episodes.length > 0) {
        return res.status(200).json(episodes);
      }
      // Hvis cache er tom eller feil, fortsett til å hente fra RSS
    }

    // 2) Hent RSS-feed direkte fra Podbean, med 5s timeout
    const { data: xml } = await axios.get(
      "https://feed.podbean.com/pinsekirkenbetel/feed.xml",
      { timeout: 5000 }
    );

    // 3) Parse til JSON-struktur
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);
    let items = parsed?.rss?.channel?.item || [];
    console.log("RSS items:", items); // Debug: logg ut items

    // Sørg for at items er en array
    if (!Array.isArray(items)) items = [items];

    // 4) Transformer hver item til et enklere JS-objekt
    const episodes = items.map((item) => {
      const durParts = (item["itunes:duration"] || "").toString().split(":").map(Number);
      let duration = "";
      if (durParts.length === 1) duration = `${Math.round(durParts[0] / 60)} min`;
      else if (durParts.length === 2)
        duration = `${Math.round(durParts[0] + durParts[1] / 60)} min`;
      else
        duration = `${Math.round(
          durParts[0] * 60 + durParts[1] + durParts[2] / 60
        )} min`;

      // Robust beskrivelse
      const description = getText(item.description);

      // Robust guid
      let guid = getText(item.guid);
      if (!guid || guid === "{}" || guid === "[object Object]" || guid.trim() === "") {
        // Fallback til episodeLink eller title
        let fallback = "";
        if (Array.isArray(item.link)) {
          fallback = item.link.find(l => typeof l === "string" && l.startsWith("http")) || "";
        } else if (typeof item.link === "string") {
          fallback = item.link;
        } else if (typeof item.link === "object") {
          fallback = getText(item.link);
        } else {
          fallback = getText(item.title) || "";
        }
        guid = fallback;
      }
      if (typeof guid !== "string") {
        guid = getText(guid) || JSON.stringify(guid);
      }
      guid = guid.trim();
      if (!guid) {
        guid = getText(item.title) || "";
      }

      // Robust title
      const title = getText(item.title);

      // Robust pubDate
      const pubDate = getText(item.pubDate);

      // Robust episodeLink
      let episodeLink = "";
      if (Array.isArray(item.link)) {
        episodeLink = item.link.find(l => typeof l === "string" && l.startsWith("http")) || "";
      } else if (typeof item.link === "string") {
        episodeLink = item.link;
      } else if (typeof item.link === "object") {
        episodeLink = getText(item.link);
      }

      // Robust håndtering av enclosure og url
      let audioUrl = "";
      if (item.enclosure && (item.enclosure["@_url"] || item.enclosure.url)) {
        audioUrl = item.enclosure["@_url"] || item.enclosure.url;
      }

      return {
        title,
        pubDate,
        audioUrl,
        description,
        duration,
        episodeLink,
        guid,
      };
    });

    // 5) Cache i 1 time
    await redis.set("podcasts-all", JSON.stringify(episodes), { ex: 3600 });
    return res.status(200).json(episodes);
  } catch (err) {
    console.error("Podcasts-all API feilet:", err); // Logg hele error-objektet
    return res.status(500).json({ error: err.message || String(err) });
  }
}
