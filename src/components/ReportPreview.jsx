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

function ratingBadgeClass(num) {
  if (isNaN(num)) return 'bg-gray-100 text-gray-500'
  if (num >= 4) return 'bg-emerald-100 text-emerald-700'
  if (num === 3) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function RatingRow({ label, value }) {
  const num = parseInt(value, 10)
  const display = isNaN(num) ? 'N/A' : `${num} / 5`
  const stars = isNaN(num) ? '' : '\u2605'.repeat(num) + '\u2606'.repeat(5 - num)

  return (
    <div className="flex border-b border-gray-200 py-2">
      <div className="w-2/5 text-xs font-semibold text-gray-600 pr-4">
        {label}
      </div>
      <div className="w-3/5 flex items-center gap-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${ratingBadgeClass(num)}`}>
          {display}
        </span>
        {stars && (
          <span className="text-amber-500 text-xs tracking-wider">{stars}</span>
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
      className="bg-white border border-gray-400 shadow-sm"
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
        <ReportRow label="Short Term Hospitalization" value={facilityData.strHospitalization} />
        <ReportRow label="STR National Avg. for Hospitalization" value={facilityData.strNationalAvgHosp} />
        <ReportRow label="STR State Avg. for Hospitalization" value={facilityData.strStateAvgHosp} />
        <ReportRow label="STR ED Visit" value={facilityData.strEdVisit} />
        <ReportRow label="STR ED Visits National Avg." value={facilityData.strNationalAvgEd} />
        <ReportRow label="STR ED Visits State Avg." value={facilityData.strStateAvgEd} />
        <ReportRow label="LT Hospitalization" value={facilityData.ltHospitalization} />
        <ReportRow label="LT National Avg. for Hospitalization" value={facilityData.ltNationalAvgHosp} />
        <ReportRow label="LT State Avg. for Hospitalization" value={facilityData.ltStateAvgHosp} />
        <ReportRow label="ED Visit" value={facilityData.ltEdVisit} />
        <ReportRow label="LT ED Visits National Avg." value={facilityData.ltNationalAvgEd} />
        <ReportRow label="LT ED Visits State Avg." value={facilityData.ltStateAvgEd} />

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
