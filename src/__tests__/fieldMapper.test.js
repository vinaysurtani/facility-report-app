import { describe, it, expect } from 'vitest'
import { mapCMSToReport, mapHospitalizationToReport } from '../utils/fieldMapper'

describe('mapCMSToReport', () => {
  const rawFull = {
    provider_name: 'Sunrise Nursing Home',
    provider_address: '123 Main St',
    citytown: 'Springfield',
    state: 'IL',
    zip_code: '62701',
    number_of_certified_beds: 120,
    overall_rating: 4,
    health_inspection_rating: 3,
    staffing_rating: 5,
    qm_rating: 4,
    cms_certification_number_ccn: '145678',
  }

  it('maps all fields correctly', () => {
    const result = mapCMSToReport(rawFull)
    expect(result.facilityName).toBe('Sunrise Nursing Home')
    expect(result.location).toBe('123 Main St, Springfield, IL, 62701')
    expect(result.censusCap).toBe(120)
    expect(result.overallRating).toBe(4)
    expect(result.healthRating).toBe(3)
    expect(result.staffingRating).toBe(5)
    expect(result.qualityRating).toBe(4)
    expect(result.state).toBe('IL')
    expect(result.ccn).toBe('145678')
  })

  it('falls back to empty string for missing provider_name', () => {
    const result = mapCMSToReport({ ...rawFull, provider_name: undefined })
    expect(result.facilityName).toBe('')
  })

  it('falls back to N/A for missing ratings', () => {
    const result = mapCMSToReport({
      ...rawFull,
      overall_rating: undefined,
      health_inspection_rating: undefined,
      staffing_rating: undefined,
      qm_rating: undefined,
      number_of_certified_beds: undefined,
    })
    expect(result.overallRating).toBe('N/A')
    expect(result.healthRating).toBe('N/A')
    expect(result.staffingRating).toBe('N/A')
    expect(result.qualityRating).toBe('N/A')
    expect(result.censusCap).toBe('N/A')
  })

  it('builds location from available parts, skipping missing ones', () => {
    const result = mapCMSToReport({ ...rawFull, provider_address: undefined, zip_code: undefined })
    expect(result.location).toBe('Springfield, IL')
  })

  it('returns empty location string when all address parts missing', () => {
    const result = mapCMSToReport({
      ...rawFull,
      provider_address: undefined,
      citytown: undefined,
      state: undefined,
      zip_code: undefined,
    })
    expect(result.location).toBe('')
  })
})

describe('mapHospitalizationToReport', () => {
  const measures = [
    { measure_code: '521', adjusted_score: '18.5' },
    { measure_code: '522', adjusted_score: '9.2' },
    { measure_code: '551', adjusted_score: '1.8765' },
    { measure_code: '552', adjusted_score: '0.9321' },
  ]

  const stateAvg = {
    percentage_of_short_stay_residents_who_were_rehospitalized__1d02: '20.1',
    percentage_of_short_stay_residents_who_had_an_outpatient_em_d911: '10.4',
    number_of_hospitalizations_per_1000_longstay_resident_days: '1.9900',
    number_of_outpatient_emergency_department_visits_per_1000_l_de9d: '1.0100',
  }

  const nationalAvg = {
    percentage_of_short_stay_residents_who_were_rehospitalized__1d02: '21.3',
    percentage_of_short_stay_residents_who_had_an_outpatient_em_d911: '11.7',
    number_of_hospitalizations_per_1000_longstay_resident_days: '2.1000',
    number_of_outpatient_emergency_department_visits_per_1000_l_de9d: '1.2000',
  }

  it('formats STR measures as percentages with 1 decimal', () => {
    const result = mapHospitalizationToReport({ measures, stateAvg, nationalAvg })
    expect(result.strHospitalization).toBe('18.5%')
    expect(result.strEdVisit).toBe('9.2%')
    expect(result.strNationalAvgHosp).toBe('21.3%')
    expect(result.strStateAvgHosp).toBe('20.1%')
    expect(result.strNationalAvgEd).toBe('11.7%')
    expect(result.strStateAvgEd).toBe('10.4%')
  })

  it('formats LT measures as rates with 2 decimals', () => {
    const result = mapHospitalizationToReport({ measures, stateAvg, nationalAvg })
    expect(result.ltHospitalization).toBe('1.88')
    expect(result.ltEdVisit).toBe('0.93')
    expect(result.ltNationalAvgHosp).toBe('2.10')
    expect(result.ltStateAvgHosp).toBe('1.99')
    expect(result.ltNationalAvgEd).toBe('1.20')
    expect(result.ltStateAvgEd).toBe('1.01')
  })

  it('returns N/A for missing measure codes', () => {
    const result = mapHospitalizationToReport({ measures: [], stateAvg: {}, nationalAvg: {} })
    expect(result.strHospitalization).toBe('N/A')
    expect(result.strEdVisit).toBe('N/A')
    expect(result.ltHospitalization).toBe('N/A')
    expect(result.ltEdVisit).toBe('N/A')
  })

  it('returns N/A when adjusted_score is empty string', () => {
    const measuresEmpty = [{ measure_code: '521', adjusted_score: '' }]
    const result = mapHospitalizationToReport({ measures: measuresEmpty, stateAvg: {}, nationalAvg: {} })
    expect(result.strHospitalization).toBe('N/A')
  })

  it('returns N/A when avg fields are missing', () => {
    const result = mapHospitalizationToReport({ measures, stateAvg: {}, nationalAvg: {} })
    expect(result.strNationalAvgHosp).toBe('N/A')
    expect(result.strStateAvgHosp).toBe('N/A')
    expect(result.ltNationalAvgHosp).toBe('N/A')
    expect(result.ltStateAvgHosp).toBe('N/A')
  })
})
