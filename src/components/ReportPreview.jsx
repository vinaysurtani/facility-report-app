import BrandingHeader from './BrandingHeader'

function ReportRow({ label, value }) {
  return (
    <div className="flex border-b border-gray-200 py-2">
      <div className="w-2/5 text-xs font-semibold text-gray-600 pr-4">
        {label}
      </div>
      <div className="w-3/5 text-sm text-gray-900">{value || '--'}</div>
    </div>
  )
}

function RatingRow({ label, value }) {
  const num = parseInt(value, 10)
  const display = isNaN(num) ? 'N/A' : `${num}`
  const stars = isNaN(num) ? '' : '\u2605'.repeat(num) + '\u2606'.repeat(5 - num)

  return (
    <div className="flex border-b border-gray-200 py-2">
      <div className="w-2/5 text-xs font-semibold text-gray-600 pr-4">
        {label}
      </div>
      <div className="w-3/5 text-sm text-gray-900">
        {display}
        {stars && (
          <span className="ml-2 text-amber-500 text-xs tracking-wider">
            {stars}
          </span>
        )}
      </div>
    </div>
  )
}

export default function ReportPreview({ facilityData, manualData, nameOverride }) {
  if (!facilityData) return null

  const displayName = nameOverride || facilityData.facilityName
  const medicareUrl = `https://www.medicare.gov/care-compare/details/nursing-home/${facilityData.ccn}`

  return (
    <div
      id="report-preview"
      className="bg-white border border-gray-300 shadow-sm"
      style={{ width: '700px', minHeight: '900px' }}
    >
      <BrandingHeader state={facilityData.state} />

      <div className="px-6 py-5">
        {/* Single flat table — row order matches reference PDF */}
        <ReportRow label="Name of Facility" value={displayName} />
        <ReportRow label="Location" value={facilityData.location} />
        <ReportRow label="EMR" value={manualData.emr} />
        <ReportRow label="Census Capacity" value={facilityData.censusCap} />
        <ReportRow label="Current Census" value={manualData.currentCensus} />
        <ReportRow label="Type of Patient" value={manualData.patientType} />
        <ReportRow
          label="Previous Coverage from Medelite"
          value={manualData.previousCoverage}
        />
        <ReportRow
          label="Previous Provider Performance from Medelite"
          value={manualData.previousPerformance}
        />
        <ReportRow label="Medical Coverage" value={manualData.medicalCoverage} />
        <RatingRow label="Overall Star Rating" value={facilityData.overallRating} />
        <RatingRow label="Health Inspection" value={facilityData.healthRating} />
        <RatingRow label="Staffing" value={facilityData.staffingRating} />
        <RatingRow label="Quality of Resident Care" value={facilityData.qualityRating} />

        {/* Medicare Care Compare link */}
        <div className="mt-6 pt-4 border-t border-gray-300">
          <p className="text-xs text-muted mb-1">Medicare Care Compare:</p>
          <a
            href={medicareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent underline break-all"
          >
            {medicareUrl}
          </a>
        </div>
      </div>
    </div>
  )
}
