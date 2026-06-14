// Vercel serverless function — generic CMS API proxy to avoid CORS.
// Usage: GET /api/cms-proxy?dataset=4pq5-n9py&conditions[0][property]=...&limit=1
export default async function handler(req, res) {
  const { dataset, ...rest } = req.query

  if (!dataset) {
    return res.status(400).json({ error: 'dataset query parameter is required' })
  }

  const params = new URLSearchParams(rest)
  const upstream = `https://data.cms.gov/provider-data/api/1/datastore/query/${dataset}/0?${params}`

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
