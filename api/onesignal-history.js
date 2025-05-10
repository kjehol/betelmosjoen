// api/onesignal-history.js
export default async function handler(req, res) {
  const APP_ID = process.env.ONESIGNAL_APP_ID;
  const API_KEY = process.env.ONESIGNAL_REST_API_KEY;
  if (!APP_ID || !API_KEY) {
    return res.status(500).json({ error: 'Missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY' });
  }

  try {
    // Hent de to nyeste varslene (ferdigstilte)
    const url = `https://onesignal.com/api/v1/notifications?app_id=${APP_ID}&limit=2&finished=true`;
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${API_KEY}` }
    });
    const data = await response.json();

    if (!response.ok) {
      console.error('OneSignal API error:', data);
      return res.status(response.status).json({ error: data });
    }

    // Map om til et enklere format, returner ISO-dato som streng
    const out = (data.notifications || []).map(n => {
      // OneSignal returnerer ferdigstilt tid i `completed_at`
      // send_after / created_at fallback om behov
      const dateStr = n.completed_at || n.send_after || n.created_at;
      return {
        title:  n.headings?.en   || n.headings?.nb || 'Melding',
        body:   n.contents?.en   || n.contents?.nb || '',
        time:   dateStr          // La klienten gjøre parsing
      };
    });

    // Sorter slik at nyeste kommer først
    out.sort((a, b) => new Date(b.time) - new Date(a.time));

    return res.status(200).json(out);
  } catch (err) {
    console.error('Server error in onesignal-history:', err);
    return res.status(500).json({ error: err.message });
  }
}
