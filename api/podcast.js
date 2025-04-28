import { Redis } from "@upstash/redis";
import { XMLParser } from "fast-xml-parser";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end(); // Only GET
  }

  try {
    // 1) Sjekk cache
    const cached = await redis.get("latest-podcast");
    if (cached) {
      return res.status(200).json(cached);
    }

    // 2) Hent RSS-feed
    const proxy = "https://api.allorigins.win/raw?url=";
    const feedUrl = "https://feed.podbean.com/pinsekirkenbetel/feed.xml";
    const rssRes = await fetch(proxy + encodeURIComponent(feedUrl));
    if (!rssRes.ok) {
      throw new Error(`RSS-fetch feilet: ${rssRes.status}`);
    }
    const xml = await rssRes.text();

    // 3) Parse XML
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);
    const item = parsed?.rss?.channel?.item?.[0];
    if (!item) throw new Error("Ingen item i RSS");

    // 4) Bygg episode‐objekt
    const durParts = (item["itunes:duration"] || "").split(":").map(Number);
    let duration = "";
    if (durParts.length === 1) duration = `${Math.round(durParts[0] / 60)} min`;
    else if (durParts.length === 2) duration = `${Math.round(durParts[0] + durParts[1] / 60)} min`;
    else if (durParts.length === 3) duration = `${Math.round(durParts[0] * 60 + durParts[1] + durParts[2] / 60)} min`;

    const episode = {
      title: item.title || "",
      pubDate: item.pubDate || "",
      audioUrl: item.enclosure?.["@_url"] || "",
      description: (item.description || "").replace(/(<([^>]+)>)/gi, "").substring(0, 150) + "...",
      duration,
    };

    // 5) Cache og returner
    await redis.set("latest-podcast", episode, { ex: 3600 });
    return res.status(200).json(episode);

  } catch (err) {
    console.error("Podcast API feilet:", err);
    return res.status(500).json({ error: err.message });
  }
}
