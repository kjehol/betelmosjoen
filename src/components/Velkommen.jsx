import React from "react";

export default function Velkommen() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Velkommen til Pinsekirken Betel Mosjøen
      </h1>

      <p className="mb-6 text-lg text-gray-700">
        Vi er en kirke åpen for alle mennesker uansett bakgrunn. I våre samlinger
        retter vi fokus mot Jesus Kristus i forkynnelse, sang, musikk og bønn.
      </p>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Hva gjør vi?</h2>
        <p className="text-gray-700">
          Vi samles hver uke til Gudstjeneste med Barnekirke og kafé. Dette er
          vårt "storfellesskap". I uken er det mange som samles i mindre grupper
          enten på Betel eller i hjemmene.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Hvorfor gjør vi det vi gjør?</h2>
        <p className="text-gray-700">
          Vi tror at mennesket er skapt av Gud med en uendelig verdi og at vi alle
          har en hensikt i livet. Derfor ønsker vi å dele de gode nyhetene om Jesus
          til alle.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Visjon og verdier</h2>
        <p className="text-gray-700">
          Vår visjon er "å lede mennesker inn i et frelsende fellesskap som
          utruster til tjeneste for Gud, verden, og hverandre". Som kjerneverdier
          strekker vi oss etter å være en kirke som er inviterende, inkluderende og
          investerende.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Praktisk informasjon</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>
            <strong>Adresse:</strong> Mathias Bruns gate 19, 8657 Mosjøen
          </li>
          <li>
            <strong>Gudstjenester:</strong> Søndager kl. 17:00
          </li>
          <li>
            <strong>Kontakt:</strong> post@betelmosjoen.no | +47 905 15 643
          </li>
        </ul>
      </div>

      <div className="text-center">
        <a
          href="/kalender"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg"
        >
          Se kalender
        </a>
      </div>
    </div>
  );
}
