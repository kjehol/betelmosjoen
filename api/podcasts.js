// api/podcasts.js
import axios from "axios";
import { Redis } from "@upstash/redis";
import { XMLParser } from "fast-xml-parser";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    // 1) Prøv cache
    const cached = await redis.get("podcasts-all");
    if (cached) {
      return res.status(200).json(cached);
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

    // Sørg for at items er en array
    if (!Array.isArray(items)) items = [items];

    // 4) Transformer hver item til et enklere JS-objekt
    const episodes = items.map((item) => {
      const durParts = (item["itunes:duration"] || "").split(":").map(Number);
      let duration = "";
      if (durParts.length === 1) duration = `${Math.round(durParts[0] / 60)} min`;
      else if (durParts.length === 2)
        duration = `${Math.round(durParts[0] + durParts[1] / 60)} min`;
      else
        duration = `${Math.round(
          durParts[0] * 60 + durParts[1] + durParts[2] / 60
        )} min`;

      return {
        title: item.title || "",
        pubDate: item.pubDate || "",
        audioUrl: item.enclosure?.["@_url"] || "",
        description: (item.description || "")
          .replace(/(<([^>]+)>)/gi, "")
          .substring(0, 150),
        duration,
      };
    });

    // 5) Cache i 1 time
    await redis.set("podcasts-all", episodes, { ex: 3600 });
    return res.status(200).json(episodes);
  } catch (err) {
    console.error("Podcasts-all API feilet:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
