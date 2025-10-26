import React from "react";

export default function PushModal({ open, onClose, meldinger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto relative p-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
          onClick={onClose}
          aria-label="Lukk"
        >
          ×
        </button>
        <h3 className="text-lg font-semibold mb-4">Siste meldinger</h3>
        <ul>
          {meldinger.map((melding, idx) => (
            <li key={idx} className="mb-4 border-b last:border-b-0 pb-2 last:pb-0">
              <div className="flex justify-between items-center">
                <strong>{melding.title}</strong>
                <span className="text-xs text-gray-500">{formatDate(melding.time)}</span>
              </div>
              <p className="text-gray-700 mt-1">{melding.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function formatDate(tid) {
  const d = new Date(tid);
  return d.toLocaleDateString("nb-NO") + " kl " + d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}
