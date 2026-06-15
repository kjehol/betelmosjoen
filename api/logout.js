export default function handler(req, res) {
  const secure = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'development';
  res.setHeader(
    'Set-Cookie',
    `betel_auth=; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=0`
  );
  return res.status(200).json({ ok: true });
}
