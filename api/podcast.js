// api/podcast.js
export const config = { runtime: "edge" };

import { Redis } from "@upstash/redis";
import { XMLParser } from "fast-xml-parser";

const redis = Redis.fromEnv();

export default async function handler(request) {
  try {
    // 1) Prøv cache
    const cached = await redis.get("latest-podcast");
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2) Hent RSS-feed via proxy
    const proxy = "https://api.allorigins.win/raw?url=";
    const feedUrl = "https://feed.podbean.com/pinsekirkenbetel/feed.xml";
    const res = await fetch(proxy + encodeURIComponent(feedUrl));
    if (!res.ok) throw new Error(`RSS-fetch feilet: ${res.status}`);
    const xml = await res.text();

    // 3) Parse XML
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);
    const item = parsed?.rss?.channel?.item?.[0];
    if (!item) throw new Error("Ingen item i RSS");

    // 4) Bygg objekt
    const durParts = (item["itunes:duration"] || "").split(":").map(Number);
    const duration =
      durParts.length === 1
        ? `${Math.round(durParts[0] / 60)} min`
        : durParts.length === 2
        ? `${Math.round(durParts[0] + durParts[1] / 60)} min`
        : `${Math.round(durParts[0] * 60 + durParts[1] + durParts[2] / 60)} min`;

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

    // 5) Cache og return
    await redis.set("latest-podcast", episode, { ex: 3600 });
    return new Response(JSON.stringify(episode), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Podcast API feilet:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
