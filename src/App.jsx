import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Velkommen from "./components/Velkommen";
import Artikler from "./components/Artikler";
import Podcast from "./components/Podcast";
import Kalender from "./components/Kalender";

function App() {
  return (
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
  );
}

export default App;
