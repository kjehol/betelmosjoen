import { verify, getCookie } from './_auth.js';

export default function handler(req, res) {
  const token = getCookie(req, 'betel_auth');
  if (!verify(token, process.env.AUTH_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.status(200).json({ ok: true });
}
