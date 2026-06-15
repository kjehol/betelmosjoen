import { sign } from './_auth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { password } = req.body || {};
  if (!password || password !== process.env.SITE_PASSWORD) {
    return res.status(401).json({ error: 'Feil passord' });
  }
  const token = sign(process.env.AUTH_SECRET);
  const maxAge = 12 * 60 * 60;
  const secure = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'development';
  res.setHeader(
    'Set-Cookie',
    `betel_auth=${token}; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=${maxAge}`
  );
  return res.status(200).json({ ok: true });
}
