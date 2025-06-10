// api/onesignal-history.js
export default async function handler(req, res) {
  const APP_ID = process.env.ONESIGNAL_APP_ID;
  const API_KEY = process.env.ONESIGNAL_REST_API_KEY;

  if (!APP_ID || !API_KEY) {
    return res.status(500).json({ error: 'Missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY' });
  }

  try {
    const url = `https://onesignal.com/api/v1/notifications?app_id=${APP_ID}&limit=10`;
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${API_KEY}` }
    });
    const data = await response.json();

    if (!response.ok) {
      console.error('OneSignal API error:', data);
      return res.status(response.status).json({ error: data });
    }

    // data.notifications er originalen fra OneSignal
    const notifications = Array.isArray(data.notifications) ? data.notifications : [];

    // Logg alle labels for debugging
    console.log('OneSignal labels:', notifications.map(n => n.labels));

    // Flatten og hent kun det vi trenger
    const result = notifications
      .map(n => {
        // hent tidspunkt: fullført, planlagt eller opprettet
        const val = n.completed_at ?? n.send_after ?? n.created_at;
        let timestamp;
        if (typeof val === 'number') {
          timestamp = val < 1e12 ? val * 1000 : val;
        } else if (typeof val === 'string' && !isNaN(Date.parse(val))) {
          timestamp = Date.parse(val);
        } else {
          timestamp = Date.now();
        }
        return {
          title: n.headings?.en    || 'Melding',
          body:  n.contents?.en    || '',
          time:  timestamp
        };
      })
      // Sorter så nyeste først (om det ikke allerede er sortert)
      .sort((a, b) => b.time - a.time);

    return res.status(200).json(result);
  } catch (err) {
    console.error('Server error in onesignal-history:', err);
    return res.status(500).json({ error: err.message });
  }
}
