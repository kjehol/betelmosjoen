// api/kalender.js
import { Redis } from "@upstash/redis";
import ical from "node-ical";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    // 1) Prøv cache
    const cached = await redis.get("elvanto-events");
    if (cached) {
      return res.status(200).json(cached);
    }

    // 2) Hent .ics-feed direkte fra Elvanto
    const icsUrl =
      "https://r.elvanto.eu/fullcalendar/3b80c6e3-5b09-41c4-ad5d-64a3ac452897/904a47d1-5f81-4ad9-a3c6-f9c1a4898461.ics";
    const rsp = await fetch(icsUrl, { timeout: 7000 });
    if (!rsp.ok) throw new Error(`Feil fra Elvanto: ${rsp.status}`);
    const text = await rsp.text();

    // 3) Parse ICS
    const data = ical.parseICS(text);
    const now = new Date();

    // 4) plukk ut kommende 3 events
    const events = Object.values(data)
      .filter((e) => e.type === "VEVENT" && e.start >= now)
      .sort((a, b) => a.start - b.start)
      .slice(0, 3)
      .map((e) => ({
        title: e.summary,
        start: e.start.toISOString(),
        end: e.end.toISOString(),
        description: e.description || "",
        location: e.location || "",
      }));

    // 5) cache i Redis i 1 time
    await redis.set("elvanto-events", events, { ex: 3600 });

    return res.status(200).json(events);
  } catch (err) {
    console.error("API /kalender feilet:", err);
    return res.status(500).json({ error: err.message });
  }
}
