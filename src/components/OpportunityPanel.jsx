import { calculateOpportunityScore, generateTalkingPoints } from '../utils/opportunityScore'

export default function OpportunityPanel({ facilityData, manualData }) {
  if (!facilityData) return null

  const { score, label, colorClass, bgClass } = calculateOpportunityScore(facilityData, manualData)
  const points = generateTalkingPoints(facilityData, manualData)

  return (
    <div className={`rounded-lg border p-5 space-y-4 ${bgClass}`}>
      {/* Score badge */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-0.5">
            Opportunity Score
          </p>
          <p className={`text-xs font-semibold ${colorClass}`}>{label}</p>
        </div>
        <div className={`text-5xl font-black ${colorClass}`}>{score}</div>
      </div>

      <div className="border-t border-gray-300" />

      {/* Talking points */}
      {points.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Key Talking Points
          </p>
          <ul className="space-y-2">
            {points.map((pt, i) => (
              <li key={i} className="flex gap-2 text-xs leading-snug">
                <span className="mt-0.5 shrink-0">
                  {pt.type === 'positive' ? (
                    <span className="text-emerald-600 font-bold">✓</span>
                  ) : (
                    <span className="text-amber-600 font-bold">⚠</span>
                  )}
                </span>
                <span className="text-gray-700">{pt.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
