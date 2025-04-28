import { Redis } from "@upstash/redis";
import { XMLParser } from "fast-xml-parser";
import axios from "axios";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    // 1) Sjekk cache
    const cached = await redis.get("latest-podcast");
    if (cached) {
      return res.status(200).json(cached);
    }

    // 2) Hent RSS-feed direkte, med 5s timeout
    const feedUrl = "https://feed.podbean.com/pinsekirkenbetel/feed.xml";
    const { data: xml } = await axios.get(feedUrl, { timeout: 5000 });

    // 3) Parse XML
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);
    const item = parsed?.rss?.channel?.item?.[0];
    if (!item) {
      throw new Error("Ingen item i RSS");
    }

    // 4) Bygg episode-objekt
    const durParts = (item["itunes:duration"] || "").split(":").map(Number);
    let duration = "";
    if (durParts.length === 1) duration = `${Math.round(durParts[0] / 60)} min`;
    else if (durParts.length === 2) duration = `${Math.round(durParts[0] + durParts[1] / 60)} min`;
    else duration = `${Math.round(durParts[0] * 60 + durParts[1] + durParts[2] / 60)} min`;

    const episode = {
      title: item.title || "",
      pubDate: item.pubDate || "",
      audioUrl: item.enclosure?.["@_url"] || "",
      description: (item.description || "").replace(/(<([^>]+)>)/gi, "").substring(0, 150) + "...",
      duration,
    };

    // 5) Cache i 1 time
    await redis.set("latest-podcast", episode, { ex: 3600 });
    return res.status(200).json(episode);

  } catch (err) {
    console.error("Podcast API feilet:", err.message);
    return res.status(500).json({ error: err.message });
  }
}


// File: api/shorts.js
import { Redis } from "@upstash/redis";

const redisShorts = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    // 1) Sjekk cache
    const cached = await redisShorts.get("shorts-ids");
    if (cached) {
      return res.status(200).json(cached);
    }

    // 2) Hent fra YouTube med innebygd fetch
    const allIds = [];
    let pageToken = "";
    do {
      const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      url.searchParams.set("part", "contentDetails");
      url.searchParams.set("maxResults", "50");
      url.searchParams.set("playlistId", "PLVK1cH92NjJOzN1Ufj84wpZUVWysGLOQE");
      url.searchParams.set("key", "AIzaSyALsDU-cXaIxAU52QtOO-A-muJboPt-CBo");
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const r = await fetch(url.toString());
      if (!r.ok) throw new Error(`YouTube API feilet: ${r.status}`);
      const data = await r.json();
      if (!data.items) throw new Error("Mangler items fra YouTube");

      allIds.push(...data.items.map((i) => i.contentDetails.videoId));
      pageToken = data.nextPageToken || "";
    } while (pageToken);

    // 3) Cache i 1 time
    await redisShorts.set("shorts-ids", allIds, { ex: 3600 });
    return res.status(200).json(allIds);

  } catch (err) {
    console.error("Shorts API feilet:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
