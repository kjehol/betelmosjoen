// api/onesignal-history.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const APP_ID = process.env.ONESIGNAL_APP_ID;
  const API_KEY = process.env.ONESIGNAL_REST_API_KEY;
  console.log('📦 OneSignal APP_ID:', APP_ID);
  console.log('🔑 OneSignal API_KEY present?', Boolean(API_KEY));

  if (!APP_ID || !API_KEY) {
    return res.status(500).json({ error: 'Missing APP_ID or API_KEY' });
  }

  try {
    const url = `https://onesignal.com/api/v1/notifications?app_id=${APP_ID}&limit=3`;
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${API_KEY}` }
    });
    const json = await response.json();
    if (!response.ok) {
      console.error('OneSignal feilet:', json);
      throw new Error(`OneSignal status ${response.status}`);
    }
    return res.status(200).json(json.notifications || []);
  } catch (err) {
    console.error("Feil i onesignal-history:", err);
    return res.status(500).json({ error: err.message });
  }
}
