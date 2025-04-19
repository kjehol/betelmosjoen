export default function Bibelgruppe() {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Bibelgrupper
        </h1>
  
        <div className="rounded-xl overflow-hidden border shadow-md min-h-[700px]">
          <iframe
            title="Bibelgruppe – Betel Mosjøen"
            src="https://www.betelmosjoen.no/bibelgruppe"
            style={{
              width: "100%",
              height: "1100px", // justert høyde
              border: "none",
              overflow: "hidden",
            }}
          />
        </div>
      </div>
    );
  }
  