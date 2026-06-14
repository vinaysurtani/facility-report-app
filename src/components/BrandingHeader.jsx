export default function BrandingHeader({ state }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <img
        src="/logo.png"
        alt="INFINITE — Managed by MEDELITE"
        style={{ height: '52px', objectFit: 'contain' }}
      />
      <div className="text-right">
        {state && (
          <div className="text-3xl font-bold text-navy leading-none">{state}</div>
        )}
        <div className="text-xs tracking-widest text-muted uppercase mt-1">
          Facility Assessment Snapshot
        </div>
      </div>
    </div>
  )
}
