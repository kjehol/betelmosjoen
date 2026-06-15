import { google } from 'googleapis';
import { verify, getCookie } from './_auth.js';

const MÅNEDER = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];

function parseMåned(str) {
  if (!str) return null;
  const lower = str.toLowerCase().trim();
  for (let i = 0; i < MÅNEDER.length; i++) {
    if (lower.includes(MÅNEDER[i].toLowerCase())) return i + 1;
  }
  return null;
}

async function fetchSheetData() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const { data } = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: process.env.SHEET_ID_ARSHJUL,
    ranges: [
      "'Ark 1'!A2:I300",
      "'Oppgaver og Oppfølging av Kvalitetssystemet'!A1:F100",
    ],
  });

  const [ark1Range, ksRange] = data.valueRanges;

  // Ark 1: row 0 = header (sheet row 2), rows 1+ = data (sheet rows 3+)
  const ark1Rows = ark1Range.values || [];
  const aktiviteter = ark1Rows
    .slice(1)
    .filter(row => row && (row[4] || row[1]))
    .map(row => {
      const månedNr = parseInt(row[0]) || parseMåned(row[1]) || null;
      return {
        månedNr,
        måned: row[1] || '',
        periode: row[2] || '',
        hvem: row[3] || '',
        tittel: row[4] || '',
        ansvarlig: row[5] || '',
        dato2025: row[6] || '',
        dato2026: row[7] || '',
        detaljer: row[8] || '',
        kilde: 'aktivitet',
      };
    });

  // KS-fane: row 0 = header, rows 1+ = data
  const ksRows = ksRange.values || [];
  const ksOppgaver = ksRows
    .slice(1)
    .filter(row => row && row[1])
    .map(row => {
      const månedNr = parseMåned(row[0]);
      return {
        månedNr,
        måned: månedNr ? MÅNEDER[månedNr - 1] : null,
        periode: row[0] || '',
        tittel: row[1] || '',
        ksRef: row[2] || '',
        ansvarlig: row[3] || '',
        frekvens: row[4] || '',
        tilMøte: row[5] || '',
        kilde: 'ks',
      };
    });

  console.log(`arshjul: ${aktiviteter.length} aktiviteter, ${ksOppgaver.length} KS-oppgaver`);
  if (aktiviteter.length > 0) {
    console.log('ark1 første rad (rå):', JSON.stringify(ark1Rows[1]));
    console.log('første aktivitet:', JSON.stringify(aktiviteter[0]));
  } else {
    console.log('ark1 totalt rader:', ark1Rows.length, '– første rå rad:', JSON.stringify(ark1Rows[0]));
  }

  return { aktiviteter, ksOppgaver };
}

export default async function handler(req, res) {
  const token = getCookie(req, 'betel_auth');
  if (!verify(token, process.env.AUTH_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const data = await fetchSheetData();
    return res.status(200).json(data);
  } catch (err) {
    console.error('arshjul error:', err);
    return res.status(500).json({ error: err.message });
  }
}
