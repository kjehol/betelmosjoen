// src/components/SubscribeInstructionsModal.jsx
import React from "react";

export default function SubscribeInstructionsModal({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
        <h3 className="text-lg font-bold mb-4">Slik får du varsler</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Gå ut av appen og slett den fra hjemskjermen.</li>
          <li>Åpne Safari/nettleser og gå til betelmosjoen.vercel.app</li>
          <li>Velg “Del” (⬆️) → “Legg til på Hjem-skjerm”.</li>
          <li>Åpne den nyinstallerte appen og tillat varsler når du blir spurt.</li>
        </ol>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Lukk
          </button>
        </div>
      </div>
    </div>
  );
}
