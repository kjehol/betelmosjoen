import { Redis } from "@upstash/redis";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";

const redis = Redis.fromEnv();

export async function GET() {
  try {
    const cached = await redis.get("latest-podcast");
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const proxy = "https://api.allorigins.win/raw?url=";
    const feedUrl = "https://feed.podbean.com/pinsekirkenbetel/feed.xml";
    const fullUrl = proxy + encodeURIComponent(feedUrl);

    const { data } = await axios.get(fullUrl);

    const parser = new XMLParser({
      ignoreAttributes: false,
    });

    const parsed = parser.parse(data);
    const first = parsed.rss.channel.item[0];

    const durationRaw = first["itunes:duration"] || "";
    const duration = parseDuration(durationRaw);

    const episode = {
      title: first.title || "",
      pubDate: first.pubDate || "",
      audioUrl: first.enclosure["@_url"] || "",
      description: (first.description || "").replace(/(<([^>]+)>)/gi, "").substring(0, 150) + "...",
      duration,
    };

    await redis.set("latest-podcast", episode, { ex: 3600 }); // Cache i 1 time

    return new Response(JSON.stringify(episode), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Feil i /api/podcast:", JSON.stringify(err, null, 2));
    return new Response(JSON.stringify({ error: "Feil ved henting av podcast" }), { status: 500 });
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
