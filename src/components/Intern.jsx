import { useState, useEffect, useRef } from 'react';
import Arshjul from './Arshjul';

const TABS = [
  { id: 'arshjul', label: 'Årshjul' },
  { id: 'okonomi', label: 'Økonomi' },
];

export default function Intern() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'auth' | 'unauth'
  const [arshjulData, setArshjulData] = useState(null);
  const [activeTab, setActiveTab] = useState('arshjul');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const passwordRef = useRef(null);

  useEffect(() => {
    fetch('/api/arshjul')
      .then(res => {
        if (res.status === 401) { setStatus('unauth'); return null; }
        return res.json();
      })
      .then(data => {
        if (data) { setArshjulData(data); setStatus('auth'); }
      })
      .catch(() => setStatus('unauth'));
  }, []);

  useEffect(() => {
    if (status === 'unauth') {
      setTimeout(() => passwordRef.current?.focus(), 50);
    }
  }, [status]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError('Feil passord');
        setLoginLoading(false);
        return;
      }
      const dataRes = await fetch('/api/arshjul');
      const data = await dataRes.json();
      setArshjulData(data);
      setStatus('auth');
    } catch {
      setLoginError('Noe gikk galt. Prøv igjen.');
    }
    setLoginLoading(false);
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    setStatus('unauth');
    setArshjulData(null);
    setPassword('');
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'unauth') {
    return (
      <div className="flex justify-center pt-12 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <span className="text-4xl">🔒</span>
            <h1 className="text-2xl font-bold mt-2 text-gray-800">Intern</h1>
            <p className="text-gray-500 text-sm mt-1">Skriv inn passordet for å fortsette</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Passord"
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {loginError && (
              <p className="text-red-600 text-sm text-center">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loginLoading ? 'Logger inn…' : 'Logg inn'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated
  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">Intern</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-3 py-1"
        >
          Logg ut
        </button>
      </div>

      {/* Faner */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Innhold */}
      {activeTab === 'arshjul' && arshjulData && (
        <Arshjul data={arshjulData} />
      )}

      {activeTab === 'okonomi' && (
        <div
          className="fixed inset-x-0 z-30"
          style={{
            top: 'calc(3.5rem + 7.5rem)',
            bottom: 'calc(3.5rem + env(safe-area-inset-bottom))',
          }}
        >
          <iframe
            src="/okonomi/Okonomi_2026.html"
            className="w-full h-full border-0"
            title="Økonomi-rapport"
          />
        </div>
      )}
    </div>
  );
}
