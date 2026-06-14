export default function BrandingHeader({ state }) {
  return (
    <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
      <div>
        <div className="text-lg font-bold tracking-widest">
          INFINITE
          <span className="font-normal text-sm tracking-normal ml-2 opacity-75">
            &mdash; Managed by MEDELITE
          </span>
        </div>
        <div className="text-xs tracking-widest mt-1 text-blue-200 uppercase">
          Facility Assessment Snapshot
        </div>
      </div>
      {state && (
        <div className="text-3xl font-bold text-white leading-none">{state}</div>
      )}
    </div>
  )
}
