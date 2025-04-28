import { Redis } from "@upstash/redis";
import axios from "axios";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    // Prøv å hente fra cache først
    const cached = await redis.get("latest-podcast");
    if (cached) {
      return res.status(200).json(cached);
    }

    // Hvis ikke cachet: hent live
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

    // Lagre i cache
    await redis.set("latest-podcast", episode, { ex: 3600 }); // 1 time

    return res.status(200).json(episode);
  } catch (err) {
    console.error("API-feil /api/podcast", err);
    return res.status(500).json({ error: "Feil ved henting av podcast" });
  }
}

function parseDuration(str) {
  if (!str) return null;
  const parts = str.split(":").map(Number);
  if (parts.length === 1) return `${Math.round(parts[0] / 60)} min`;
  if (parts.length === 2) return `${Math.round(parts[0] + parts[1] / 60)} min`;
  if (parts.length === 3) return `${Math.round(parts[0] * 60 + parts[1] + parts[2] / 60)} min`;
  return null;
}
