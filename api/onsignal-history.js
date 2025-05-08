// api/onesignal-history.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const APP_ID = process.env.ONESIGNAL_APP_ID;
  const API_KEY = process.env.ONESIGNAL_REST_API_KEY;

  try {
    const url = `https://onesignal.com/api/v1/notifications?app_id=${APP_ID}&limit=3`;
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${API_KEY}` }
    });
    if (!response.ok) {
      throw new Error(`OneSignal feilet: ${response.status}`);
    }
    const json = await response.json();
    // json.notifications er en liste med de siste 3
    res.status(200).json(json.notifications || []);
  } catch (err) {
    console.error("Feil i onesignal-history:", err);
    res.status(500).json({ error: err.message });
  }
}
