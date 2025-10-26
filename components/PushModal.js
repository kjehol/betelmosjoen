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
            <li key={idx}>
              <strong>{melding.tittel}</strong> <span>{formatDate(melding.dato)}</span>
              <p>{melding.tekst}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function formatDate(dato) {
  const d = new Date(dato);
  return d.toLocaleDateString("nb-NO") + " kl " + d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}
