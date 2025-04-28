// api/podcast.js
import { Redis } from "@upstash/redis";
import { XMLParser } from "fast-xml-parser";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    // 1) Sjekk cache
    const cached = await redis.get("latest-podcast");
    if (cached) return res.status(200).json(cached);

    // 2) Hent RSS-XML direkte fra Podbean
    const feedUrl = "https://feed.podbean.com/pinsekirkenbetel/feed.xml";
    const rssRes = await fetch(feedUrl, { timeout: 5000 });
    if (!rssRes.ok) {
      throw new Error(`RSS-fetch feilet: ${rssRes.status}`);
    }
    const xml = await rssRes.text();

    // 3) Parse XML
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);
    const item = parsed?.rss?.channel?.item?.[0];
    if (!item) throw new Error("Fant ingen item i RSS");

    // 4) Bygg episode‐objekt
    const dur = (item["itunes:duration"] || "")
      .split(":")
      .map(Number);
    const duration =
      dur.length === 1
        ? `${Math.round(dur[0] / 60)} min`
        : dur.length === 2
        ? `${Math.round(dur[0] + dur[1] / 60)} min`
        : `${Math.round(dur[0] * 60 + dur[1] + dur[2] / 60)} min`;

    const episode = {
      title: item.title || "",
      pubDate: item.pubDate || "",
      audioUrl: item.enclosure?.["@_url"] || "",
      description:
        (item.description || "")
          .replace(/(<([^>]+)>)/gi, "")
          .substring(0, 150) + "...",
      duration,
    };

    // 5) Cache i 1 time og returner
    await redis.set("latest-podcast", episode, { ex: 3600 });
    return res.status(200).json(episode);
  } catch (err) {
    console.error("Podcast API feilet:", err);
    return res.status(500).json({ error: err.message });
  }
}
