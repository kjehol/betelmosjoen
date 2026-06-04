export default function Okonomi() {
  return (
    <div
      className="fixed inset-x-0 top-0 sm:top-14 z-40"
      style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
    >
      <iframe
        src="/okonomi/Okonomi_2026.html"
        className="w-full h-full border-0"
        title="Økonomi-rapport Årsmøtet 2026"
      />
    </div>
  );
}
