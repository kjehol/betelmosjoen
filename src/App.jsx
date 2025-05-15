import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Velkommen from './components/Velkommen';
import Artikler from './components/Artikler';
import Podcast from './components/Podcast';
import Kalender from './components/Kalender';

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosInstall, setShowIosInstall] = useState(false);
  const [hasNewSW, setHasNewSW] = useState(false);

  useEffect(() => {
    if (hasNewSW) {
      console.log('App: Reloader siden pga. ny service worker');
      window.location.reload();
    }
  }, [hasNewSW]);

  useEffect(() => {
    if (
      import.meta.env.PROD &&
      'serviceWorker' in navigator &&
      navigator.serviceWorker.controller
    ) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('App: controllerchange event trigget');
        setHasNewSW(true);
      });
    }
  }, []);

  useEffect(() => {
    // Capture Chrome/Android install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Detect iOS devices without standalone
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isInStandalone = window.navigator.standalone === true;
    if (isIos && !isInStandalone) {
      setShowIosInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Install outcome:', outcome);
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Button for Chrome/Android install */}
      {deferredPrompt && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50"
        >
          Legg til på hjemskjerm
        </button>
      )}

      {/* iOS/Safari install instructions */}
      {!deferredPrompt && showIosInstall && (
        <div
          className="fixed left-4 right-4 bg-white p-3 border rounded shadow-lg z-[9999]"
          style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
        >
          <p className="font-semibold">Legg til appen på hjemskjermen</p>
          <ol className="list-decimal list-inside">
            <li>Trykk på <span className="font-bold">Del</span> (firkant med pil).</li>
            <li>Velg <span className="font-bold">Legg til på Hjem-skjerm</span>.</li>
          </ol>
        </div>
      )}

      <BrowserRouter>
        <Navbar />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<Velkommen />} />
            <Route path="/artikler" element={<Artikler />} />
            <Route path="/podcast" element={<Podcast />} />
            <Route path="/kalender" element={<Kalender />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
