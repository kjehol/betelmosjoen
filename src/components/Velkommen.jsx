import React, { useEffect, useState } from "react";

const bibelvers = [
  {
    vers: "Salme 46:2",
    tekst: "Gud er vår tilflukt og styrke, en hjelp i nød og alltid nær",
  },
  {
    vers: "Romerne 8:1",
    tekst: "Så er det da ingen fordømmelse for dem som er i Kristus Jesus.",
  },
  {
    vers: "Johannes 3:16",
    tekst: "For så har Gud elsket verden at han gav sin Sønn, den enbårne, for at hver den som tror på ham, ikke skal fortapes, men ha evig liv.",
  },
  {
    vers: "Filipperne 4:13",
    tekst: "Alt makter jeg i Ham som gjør meg sterk.",
  },
  {
    vers: "2 Korinter 5:17",
    tekst: "Derfor, om noen er i Kristus, da er han en ny skapning. Det gamle er forbi, se, alt er blitt nytt.",
  },
];

export default function Velkommen() {
  const [dagensVers, setDagensVers] = useState(null);

  useEffect(() => {
    const tilfeldig = Math.floor(Math.random() * bibelvers.length);
    setDagensVers(bibelvers[tilfeldig]);
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://minbetel.elvanto.eu/calendar_embed.js?ca[]=services&events=1&upcoming[count]=1&upcoming[timeframe]=w&max=3&el_id=0050";
    script.async = true;
    document.getElementById("elvanto-events-0050")?.appendChild(script);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Velkommen til Pinsekirken Betel Mosjøen
      </h1>

      {dagensVers && (
        <blockquote className="border-l-4 border-blue-600 pl-4 italic text-gray-800 mb-8">
          “{dagensVers.tekst}”
          <footer className="mt-2 text-sm text-gray-600">— {dagensVers.vers}</footer>
        </blockquote>
      )}

      <p className="mb-6 text-lg text-gray-700">
        Vi er en kirke åpen for alle mennesker uansett bakgrunn. I våre samlinger
        retter vi fokus mot Jesus Kristus i forkynnelse, sang, musikk og bønn.
      </p>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Kommende uke</h2>
        <div id="elvanto-events-0050" className="bg-gray-50 rounded p-4 shadow-inner" />
      </div>

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
