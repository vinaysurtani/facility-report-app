import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchFacilityByCCN, fetchHospitalizationData } from '../services/cmsApi'

function mockFetch(data, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
  })
}

beforeEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchFacilityByCCN', () => {
  it('returns the first result on success', async () => {
    const facility = { provider_name: 'Test Facility', cms_certification_number_ccn: '123456' }
    vi.stubGlobal('fetch', mockFetch({ results: [facility] }))

    const result = await fetchFacilityByCCN('123456')
    expect(result.provider_name).toBe('Test Facility')
  })

  it('throws when results array is empty', async () => {
    vi.stubGlobal('fetch', mockFetch({ results: [] }))
    await expect(fetchFacilityByCCN('999999')).rejects.toThrow('No facility found for CCN "999999"')
  })

  it('throws when results key is missing', async () => {
    vi.stubGlobal('fetch', mockFetch({}))
    await expect(fetchFacilityByCCN('999999')).rejects.toThrow('No facility found for CCN "999999"')
  })

  it('throws on non-OK HTTP response', async () => {
    vi.stubGlobal('fetch', mockFetch({}, false, 500))
    await expect(fetchFacilityByCCN('123456')).rejects.toThrow('CMS API returned status 500')
  })

  it('throws a network error message when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(fetchFacilityByCCN('123456')).rejects.toThrow('Network error')
  })
})

describe('fetchHospitalizationData', () => {
  const measuresResult = {
    results: [
      { measure_code: '521', adjusted_score: '18.5' },
      { measure_code: '522', adjusted_score: '9.2' },
    ],
  }
  const stateResult = { results: [{ state_or_nation: 'IL' }] }
  const nationalResult = { results: [{ state_or_nation: 'Nation' }] }

  it('returns measures, stateAvg, and nationalAvg on success', async () => {
    let callCount = 0
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        callCount++
        const data =
          callCount === 1 ? measuresResult : callCount === 2 ? stateResult : nationalResult
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) })
      })
    )

    const result = await fetchHospitalizationData('123456', 'IL')
    expect(result.measures).toHaveLength(2)
    expect(result.stateAvg.state_or_nation).toBe('IL')
    expect(result.nationalAvg.state_or_nation).toBe('Nation')
  })

  it('returns empty arrays/objects when results are missing', async () => {
    vi.stubGlobal('fetch', mockFetch({ results: [] }))

    const result = await fetchHospitalizationData('123456', 'IL')
    expect(result.measures).toEqual([])
    expect(result.stateAvg).toEqual({})
    expect(result.nationalAvg).toEqual({})
  })

  it('throws on non-OK HTTP response', async () => {
    vi.stubGlobal('fetch', mockFetch({}, false, 404))
    await expect(fetchHospitalizationData('123456', 'IL')).rejects.toThrow('CMS API returned status 404')
  })

  it('throws a network error message when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(fetchHospitalizationData('123456', 'IL')).rejects.toThrow('Network error')
  })
})
