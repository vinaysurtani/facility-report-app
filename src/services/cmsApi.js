// Dev: Vite proxy routes /cms-api/{dataset}/0 → data.cms.gov (see vite.config.js)
// Production (Vercel): /api/cms-proxy?dataset={dataset}&... fetches CMS server-side

async function cmsQuery(dataset, conditions, limit = 50) {
  let url

  if (import.meta.env.PROD) {
    const params = new URLSearchParams({ dataset, limit, ...conditions })
    url = `/api/cms-proxy?${params}`
  } else {
    const params = new URLSearchParams({ ...conditions, limit })
    url = `/cms-api/${dataset}/0?${params}`
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)

  let response
  try {
    response = await fetch(url, { signal: controller.signal })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out after 10 seconds. Please try again.')
    }
    throw new Error(
      'Network error: Unable to reach CMS API. This may be a CORS issue — try again or check browser console.'
    )
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) throw new Error(`CMS API returned status ${response.status}`)
  return response.json()
}

export async function fetchFacilityByCCN(ccn) {
  const data = await cmsQuery(
    '4pq5-n9py',
    {
      'conditions[0][property]': 'cms_certification_number_ccn',
      'conditions[0][value]': ccn,
      'conditions[0][operator]': '=',
    },
    1
  )

  if (!data.results || data.results.length === 0) {
    throw new Error(`No facility found for CCN "${ccn}". Please verify the number and try again.`)
  }

  return data.results[0]
}

export async function fetchHospitalizationData(ccn, state) {
  const [measuresData, stateData, nationalData] = await Promise.all([
    cmsQuery(
      'ijh5-nb2v',
      {
        'conditions[0][property]': 'cms_certification_number_ccn',
        'conditions[0][value]': ccn,
        'conditions[0][operator]': '=',
      },
      10
    ),
    cmsQuery(
      'xcdc-v8bm',
      {
        'conditions[0][property]': 'state_or_nation',
        'conditions[0][value]': state,
        'conditions[0][operator]': '=',
      },
      1
    ),
    cmsQuery(
      'xcdc-v8bm',
      {
        'conditions[0][property]': 'state_or_nation',
        'conditions[0][value]': 'Nation',
        'conditions[0][operator]': '=',
      },
      1
    ),
  ])

  return {
    measures: measuresData.results || [],
    stateAvg: stateData.results?.[0] || {},
    nationalAvg: nationalData.results?.[0] || {},
  }
}
