import { useState } from 'react'
import CCNInput from './components/CCNInput'
import FacilityForm from './components/FacilityForm'
import ReportPreview from './components/ReportPreview'
import ExportButton from './components/ExportButton'

export default function App() {
  const [facilityData, setFacilityData] = useState(null)
  const [nameOverride, setNameOverride] = useState('')
  const [manualData, setManualData] = useState({
    emr: '',
    currentCensus: '',
    patientType: '',
    previousCoverage: '',
    previousPerformance: '',
    medicalCoverage: '',
  })
  const [error, setError] = useState('')

  function handleFacilityLoaded(mapped) {
    setFacilityData(mapped)
    setNameOverride(mapped.facilityName)
    setError('')
  }

  function handleManualChange(field, value) {
    setManualData((prev) => ({ ...prev, [field]: value }))
  }

  function handleNameOverride(name) {
    setNameOverride(name)
  }

  // Build a modified facilityData with the overridden name for the form display
  const displayFacilityData = facilityData
    ? { ...facilityData, facilityName: nameOverride }
    : null

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Bar */}
      <header className="bg-navy text-white px-6 py-3 flex items-center justify-between">
        <div>
          <span className="text-base font-bold tracking-widest">MEDELITE</span>
          <span className="text-xs text-blue-200 ml-3">
            Facility Assessment Report Generator
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel: Input Form */}
          <div className="w-full lg:w-[380px] shrink-0 space-y-5">
            <div className="bg-white rounded-lg border border-border p-5">
              <CCNInput
                onFacilityLoaded={handleFacilityLoaded}
                onError={setError}
              />
            </div>

            {facilityData && (
              <div className="bg-white rounded-lg border border-border p-5">
                <FacilityForm
                  facilityData={displayFacilityData}
                  manualData={manualData}
                  onManualChange={handleManualChange}
                  onNameOverride={handleNameOverride}
                />
              </div>
            )}

            {facilityData && (
              <ExportButton
                facilityData={facilityData}
                manualData={manualData}
                nameOverride={nameOverride}
                disabled={false}
              />
            )}
          </div>

          {/* Right Panel: Report Preview */}
          <div className="flex-1 flex justify-center">
            {facilityData ? (
              <ReportPreview
                facilityData={facilityData}
                manualData={manualData}
                nameOverride={nameOverride}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted text-sm">
                <div className="text-center">
                  <svg
                    className="h-12 w-12 mx-auto mb-3 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>Enter a CCN above to generate a report</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
