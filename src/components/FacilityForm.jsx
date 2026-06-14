function RatingBadge({ value }) {
  const num = parseInt(value, 10)
  if (isNaN(num)) return <span className="text-muted text-sm">N/A</span>

  let color = 'bg-gray-100 text-gray-700'
  if (num >= 4) color = 'bg-emerald-100 text-emerald-800'
  else if (num >= 3) color = 'bg-yellow-100 text-yellow-800'
  else if (num >= 1) color = 'bg-red-100 text-red-800'

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-sm font-semibold ${color}`}>
      {num}/5
    </span>
  )
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
        {label}
      </label>
      <div className="bg-gray-50 border border-border rounded-md px-3 py-2 text-sm text-gray-700">
        {value || 'N/A'}
      </div>
    </div>
  )
}

export default function FacilityForm({
  facilityData,
  manualData,
  onManualChange,
  onNameOverride,
}) {
  if (!facilityData) return null

  return (
    <div className="space-y-6">
      {/* CMS Auto-populated Section */}
      <div>
        <h3 className="text-sm font-bold text-navy uppercase tracking-wide border-b border-border pb-2 mb-4">
          CMS Auto-populated Data
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
              Facility Name
            </label>
            <input
              type="text"
              value={facilityData.facilityName}
              onChange={(e) => onNameOverride(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <ReadOnlyField label="Location" value={facilityData.location} />
          <ReadOnlyField label="Census Capacity (Certified Beds)" value={facilityData.censusCap} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
                Overall Rating
              </label>
              <RatingBadge value={facilityData.overallRating} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
                Health Inspection
              </label>
              <RatingBadge value={facilityData.healthRating} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
                Staffing Rating
              </label>
              <RatingBadge value={facilityData.staffingRating} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
                Quality Measures
              </label>
              <RatingBadge value={facilityData.qualityRating} />
            </div>
          </div>
        </div>
      </div>

      {/* Manual Inputs Section */}
      <div>
        <h3 className="text-sm font-bold text-navy uppercase tracking-wide border-b border-border pb-2 mb-4">
          Manual Assessment Inputs
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
              EMR
            </label>
            <input
              type="text"
              value={manualData.emr}
              onChange={(e) => onManualChange('emr', e.target.value)}
              placeholder="e.g. PointClickCare"
              className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
              Current Census
            </label>
            <input
              type="number"
              value={manualData.currentCensus}
              onChange={(e) => onManualChange('currentCensus', e.target.value)}
              placeholder="e.g. 85"
              className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
              Type of Patient
            </label>
            <input
              type="text"
              value={manualData.patientType}
              onChange={(e) => onManualChange('patientType', e.target.value)}
              placeholder="e.g. Skilled Nursing, Long-term Care"
              className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
              Previous Coverage from Medelite
            </label>
            <select
              value={manualData.previousCoverage}
              onChange={(e) => onManualChange('previousCoverage', e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
            >
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
              Previous Provider Performance
            </label>
            <input
              type="text"
              value={manualData.previousPerformance}
              onChange={(e) => onManualChange('previousPerformance', e.target.value)}
              placeholder="e.g. Adequate, needs improvement"
              className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">
              Medical Coverage
            </label>
            <input
              type="text"
              value={manualData.medicalCoverage}
              onChange={(e) => onManualChange('medicalCoverage', e.target.value)}
              placeholder="e.g. Telehealth + On-site"
              className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
