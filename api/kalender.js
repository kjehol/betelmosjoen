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

    // 2) Hent begge .ics-feeds
    const urls = [
      "https://r.elvanto.eu/fullcalendar/3b80c6e3-5b09-41c4-ad5d-64a3ac452897/904a47d1-5f81-4ad9-a3c6-f9c1a4898461.ics", // Gudstjenester
      "https://r.elvanto.eu/fullcalendar/3b80c6e3-5b09-41c4-ad5d-64a3ac452897/admin-services.ics" // Aktiviteter
    ];

    const now = new Date();
    const allEvents = [];

    for (const url of urls) {
      const rsp = await fetch(url, { timeout: 7000 });
      if (!rsp.ok) throw new Error(`Feil fra Elvanto: ${rsp.status}`);
      const text = await rsp.text();

      const data = ical.parseICS(text);
      const events = Object.values(data)
        .filter((e) => e.type === "VEVENT" && e.start >= now)
        .map((e) => ({
          title: e.summary,
          start: e.start.toISOString(),
          end: e.end.toISOString(),
          description: e.description || "",
          location: e.location || "",
        }));

      allEvents.push(...events);
    }

    // 3) Sorter og ta de neste 3 hendelsene
    const upcoming = allEvents
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 3);

    // 4) Cache i Redis
    await redis.set("elvanto-events", upcoming, { ex: 3600 });

    return res.status(200).json(upcoming);
  } catch (err) {
    console.error("API /kalender feilet:", err);
    return res.status(500).json({ error: err.message });
  }
}
