import { createHmac, timingSafeEqual } from 'crypto';

const MAX_AGE = 12 * 60 * 60 * 1000; // 12 hours in ms

export function sign(secret) {
  const ts = Date.now().toString();
  const sig = createHmac('sha256', secret).update(ts).digest('hex');
  return `${ts}.${sig}`;
}

export function verify(token, secret) {
  if (!token || typeof token !== 'string') return false;
  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const ts = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac('sha256', secret).update(ts).digest('hex');
  try {
    const sBuf = Buffer.from(sig, 'hex');
    const eBuf = Buffer.from(expected, 'hex');
    if (sBuf.length !== eBuf.length) return false;
    if (!timingSafeEqual(sBuf, eBuf)) return false;
  } catch {
    return false;
  }
  const age = Date.now() - parseInt(ts, 10);
  return age >= 0 && age < MAX_AGE;
}

export function getCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}
