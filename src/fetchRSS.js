import axios from "axios";

export const fetchFeed = async () => {
  try {
    const proxyUrl = "https://api.allorigins.win/raw?url=";
    const feedUrl = "https://www.betelmosjoen.no/blog-feed.xml";
    const fullUrl = proxyUrl + encodeURIComponent(feedUrl);

    const { data } = await axios.get(fullUrl);
    const parser = new DOMParser();
    const xml = parser.parseFromString(data, "text/xml");

    const items = xml.querySelectorAll("item");

    return Array.from(items).map((item) => ({
      title: item.querySelector("title")?.textContent ?? "",
      link: item.querySelector("link")?.textContent ?? "",
      pubDate: item.querySelector("pubDate")?.textContent ?? "",
      contentSnippet: item.querySelector("description")?.textContent ?? "",
    }));
  } catch (err) {
    console.error("RSS-feil:", err);
    return [];
  }
};
