// Dev: Vite proxy routes /cms-api → data.cms.gov (see vite.config.js)
// Production (Vercel): /api/cms-proxy serverless function fetches CMS server-side
const CMS_ENDPOINT = import.meta.env.PROD
  ? '/api/cms-proxy'
  : '/cms-api/4pq5-n9py/0'

export async function fetchFacilityByCCN(ccn) {
  const params = import.meta.env.PROD
    ? new URLSearchParams({ ccn })
    : new URLSearchParams({
        'conditions[0][property]': 'cms_certification_number_ccn',
        'conditions[0][value]': ccn,
        'conditions[0][operator]': '=',
        limit: 1,
      })

  let response
  try {
    response = await fetch(`${CMS_ENDPOINT}?${params}`)
  } catch (err) {
    throw new Error(
      'Network error: Unable to reach CMS API. This may be a CORS issue — try again or check browser console.'
    )
  }

  if (!response.ok) {
    throw new Error(`CMS API returned status ${response.status}`)
  }

  const data = await response.json()

  if (!data.results || data.results.length === 0) {
    throw new Error(
      `No facility found for CCN "${ccn}". Please verify the number and try again.`
    )
  }

  return data.results[0]
}
