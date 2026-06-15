import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const RATINGS = [
  { key: 'overallRating', label: 'Overall' },
  { key: 'healthRating', label: 'Health Inspection' },
  { key: 'staffingRating', label: 'Staffing' },
  { key: 'qualityRating', label: 'Quality of Resident Care' },
]

function barColor(value) {
  if (value >= 4) return '#10b981' // green
  if (value === 3) return '#f59e0b' // amber
  return '#ef4444'                  // red
}

function parseNum(val) {
  if (!val || val === 'N/A') return null
  return parseFloat(String(val).replace('%', ''))
}

export default function RatingsChart({ facilityData }) {
  if (!facilityData) return null

  const ratingsData = RATINGS.map(({ key, label }) => ({
    label,
    value: parseInt(facilityData[key], 10) || 0,
  }))

  const strData = [
    {
      label: 'Hospitalization',
      facility: parseNum(facilityData.strHospitalization),
      state: parseNum(facilityData.strStateAvgHosp),
      national: parseNum(facilityData.strNationalAvgHosp),
    },
    {
      label: 'ED Visits',
      facility: parseNum(facilityData.strEdVisit),
      state: parseNum(facilityData.strStateAvgEd),
      national: parseNum(facilityData.strNationalAvgEd),
    },
  ]

  const ltData = [
    {
      label: 'Hospitalization',
      facility: parseNum(facilityData.ltHospitalization),
      state: parseNum(facilityData.ltStateAvgHosp),
      national: parseNum(facilityData.ltNationalAvgHosp),
    },
    {
      label: 'ED Visits',
      facility: parseNum(facilityData.ltEdVisit),
      state: parseNum(facilityData.ltStateAvgEd),
      national: parseNum(facilityData.ltNationalAvgEd),
    },
  ]

  const hospTooltip = (value, name) => {
    const labels = { facility: 'This Facility', state: 'State Avg', national: 'National Avg' }
    return [value != null ? value.toFixed(2) : 'N/A', labels[name] || name]
  }

  return (
    <div className="space-y-4 mt-4" className="w-full">
      {/* Star Ratings */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="text-xs font-bold text-navy uppercase tracking-widest mb-4">
          Star Ratings Overview
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={ratingsData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={140}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [`${value} / 5`, 'Rating']}
              cursor={{ fill: '#f1f5f9' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {ratingsData.map((entry, i) => (
                <Cell key={i} fill={barColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3 justify-end">
          <span className="flex items-center gap-1 text-xs text-muted">
            <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" /> 4–5 stars
          </span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <span className="inline-block w-3 h-3 rounded-sm bg-amber-400" /> 3 stars
          </span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-500" /> 1–2 stars
          </span>
        </div>
      </div>

      {/* Hospitalization Comparison */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="text-xs font-bold text-navy uppercase tracking-widest mb-4">
          Hospitalization &amp; ED Visit Rates vs Benchmarks
        </h3>
        <div className="flex gap-6">
          {/* STR % */}
          <div className="flex-1">
            <p className="text-xs text-muted font-semibold mb-2 uppercase tracking-wide">Short-Stay (%)</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={strData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip formatter={hospTooltip} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="facility" name="facility" fill="#0a1f3f" radius={[3,3,0,0]} barSize={14} />
                <Bar dataKey="state" name="state" fill="#94a3b8" radius={[3,3,0,0]} barSize={14} />
                <Bar dataKey="national" name="national" fill="#93c5fd" radius={[3,3,0,0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* LT per 1000 days */}
          <div className="flex-1">
            <p className="text-xs text-muted font-semibold mb-2 uppercase tracking-wide">Long-Stay (per 1,000 days)</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={ltData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={hospTooltip} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="facility" name="facility" fill="#0a1f3f" radius={[3,3,0,0]} barSize={14} />
                <Bar dataKey="state" name="state" fill="#94a3b8" radius={[3,3,0,0]} barSize={14} />
                <Bar dataKey="national" name="national" fill="#93c5fd" radius={[3,3,0,0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex gap-4 mt-3 justify-end">
          <span className="flex items-center gap-1 text-xs text-muted">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#0a1f3f' }} /> This Facility
          </span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <span className="inline-block w-3 h-3 rounded-sm bg-slate-400" /> State Avg
          </span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-300" /> National Avg
          </span>
        </div>
      </div>
    </div>
  )
}
