import React from "react";

export default function PushModal({ open, onClose, meldinger }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>Lukk</button>
        <h3>Siste meldinger</h3>
        <ul>
          {meldinger.map((melding, idx) => (
            <li key={idx} className="mb-4">
              <strong>{melding.title}</strong> <span className="text-xs text-gray-500">{formatDate(melding.time)}</span>
              <p>{melding.body}</p>
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
