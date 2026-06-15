import { useState, useMemo, useEffect, useRef } from 'react';

const MÅNEDER = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];
const MND_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

const FARGER = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#0d9488',
  '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#6366f1',
  '#f43f5e', '#fb923c', '#22d3ee', '#4ade80', '#eab308',
];

const CX = 200, CY = 200, OUTER_R = 168, INNER_R = 80, LABEL_R = 128;
const GAP = 1.8;

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

// Liten bue rett utenfor segmentet – brukes som «denne måneden»-markør
function outerMarkerPath(i) {
  const start = -90 + i * 30 + GAP + 3;
  const end = -90 + (i + 1) * 30 - GAP - 3;
  const r = OUTER_R + 9;
  const p1 = polarToXY(start, r);
  const p2 = polarToXY(end, r);
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`;
}

export default function Arshjul({ data = {} }) {
  const { aktiviteter: rawAkt = [], ksOppgaver: rawKS = [] } = data;
  data = { aktiviteter: rawAkt, ksOppgaver: rawKS };

  const [valgtMåned, setValgtMåned] = useState(null);
  const [hoveredMåned, setHoveredMåned] = useState(null);
  const [visAkt, setVisAkt] = useState(true);
  const [visKS, setVisKS] = useState(true);
  const [filterAnsvarlig, setFilterAnsvarlig] = useState('');
  const detailRef = useRef(null);

  const denneMåneden = new Date().getMonth() + 1;

  // Auto-scroll til detaljpanel på mobil når måned velges
  useEffect(() => {
    if (valgtMåned && detailRef.current && window.innerWidth < 1024) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }, [valgtMåned]);

  const hvemListe = useMemo(() =>
    [...new Set(data.aktiviteter.map(a => a.hvem).filter(Boolean))].sort(),
    [data]);

  const hvemFarge = useMemo(() => {
    const map = {};
    hvemListe.forEach((h, i) => { map[h] = FARGER[i % FARGER.length]; });
    return map;
  }, [hvemListe]);

  const ansvarligListe = useMemo(() =>
    [...new Set([...data.aktiviteter, ...data.ksOppgaver].map(i => i.ansvarlig).filter(Boolean))].sort(),
    [data]);

  const månedData = useMemo(() => MÅNEDER.map((name, i) => {
    const nr = i + 1;
    return {
      nr, name,
      akt: data.aktiviteter.filter(a => a.månedNr === nr),
      ks: data.ksOppgaver.filter(k => k.månedNr === nr),
    };
  }), [data]);

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
          <svg viewBox="0 0 400 400" className="w-full drop-shadow-sm select-none">
            {månedData.map((m, i) => {
              const domHvem = dominantHvem(m.akt);
              const farge = domHvem ? (hvemFarge[domHvem] || '#93c5fd') : '#d1d5db';
              const erValgt = valgtMåned === m.nr;
              const erHover = hoveredMåned === m.nr;
              const erDenneMnd = denneMåneden === m.nr;
              const antall = visibleForMonth(m.nr).length;
              const lp = polarToXY(-90 + i * 30 + 15, LABEL_R);
              const bp = polarToXY(-90 + i * 30 + 15, OUTER_R - 14);

              // Opacity: valgt=full, hover=nesten full, har data=75%, tom=30%
              const opacity = erValgt ? 1 : erHover ? 0.92 : antall > 0 ? 0.72 : 0.28;

              return (
                <g
                  key={i}
                  onClick={() => setValgtMåned(erValgt ? null : m.nr)}
                  onMouseEnter={() => setHoveredMåned(m.nr)}
                  onMouseLeave={() => setHoveredMåned(null)}
                  className="cursor-pointer"
                  style={{ transition: 'opacity 0.12s' }}
                  aria-label={`${m.name}: ${antall} oppgaver`}
                >
                  <path
                    d={segmentPath(i)}
                    fill={farge}
                    opacity={opacity}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  {/* Månedsforkortelse */}
                  <text
                    x={lp.x}
                    y={lp.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fontWeight={erDenneMnd || erValgt ? '700' : '400'}
                    fill={antall > 0 ? '#111827' : '#9ca3af'}
                  >
                    {MND_ABBR[i]}
                  </text>
                  {/* Antall-badge */}
                  {antall > 0 && (
                    <>
                      <circle cx={bp.x} cy={bp.y} r="9" fill="white" opacity="0.88" />
                      <text
                        x={bp.x}
                        y={bp.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="10"
                        fontWeight="600"
                        fill="#374151"
                      >
                        {antall}
                      </text>
                    </>
                  )}
                  {/* «Denne måneden»-markør: oransje bue utenfor segmentet */}
                  {erDenneMnd && (
                    <path
                      d={outerMarkerPath(i)}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  )}
                </g>
              );
            })}

            {/* Sentrum */}
            <circle cx={CX} cy={CY} r={INNER_R - 2} fill="white" />
            {valgtMåned ? (
              <>
                <text x={CX} y={CY - 12} textAnchor="middle" fontSize="15" fontWeight="700" fill="#1f2937">
                  {MÅNEDER[valgtMåned - 1]}
                </text>
                <text x={CX} y={CY + 8} textAnchor="middle" fontSize="9" fill="#6b7280">
                  {valgtItems.length} oppgaver
                </text>
                <text x={CX} y={CY + 22} textAnchor="middle" fontSize="9" fill="#9ca3af">
                  klikk igjen for å lukke
                </text>
              </>
            ) : (
              <>
                <text x={CX} y={CY - 10} textAnchor="middle" fontSize="18" fontWeight="700" fill="#1f2937">
                  {MÅNEDER[denneMåneden - 1].slice(0, 3)}
                </text>
                <text x={CX} y={CY + 10} textAnchor="middle" fontSize="10" fill="#6b7280">
                  nå
                </text>
              </>
            )}
          </svg>

          {/* Hint-tekst */}
          {!valgtMåned && (
            <p className="text-center text-xs text-gray-400 mt-1">Klikk på en måned for detaljer</p>
          )}

          {/* Fargeforklaring */}
          {hvemListe.length > 0 && (
            <div className="mt-3 px-1">
              <p className="text-xs font-medium text-gray-500 mb-1.5">Fargeforklaring</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {hvemListe.map(hvem => (
                  <span key={hvem} className="flex items-center gap-1 text-xs text-gray-700">
                    <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: hvemFarge[hvem] }} />
                    {hvem}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detaljpanel for valgt måned */}
        {valgtMåned && (
          <div ref={detailRef} className="flex-1 min-w-0 scroll-mt-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold">{MÅNEDER[valgtMåned - 1]}</h3>
              {valgtMåned === denneMåneden && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                  Denne måneden
                </span>
              )}
              <button
                onClick={() => setValgtMåned(null)}
                className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
                aria-label="Lukk"
              >
                ✕
              </button>
            </div>

            {valgtItems.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Ingen oppgaver denne måneden.</p>
            ) : (() => {
              const aktItems = valgtItems.filter(i => i.kilde !== 'ks');
              const ksItems  = valgtItems.filter(i => i.kilde === 'ks');
              const renderItem = (item, j) => (
                <div
                  key={j}
                  className={`p-3 rounded-lg border-l-4 ${item.kilde === 'ks' ? 'bg-violet-50 border-dashed' : 'bg-gray-50'}`}
                  style={{ borderColor: item.kilde === 'ks' ? '#7c3aed' : (hvemFarge[item.hvem] || '#3b82f6') }}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{item.tittel}</p>
                      {item.hvem && <p className="text-xs text-gray-500 mt-0.5">Hvem: {item.hvem}</p>}
                      {item.ansvarlig && <p className="text-xs text-gray-500">Ansvarlig: {item.ansvarlig}</p>}
                      {item.periode && <p className="text-xs text-gray-400">{item.periode}</p>}
                      {item.dato2026 && <p className="text-xs text-blue-600 font-medium">Dato 2026: {item.dato2026}</p>}
                      {item.detaljer && <p className="text-xs text-gray-600 mt-1">{item.detaljer}</p>}
                      {item.ksRef && <p className="text-xs text-violet-600 font-medium">KS-ref: {item.ksRef}</p>}
                      {item.frekvens && <p className="text-xs text-gray-500">Frekvens: {item.frekvens}</p>}
                      {item.tilMøte && <p className="text-xs text-gray-500">Til møte: {item.tilMøte}</p>}
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 font-medium ${item.kilde === 'ks' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.kilde === 'ks' ? '📋 KS' : 'Akt'}
                    </span>
                  </div>
                </div>
              );
              return (
                <div className="space-y-4">
                  {aktItems.length > 0 && (
                    <div>
                      {ksItems.length > 0 && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Aktiviteter</p>}
                      <div className="space-y-2">{aktItems.map(renderItem)}</div>
                    </div>
                  )}
                  {ksItems.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-1.5">KS-oppgaver</p>
                      <div className="space-y-2">{ksItems.map(renderItem)}</div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Løpende-panel når ingen måned er valgt */}
        {!valgtMåned && løpende.length > 0 && (
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-700 mb-3">Løpende / hele året</h3>
            {(() => {
              const lAkt = løpende.filter(i => i.kilde !== 'ks');
              const lKS  = løpende.filter(i => i.kilde === 'ks');
              return (
                <div className="space-y-4">
                  {lAkt.length > 0 && (
                    <div>
                      {lKS.length > 0 && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Aktiviteter</p>}
                      <div className="space-y-2">
                        {lAkt.map((item, i) => (
                          <div key={i} className="p-3 rounded-lg bg-gray-50 border-l-4 border-gray-300">
                            <p className="font-medium text-sm text-gray-900">{item.tittel}</p>
                            {item.ansvarlig && <p className="text-xs text-gray-500 mt-0.5">Ansvarlig: {item.ansvarlig}</p>}
                            {item.periode && <p className="text-xs text-gray-400">{item.periode}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {lKS.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-1.5">KS-oppgaver</p>
                      <div className="space-y-2">
                        {lKS.map((item, i) => (
                          <div key={i} className="p-3 rounded-lg bg-violet-50 border-l-4 border-dashed border-violet-400">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900">{item.tittel}</p>
                                {item.ansvarlig && <p className="text-xs text-gray-500 mt-0.5">Ansvarlig: {item.ansvarlig}</p>}
                                {item.periode && <p className="text-xs text-gray-400">{item.periode}</p>}
                                {item.ksRef && <p className="text-xs text-violet-600 font-medium">KS-ref: {item.ksRef}</p>}
                              </div>
                              <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 font-medium bg-violet-100 text-violet-700">📋 KS</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
