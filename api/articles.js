// api/articles.js
import { Redis } from "@upstash/redis";
import { XMLParser } from "fast-xml-parser";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    // 1) Prøv cache
    const cached = await redis.get("articles-feed");
    if (cached) {
      return res.status(200).json(cached);
    }

    // 2) Hent RSS-XML direkte
    const feedUrl = "https://www.betelmosjoen.no/blog-feed.xml";
    const rsp = await fetch(feedUrl, { timeout: 5000 });
    if (!rsp.ok) throw new Error(`RSS fetch feilet: ${rsp.status}`);
    const xml = await rsp.text();

    // 3) Parse XML
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);
    const items = parsed?.rss?.channel?.item || [];

    // 4) Transformer til JSON
    const articles = items.map((item) => {
      const description = item.description || "";
      const content = item["content:encoded"] || "";
      const categories = Array.isArray(item.category)
        ? item.category
        : item.category
        ? [item.category]
        : [];

      return {
        title: item.title || "",
        link: item.link || "",
        pubDate: item.pubDate || "",
        contentSnippet: description.replace(/<[^>]+>/g, "").substring(0, 200),
        fullContent: content.replace(/<[^>]+>/g, ""),
        image: item.enclosure?.["@_url"] || null,
        categories,
      };
    });

    // 5) Cache i 1 time
    await redis.set("articles-feed", articles, { ex: 3600 });
    return res.status(200).json(articles);
  } catch (err) {
    console.error("Articles API feilet:", err);
    return res.status(500).json({ error: err.message });
  }
}
