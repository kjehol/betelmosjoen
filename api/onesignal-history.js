// api/onesignal-history.js
export default async function handler(req, res) {
  const APP_ID = process.env.ONESIGNAL_APP_ID;
  const API_KEY = process.env.ONESIGNAL_REST_API_KEY;
  if (!APP_ID || !API_KEY) {
    return res.status(500).json({ error: 'Missing ONE_SIGNAL_APP_ID or ONE_SIGNAL_REST_API_KEY' });
  }

  try {
    const url = `https://onesignal.com/api/v1/notifications?app_id=${APP_ID}&limit=2`;
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${API_KEY}` }
    });
    const data = await response.json();

    if (!response.ok) {
      console.error('OneSignal API error:', data);
      return res.status(response.status).json({ error: data });
    }

    const out = (data.notifications || []).map(n => {
      // hent tidspunkt: fullført, planlagt eller opprettet
      const val = n.completed_at ?? n.send_after ?? n.created_at;
      let timestamp;

      if (!val) {
        // fallback til nå
        timestamp = Date.now();
      } else if (typeof val === 'number') {
        // OneSignal gir UNIX-tid i sekunder: gang med 1000
        timestamp = val * 1000;
      } else if (!isNaN(Date.parse(val))) {
        // gyldig ISO-streng
        timestamp = new Date(val).getTime();
      } else {
        // ukjent format, fallback
        timestamp = Date.now();
      }

      return {
        title: n.headings?.en || 'Melding',
        body:  n.contents?.en  || '',
        time:  timestamp
      };
    });

    // sorter nyeste først
    out.sort((a, b) => b.time - a.time);

    return res.status(200).json(out);
  } catch (err) {
    console.error('Server error in onesignal-history:', err);
    return res.status(500).json({ error: err.message });
  }
}