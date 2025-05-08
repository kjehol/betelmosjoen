// api/onesignal-history.js
export default async function handler(req, res) {
  // Debug logging for Vercel environment variables
  const APP_ID = process.env.ONESIGNAL_APP_ID;
  const API_KEY = process.env.ONESIGNAL_REST_API_KEY;
  console.log('🔹 OneSignal APP_ID:', APP_ID);
  console.log('🔹 OneSignal API_KEY present:', Boolean(process.env.ONESIGNAL_REST_API_KEY));

  if (!APP_ID || !API_KEY) {
    return res.status(500).json({ error: 'Missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY' });
  }

  try {
    const url = `https://onesignal.com/api/v1/notifications?app_id=${APP_ID}&limit=2`;
    // Use built-in fetch in Vercel's Node runtime
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${API_KEY}` }
    });
    const data = await response.json();

    if (!response.ok) {
      console.error('OneSignal API error:', data);
      return res.status(response.status).json({ error: data });
    }

    // Return only the notifications array
    return res.status(200).json(data.notifications || []);
  } catch (err) {
    console.error('Server error in onesignal-history:', err);
    return res.status(500).json({ error: err.message });
  }
}
