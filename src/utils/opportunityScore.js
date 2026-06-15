// Parses formatted strings like "25.6%", "2.75", "N/A" → number or null
function parse(val) {
  if (!val || val === 'N/A' || val === '--') return null
  return parseFloat(String(val).replace('%', ''))
}

// Score a hospitalization metric (lower = better).
// Returns 0–10: full points if facility ≤ state avg, 0 if ≥ 50% above state avg.
function hospPoints(facilityVal, stateVal, max = 10) {
  const f = parse(facilityVal)
  const s = parse(stateVal)
  if (f == null || s == null || s === 0) return max / 2 // neutral if data missing
  if (f <= s) return max
  const pctAbove = (f - s) / s
  return Math.max(0, max * (1 - pctAbove / 0.5))
}

export function calculateOpportunityScore(facilityData, manualData) {
  // --- Star ratings component (40 pts) ---
  const ratings = [
    parse(facilityData.overallRating),
    parse(facilityData.healthRating),
    parse(facilityData.staffingRating),
    parse(facilityData.qualityRating),
  ].filter((v) => v != null)

  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 2.5
  const starScore = (avgRating / 5) * 40

  // --- Hospitalization vs benchmarks component (40 pts) ---
  const hospScore =
    hospPoints(facilityData.strHospitalization, facilityData.strStateAvgHosp) +
    hospPoints(facilityData.strEdVisit, facilityData.strStateAvgEd) +
    hospPoints(facilityData.ltHospitalization, facilityData.ltStateAvgHosp) +
    hospPoints(facilityData.ltEdVisit, facilityData.ltStateAvgEd)

  // --- Census utilization component (20 pts) ---
  const census = parse(manualData?.currentCensus)
  const cap = parse(facilityData.censusCap)
  const censusScore = census != null && cap && cap > 0 ? (census / cap) * 20 : 10

  const total = Math.round(starScore + hospScore + censusScore)
  const score = Math.min(100, Math.max(0, total))

  let label, colorClass, bgClass
  if (score >= 75) {
    label = 'Strong Candidate'
    colorClass = 'text-emerald-700'
    bgClass = 'bg-emerald-50 border-emerald-200'
  } else if (score >= 50) {
    label = 'Moderate Fit'
    colorClass = 'text-amber-700'
    bgClass = 'bg-amber-50 border-amber-200'
  } else {
    label = 'Needs Review'
    colorClass = 'text-red-700'
    bgClass = 'bg-red-50 border-red-200'
  }

  return { score, label, colorClass, bgClass }
}

export function generateTalkingPoints(facilityData, manualData) {
  const points = []

  const overall = parse(facilityData.overallRating)
  const health = parse(facilityData.healthRating)
  const staffing = parse(facilityData.staffingRating)
  const strHosp = parse(facilityData.strHospitalization)
  const strHospState = parse(facilityData.strStateAvgHosp)
  const strEd = parse(facilityData.strEdVisit)
  const strEdNational = parse(facilityData.strNationalAvgEd)
  const ltHosp = parse(facilityData.ltHospitalization)
  const ltHospState = parse(facilityData.ltStateAvgHosp)
  const ltEd = parse(facilityData.ltEdVisit)
  const ltEdState = parse(facilityData.ltStateAvgEd)
  const census = parse(manualData?.currentCensus)
  const cap = parse(facilityData.censusCap)
  const utilPct = census != null && cap ? Math.round((census / cap) * 100) : null

  // Overall star rating
  if (overall >= 4)
    points.push({ type: 'positive', text: `${overall}/5 overall CMS star rating — strong compliance track record, positions as a premium partnership target.` })
  else if (overall != null && overall <= 2)
    points.push({ type: 'warning', text: `Low overall CMS rating (${overall}/5) — recommend due diligence before committing resources.` })

  // Health inspection
  if (health >= 4)
    points.push({ type: 'positive', text: `High health inspection score (${health}/5) — low regulatory risk for Medelite.` })

  // Staffing
  if (staffing != null && staffing <= 2)
    points.push({ type: 'warning', text: `Low staffing rating (${staffing}/5) — staffing support could be a compelling value proposition in your pitch.` })
  else if (staffing >= 4)
    points.push({ type: 'positive', text: `Strong staffing rating (${staffing}/5) — stable care team already in place.` })

  // STR hospitalization vs state
  if (strHosp != null && strHospState != null) {
    if (strHosp < strHospState)
      points.push({ type: 'positive', text: `STR hospitalization rate (${facilityData.strHospitalization}) is below the state average (${facilityData.strStateAvgHosp}) — effective discharge planning.` })
    else if (strHosp > strHospState)
      points.push({ type: 'warning', text: `STR hospitalization rate (${facilityData.strHospitalization}) exceeds state average (${facilityData.strStateAvgHosp}) — opportunity to discuss care transition support.` })
  }

  // STR ED vs national
  if (strEd != null && strEdNational != null) {
    if (strEd < strEdNational)
      points.push({ type: 'positive', text: `STR ED visit rate (${facilityData.strEdVisit}) is below the national average (${facilityData.strNationalAvgEd}) — strong post-acute care indicator.` })
    else if (strEd > strEdNational)
      points.push({ type: 'warning', text: `STR ED visit rate (${facilityData.strEdVisit}) exceeds national average (${facilityData.strNationalAvgEd}) — flag for care quality conversation.` })
  }

  // LT hospitalization vs state
  if (ltHosp != null && ltHospState != null) {
    if (ltHosp > ltHospState)
      points.push({ type: 'warning', text: `LT hospitalization rate (${facilityData.ltHospitalization}/1,000 days) above state average (${facilityData.ltStateAvgHosp}) — potential chronic care management gap.` })
    else if (ltHosp < ltHospState)
      points.push({ type: 'positive', text: `LT hospitalization rate (${facilityData.ltHospitalization}/1,000 days) is below state average (${facilityData.ltStateAvgHosp}) — effective long-stay care.` })
  }

  // LT ED vs state
  if (ltEd != null && ltEdState != null) {
    if (ltEd > ltEdState)
      points.push({ type: 'warning', text: `LT ED visit rate (${facilityData.ltEdVisit}/1,000 days) above state average (${facilityData.ltStateAvgEd}) — worth investigating care protocols.` })
    else if (ltEd < ltEdState)
      points.push({ type: 'positive', text: `LT ED visit rate (${facilityData.ltEdVisit}/1,000 days) is below state average (${facilityData.ltStateAvgEd}) — well-managed emergency utilization.` })
  }

  // Census utilization
  if (utilPct != null) {
    if (utilPct >= 80)
      points.push({ type: 'positive', text: `High census utilization (${utilPct}%) — facility operating near capacity, indicating strong referral relationships.` })
    else if (utilPct < 60)
      points.push({ type: 'warning', text: `Below-average census utilization (${utilPct}%) — facility may be actively seeking new referral partnerships.` })
  }

  return points
}
