export function mapCMSToReport(raw) {
  const address = [
    raw.provider_address,
    raw.citytown,
    raw.state,
    raw.zip_code,
  ]
    .filter(Boolean)
    .join(', ')

  return {
    facilityName: raw.provider_name || '',
    location: address,
    censusCap: raw.number_of_certified_beds || 'N/A',
    overallRating: raw.overall_rating || 'N/A',
    healthRating: raw.health_inspection_rating || 'N/A',
    staffingRating: raw.staffing_rating || 'N/A',
    qualityRating: raw.qm_rating || 'N/A',
    state: raw.state || '',
    ccn: raw.cms_certification_number_ccn || '',
  }
}

export function mapHospitalizationToReport({ measures, stateAvg, nationalAvg }) {
  // Index measures by code for O(1) lookup
  const byCode = {}
  for (const m of measures) {
    byCode[m.measure_code] = m
  }

  const pct = (v) =>
    v != null && v !== '' ? `${parseFloat(v).toFixed(1)}%` : 'N/A'
  const rate = (v) =>
    v != null && v !== '' ? parseFloat(v).toFixed(2) : 'N/A'

  return {
    // Short-stay hospitalization (measure 521)
    strHospitalization: pct(byCode['521']?.adjusted_score),
    strNationalAvgHosp: pct(nationalAvg.percentage_of_short_stay_residents_who_were_rehospitalized__1d02),
    strStateAvgHosp: pct(stateAvg.percentage_of_short_stay_residents_who_were_rehospitalized__1d02),
    // Short-stay ED visits (measure 522)
    strEdVisit: pct(byCode['522']?.adjusted_score),
    strNationalAvgEd: pct(nationalAvg.percentage_of_short_stay_residents_who_had_an_outpatient_em_d911),
    strStateAvgEd: pct(stateAvg.percentage_of_short_stay_residents_who_had_an_outpatient_em_d911),
    // Long-stay hospitalization per 1000 days (measure 551)
    ltHospitalization: rate(byCode['551']?.adjusted_score),
    ltNationalAvgHosp: rate(nationalAvg.number_of_hospitalizations_per_1000_longstay_resident_days),
    ltStateAvgHosp: rate(stateAvg.number_of_hospitalizations_per_1000_longstay_resident_days),
    // Long-stay ED visits per 1000 days (measure 552)
    ltEdVisit: rate(byCode['552']?.adjusted_score),
    ltNationalAvgEd: rate(nationalAvg.number_of_outpatient_emergency_department_visits_per_1000_l_de9d),
    ltStateAvgEd: rate(stateAvg.number_of_outpatient_emergency_department_visits_per_1000_l_de9d),
  }
}
