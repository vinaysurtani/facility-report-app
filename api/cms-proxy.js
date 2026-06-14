// Vercel serverless function — proxies CMS API requests server-side to avoid CORS.
// Called as: GET /api/cms-proxy?ccn=686123
export default async function handler(req, res) {
  const { ccn } = req.query

  if (!ccn) {
    return res.status(400).json({ error: 'ccn query parameter is required' })
  }

  const params = new URLSearchParams({
    'conditions[0][property]': 'cms_certification_number_ccn',
    'conditions[0][value]': ccn,
    'conditions[0][operator]': '=',
    limit: 1,
  })

  const upstream = `https://data.cms.gov/provider-data/api/1/datastore/query/4pq5-n9py/0?${params}`

  try {
    const response = await fetch(upstream)
    if (!response.ok) {
      return res.status(response.status).json({ error: `CMS API returned ${response.status}` })
    }
    const data = await response.json()
    return res.status(200).json(data)
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach CMS API', detail: err.message })
  }
}
