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
