import { useState } from 'react'
import { fetchFacilityByCCN, fetchHospitalizationData } from '../services/cmsApi'
import { mapCMSToReport, mapHospitalizationToReport } from '../utils/fieldMapper'

export default function CCNInput({ onFacilityLoaded, onError }) {
  const [ccn, setCcn] = useState('')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')

  async function handleLookup() {
    const trimmed = ccn.trim()
    if (!/^\d{6}$/.test(trimmed)) {
      const msg = 'CCN must be exactly 6 digits.'
      setLocalError(msg)
      onError(msg)
      return
    }

    setLocalError('')
    onError('')
    setLoading(true)

    try {
      const raw = await fetchFacilityByCCN(trimmed)
      const mapped = mapCMSToReport(raw)

      // Fetch hospitalization metrics using state from facility data
      const hospRaw = await fetchHospitalizationData(trimmed, mapped.state)
      const hospMapped = mapHospitalizationToReport(hospRaw)

      onFacilityLoaded({ ...mapped, ...hospMapped })
    } catch (err) {
      const msg = err.message || 'An unknown error occurred.'
      setLocalError(msg)
      onError(msg)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLookup()
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-navy uppercase tracking-wide">
        CMS Certification Number (CCN)
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={ccn}
          onChange={(e) => setCcn(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 686123"
          maxLength={6}
          className="flex-1 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          className="bg-navy hover:bg-navy-light text-white px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Looking up...
            </span>
          ) : (
            'Lookup'
          )}
        </button>
      </div>
      {localError && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {localError}
        </p>
      )}
    </div>
  )
}
