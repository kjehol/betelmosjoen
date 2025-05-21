import { useEffect, useState } from "react";
import Layout from "./Layout";

export default function Kalender() {
  const [visning, setVisning] = useState("list");
  const [laster, setLaster] = useState(true);

  useEffect(() => {
    if (visning !== "list") return;

    const wrapper = document.getElementById("kalender-wrapper");
    if (!wrapper) return;
    wrapper.innerHTML = "";
    setLaster(true);

    const script = document.createElement("script");
    script.src =
      "https://minbetel.elvanto.eu/calendar_embed.js?c[]=904a47d1-5f81-4ad9-a3c6-f9c1a4898461&ca[]=services&events=1&upcoming[count]=1&upcoming[timeframe]=m&max=10&el_id=5087";
    script.async = true;
    script.onload = () => setLaster(false);

    const div = document.createElement("div");
    div.id = "elvanto-events-5087";
    div.className = "bg-white shadow-md rounded-xl p-4 border min-h-[600px]";
    wrapper.appendChild(div);
    div.appendChild(script);

    const timeout = setTimeout(() => setLaster(false), 4000);
    return () => clearTimeout(timeout);
  }, [visning]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-center">Kalender</h1>

      {/* Toggle */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <span className={visning === "list" ? "font-semibold text-gray-600" : "text-gray-400"}>
          📋 Liste
        </span>
        <button
          className={`w-14 h-8 flex items-center bg-gray-300 rounded-full p-1 transition ${
            visning === "month" ? "justify-end" : "justify-start"
          }`}
          onClick={() => setVisning(visning === "month" ? "list" : "month")}
        >
          <div className="bg-white w-6 h-6 rounded-full shadow-md transition" />
        </button>
        <span className={visning === "month" ? "font-semibold text-gray-600" : "text-gray-400"}>
          📆 Måned
        </span>
      </div>

      {/* Visning */}
      {visning === "month" ? (
  <div className="rounded-xl overflow-hidden border shadow-md">
    <iframe
      title="Månedsvisning Elvanto"
      src="https://minbetel.elvanto.eu/calendar_embed/?c[]=904a47d1-5f81-4ad9-a3c6-f9c1a4898461&ca[]=services"
      allowTransparency="true"
      frameBorder="0"
      className="w-full border-none h-[600px] sm:h-[600px] md:h-[750px] lg:h-[750px] xl:h-[750px]"
      style={{ overflow: "hidden" }}
    />
  </div>
) : (
        <>
          <div id="kalender-wrapper" />
          {laster && (
            <div className="text-center text-sm text-gray-500 mt-4 animate-pulse">
              ⏳ Laster kalender…
            </div>
          )}
        </>
      )}

      {/* Abonner */}
      <div className="mt-10 text-center">
        <h2 className="text-xl font-semibold mb-4">Abonner på kalender</h2>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <div>
            <p className="mb-1 font-medium">🙏 Gudstjenester og samlinger</p>
            <div className="flex gap-2 justify-center">
              <a
                href="webcal://r.elvanto.eu/fullcalendar/3b80c6e3-5b09-41c4-ad5d-64a3ac452897/904a47d1-5f81-4ad9-a3c6-f9c1a4898461.ics"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm"
              >
                Apple / Outlook
              </a>
              <a
                href="https://calendar.google.com/calendar/render?cid=webcal://r.elvanto.eu/fullcalendar/3b80c6e3-5b09-41c4-ad5d-64a3ac452897/904a47d1-5f81-4ad9-a3c6-f9c1a4898461.ics"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Kalender
              </a>
            </div>
          </div>

          <div>
            <p className="mb-1 font-medium">🎉 Aktiviteter</p>
            <div className="flex gap-2 justify-center">
              <a
                href="webcal://r.elvanto.eu/fullcalendar/3b80c6e3-5b09-41c4-ad5d-64a3ac452897/admin-services.ics"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm"
              >
                Apple / Outlook
              </a>
              <a
                href="https://calendar.google.com/calendar/render?cid=webcal://r.elvanto.eu/fullcalendar/3b80c6e3-5b09-41c4-ad5d-64a3ac452897/admin-services.ics"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Kalender
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
