import { Redis } from "@upstash/redis";
import axios from "axios";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    // Prøv å hente fra cache først
    const cached = await redis.get("shorts-ids");
    if (cached) {
      return res.status(200).json(cached);
    }

    const allIds = [];
    let nextPageToken = null;

    do {
      const response = await axios.get("https://www.googleapis.com/youtube/v3/playlistItems", {
        params: {
          part: "contentDetails",
          maxResults: 50,
          playlistId: "PLVK1cH92NjJOzN1Ufj84wpZUVWysGLOQE",
          key: "AIzaSyALsDU-cXaIxAU52QtOO-A-muJboPt-CBo",
          pageToken: nextPageToken,
        },
      });

      const ids = response.data.items.map((item) => item.contentDetails.videoId);
      allIds.push(...ids);
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    // Lagre i cache
    await redis.set("shorts-ids", allIds, { ex: 3600 }); // 1 time

    return res.status(200).json(allIds);
  } catch (err) {
    console.error("API-feil /api/shorts", err);
    return res.status(500).json({ error: "Feil ved henting av shorts" });
  }
}
