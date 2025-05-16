import { Redis } from "@upstash/redis";
import { XMLParser } from "fast-xml-parser";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    // 1) Sjekk cache
    const cached = await redis.get("latest-podcast");
    if (cached) {
      const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
      return res.status(200).json(parsed);
    }

    // 2) Hent RSS-feed direkte
    const feedUrl = "https://feed.podbean.com/pinsekirkenbetel/feed.xml";
    const rssRes = await fetch(feedUrl);
    if (!rssRes.ok) {
      throw new Error(`RSS-fetch feilet: ${rssRes.status}`);
    }
    const xml = await rssRes.text();

    // 3) Parse XML
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);
    const item = parsed?.rss?.channel?.item?.[0];
    if (!item) {
      throw new Error("Ingen item i RSS");
    }

    // 4) Bygg episode-objekt
    const parts = (item["itunes:duration"] || "").split(":").map(Number);
    let duration = "";
    if (parts.length === 1) duration = `${Math.round(parts[0] / 60)} min`;
    else if (parts.length === 2) duration = `${Math.round(parts[0] + parts[1] / 60)} min`;
    else duration = `${Math.round(parts[0] * 60 + parts[1] + parts[2] / 60)} min`;

    const episode = {
      title: item.title || "",
      pubDate: item.pubDate || "",
      audioUrl: item.enclosure?.["@_url"] || "",
      description: (item.description || "").replace(/(<([^>]+)>)/gi, ""),
      duration,
    };

    // 5) Cache som JSON-streng i 1 time
    await redis.set("latest-podcast", JSON.stringify(episode), { ex: 3600 });
    return res.status(200).json(episode);

  } catch (err) {
    console.error("Podcast API feilet:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
