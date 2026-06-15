import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
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

export default function RatingsChart({ facilityData }) {
  if (!facilityData) return null

  const data = RATINGS.map(({ key, label }) => ({
    label,
    value: parseInt(facilityData[key], 10) || 0,
  }))

  return (
    <div className="bg-white border border-border rounded-lg p-5 mt-4" style={{ width: '700px' }}>
      <h3 className="text-xs font-bold text-navy uppercase tracking-widest mb-4">
        Star Ratings Overview
      </h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={data}
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
            {data.map((entry, i) => (
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
  )
}
