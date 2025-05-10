// api/onesignal-history.js
export default async function handler(req, res) {
  const APP_ID = process.env.ONESIGNAL_APP_ID;
  const API_KEY = process.env.ONESIGNAL_REST_API_KEY;
  if (!APP_ID || !API_KEY) {
    return res.status(500).json({ error: 'Missing ONE...'}); 
  }

  try {
    const url = `https://onesignal.com/api/v1/notifications?app_id=${APP_ID}&limit=2`;
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${API_KEY}` }
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    const out = (data.notifications||[]).map(n => {
      const dateStr = n.completed_at || n.send_after || n.created_at;
      return {
        title: n.headings?.en || 'Melding',
        body:  n.contents?.en || '',
        time:  dateStr
                ? new Date(dateStr).getTime()
                : Date.now()
      };
    });

    // sortér nyeste først
    out.sort((a,b) => b.time - a.time);
    return res.status(200).json(out);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
