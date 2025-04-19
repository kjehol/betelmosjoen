import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-700">
          Betel Mosjøen
        </Link>

        {/* Navigasjon */}
        <div className="flex gap-6 text-sm sm:text-base">
          <Link
            to="/"
            className={`hover:text-blue-700 ${
              isActive("/") ? "text-blue-700 font-semibold" : "text-gray-700"
            }`}
          >
            Hjem
          </Link>
          <Link
            to="/bibelgruppe"
            className={`hover:text-blue-700 ${
                isActive("/bibelgruppe") ? "text-blue-700 font-semibold" : "text-gray-700"
            }`}
            >
            Bibelgrupper
          </Link>
          <Link
            to="/artikler"
            className={`hover:text-blue-700 ${
              isActive("/artikler") ? "text-blue-700 font-semibold" : "text-gray-700"
            }`}
          >
            Artikler
          </Link>
          <Link
            to="/podcast"
            className={`hover:text-blue-700 ${
              isActive("/podcast") ? "text-blue-700 font-semibold" : "text-gray-700"
            }`}
          >
            Podcast
          </Link>
          <Link
            to="/kalender"
            className={`hover:text-blue-700 ${
              isActive("/kalender") ? "text-blue-700 font-semibold" : "text-gray-700"
            }`}
          >
            Kalender
          </Link>
        </div>
      </div>
    </nav>
  );
}
