import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const links = [
    { to: "/", label: "Hjem", icon: "🏠" },
    { to: "/artikler", label: "Artikler", icon: "📖" },
    { to: "/podcast", label: "Podcast", icon: "🎧" },
    { to: "/kalender", label: "Kalender", icon: "📅" },
  ];

  return (
    <>
      {/* Toppmeny på stor skjerm */}
      <nav className="hidden sm:flex justify-center bg-white border-b shadow-md px-6 py-4 sticky top-0 z-50">
        <div className="flex gap-8">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm sm:text-base hover:text-blue-700 ${
                isActive(link.to) ? "text-blue-700 font-semibold" : "text-gray-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bunnmeny på mobil */}
      <nav className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t shadow z-50">
        <div className="flex justify-around text-xs pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center ${
                isActive(link.to) ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
