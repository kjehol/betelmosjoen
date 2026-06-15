import { useState, useMemo } from 'react';

const MÅNEDER = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];
const MND_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

const FARGER = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#14b8a6',
  '#a78bfa', '#fb7185', '#0ea5e9', '#22c55e', '#eab308',
];

// SVG constants
const CX = 200, CY = 200, OUTER_R = 168, INNER_R = 80, LABEL_R = 128;
const GAP = 1.8; // degrees gap between segments

function polarToXY(deg, r) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function segmentPath(i) {
  const start = -90 + i * 30 + GAP;
  const end = -90 + (i + 1) * 30 - GAP;
  const o1 = polarToXY(start, OUTER_R);
  const o2 = polarToXY(end, OUTER_R);
  const i1 = polarToXY(start, INNER_R);
  const i2 = polarToXY(end, INNER_R);
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 0 1 ${o2.x} ${o2.y}`,
    `L ${i2.x} ${i2.y}`,
    `A ${INNER_R} ${INNER_R} 0 0 0 ${i1.x} ${i1.y}`,
    'Z',
  ].join(' ');
}

function labelPos(i) {
  return polarToXY(-90 + i * 30 + 15, LABEL_R);
}

function countBadgePos(i) {
  return polarToXY(-90 + i * 30 + 15, OUTER_R - 14);
}

export default function Arshjul({ data }) {
  const [valgtMåned, setValgtMåned] = useState(null);
  const [visAkt, setVisAkt] = useState(true);
  const [visKS, setVisKS] = useState(true);
  const [filterAnsvarlig, setFilterAnsvarlig] = useState('');

  const denneMåneden = new Date().getMonth() + 1; // 1–12

  // Build Hvem → farge map
  const hvemListe = useMemo(() =>
    [...new Set(data.aktiviteter.map(a => a.hvem).filter(Boolean))].sort(),
    [data]);

  const hvemFarge = useMemo(() => {
    const map = {};
    hvemListe.forEach((h, i) => { map[h] = FARGER[i % FARGER.length]; });
    return map;
  }, [hvemListe]);

  // Unique ansvarlig for filter
  const ansvarligListe = useMemo(() =>
    [...new Set([...data.aktiviteter, ...data.ksOppgaver].map(i => i.ansvarlig).filter(Boolean))].sort(),
    [data]);

  // Group by month
  const månedData = useMemo(() => MÅNEDER.map((name, i) => {
    const nr = i + 1;
    return {
      nr, name,
      akt: data.aktiviteter.filter(a => a.månedNr === nr),
      ks: data.ksOppgaver.filter(k => k.månedNr === nr),
    };
  }), [data]);

  // Løpende items (no fixed month)
  const løpende = useMemo(() => {
    const items = [
      ...(visAkt ? data.aktiviteter.filter(a => !a.månedNr) : []),
      ...(visKS ? data.ksOppgaver.filter(k => !k.månedNr) : []),
    ];
    return filterAnsvarlig ? items.filter(i => i.ansvarlig === filterAnsvarlig) : items;
  }, [data, visAkt, visKS, filterAnsvarlig]);

  function dominantHvem(akt) {
    if (!akt.length) return null;
    const counts = {};
    akt.forEach(a => { counts[a.hvem || ''] = (counts[a.hvem || ''] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  function visibleForMonth(nr) {
    const m = månedData[nr - 1];
    const items = [
      ...(visAkt ? m.akt : []),
      ...(visKS ? m.ks : []),
    ];
    return filterAnsvarlig ? items.filter(i => i.ansvarlig === filterAnsvarlig) : items;
  }

  const valgtItems = valgtMåned ? visibleForMonth(valgtMåned) : [];

  return (
    <div>
      {/* Kontroller */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          onClick={() => setVisAkt(v => !v)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${visAkt ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          Aktiviteter
        </button>
        <button
          onClick={() => setVisKS(v => !v)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${visKS ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          KS-oppgaver
        </button>
        <select
          value={filterAnsvarlig}
          onChange={e => setFilterAnsvarlig(e.target.value)}
          className="px-3 py-1 rounded border border-gray-200 text-sm bg-white"
        >
          <option value="">Alle ansvarlige</option>
          {ansvarligListe.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Hjul + detaljpanel */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* SVG-hjul */}
        <div className="w-full max-w-sm mx-auto lg:mx-0 flex-shrink-0">
          <svg viewBox="0 0 400 400" className="w-full drop-shadow-sm">
            {månedData.map((m, i) => {
              const domHvem = dominantHvem(m.akt);
              const farge = domHvem ? (hvemFarge[domHvem] || '#93c5fd') : '#e5e7eb';
              const erValgt = valgtMåned === m.nr;
              const erDenneMnd = denneMåneden === m.nr;
              const antall = visibleForMonth(m.nr).length;
              const lp = labelPos(i);
              const bp = countBadgePos(i);

              return (
                <g
                  key={i}
                  onClick={() => setValgtMåned(erValgt ? null : m.nr)}
                  className="cursor-pointer"
                  style={{ transition: 'opacity 0.15s' }}
                >
                  <path
                    d={segmentPath(i)}
                    fill={farge}
                    opacity={erValgt ? 1 : antall > 0 ? 0.75 : 0.25}
                    stroke={erDenneMnd ? '#f97316' : 'white'}
                    strokeWidth={erDenneMnd ? 3 : 1.5}
                  />
                  {/* Månedsforkortelse */}
                  <text
                    x={lp.x}
                    y={lp.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontWeight={erDenneMnd ? '700' : '400'}
                    fill={antall > 0 ? '#111827' : '#9ca3af'}
                  >
                    {MND_ABBR[i]}
                  </text>
                  {/* Antall-badge */}
                  {antall > 0 && (
                    <>
                      <circle cx={bp.x} cy={bp.y} r="9" fill="white" opacity="0.85" />
                      <text
                        x={bp.x}
                        y={bp.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="9"
                        fontWeight="600"
                        fill="#374151"
                      >
                        {antall}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Sentrum */}
            <circle cx={CX} cy={CY} r={INNER_R - 2} fill="white" />
            <text
              x={CX} y={CY - 10}
              textAnchor="middle"
              fontSize="18"
              fontWeight="700"
              fill="#1f2937"
            >
              {valgtMåned ? MÅNEDER[valgtMåned - 1].slice(0, 3) : MÅNEDER[denneMåneden - 1].slice(0, 3)}
            </text>
            <text
              x={CX} y={CY + 12}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {valgtMåned
                ? (valgtMåned === denneMåneden ? '← nå' : 'valgt')
                : 'nå'}
            </text>
          </svg>

          {/* Fargeforklaring */}
          {hvemListe.length > 0 && (
            <div className="mt-3 px-1">
              <p className="text-xs font-medium text-gray-500 mb-1.5">Fargeforklaring (Hvem)</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {hvemListe.map(hvem => (
                  <span key={hvem} className="flex items-center gap-1 text-xs text-gray-700">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: hvemFarge[hvem] }}
                    />
                    {hvem}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detaljpanel for valgt måned */}
        {valgtMåned && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold">{MÅNEDER[valgtMåned - 1]}</h3>
              {valgtMåned === denneMåneden && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                  Denne måneden
                </span>
              )}
              <button
                onClick={() => setValgtMåned(null)}
                className="ml-auto text-gray-400 hover:text-gray-600 text-sm"
                aria-label="Lukk"
              >
                ✕
              </button>
            </div>

            {valgtItems.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Ingen oppgaver denne måneden.</p>
            ) : (
              <div className="space-y-2">
                {valgtItems.map((item, j) => (
                  <div
                    key={j}
                    className="p-3 rounded-lg bg-gray-50 border-l-4"
                    style={{
                      borderColor: item.kilde === 'ks'
                        ? '#8b5cf6'
                        : (hvemFarge[item.hvem] || '#3b82f6'),
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">{item.tittel}</p>
                        {item.hvem && (
                          <p className="text-xs text-gray-500 mt-0.5">Hvem: {item.hvem}</p>
                        )}
                        {item.ansvarlig && (
                          <p className="text-xs text-gray-500">Ansvarlig: {item.ansvarlig}</p>
                        )}
                        {item.periode && (
                          <p className="text-xs text-gray-400">{item.periode}</p>
                        )}
                        {item.dato2026 && (
                          <p className="text-xs text-blue-600 font-medium">Dato 2026: {item.dato2026}</p>
                        )}
                        {item.detaljer && (
                          <p className="text-xs text-gray-600 mt-1">{item.detaljer}</p>
                        )}
                        {item.ksRef && (
                          <p className="text-xs text-purple-600">KS-ref: {item.ksRef}</p>
                        )}
                        {item.frekvens && (
                          <p className="text-xs text-gray-500">Frekvens: {item.frekvens}</p>
                        )}
                        {item.tilMøte && (
                          <p className="text-xs text-gray-500">Til møte: {item.tilMøte}</p>
                        )}
                      </div>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 font-medium ${
                          item.kilde === 'ks'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.kilde === 'ks' ? 'KS' : 'Akt'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Løpende-panel når ingen måned er valgt */}
        {!valgtMåned && løpende.length > 0 && (
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-700 mb-3">Løpende / hele året</h3>
            <div className="space-y-2">
              {løpende.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-gray-50 border-l-4 border-gray-300"
                >
                  <p className="font-medium text-sm text-gray-900">{item.tittel}</p>
                  {item.ansvarlig && (
                    <p className="text-xs text-gray-500 mt-0.5">Ansvarlig: {item.ansvarlig}</p>
                  )}
                  {item.periode && (
                    <p className="text-xs text-gray-400">{item.periode}</p>
                  )}
                  {item.kilde === 'ks' && item.ksRef && (
                    <p className="text-xs text-purple-600">KS-ref: {item.ksRef}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
