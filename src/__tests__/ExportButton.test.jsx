import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExportButton from '../components/ExportButton'

vi.mock('../utils/pdfExport', () => ({
  downloadPDF: vi.fn().mockResolvedValue(undefined),
}))

import { downloadPDF } from '../utils/pdfExport'

const facilityData = {
  ccn: '145678',
  facilityName: 'Test Facility',
  location: '123 Main St',
  censusCap: 100,
  overallRating: 4,
  healthRating: 3,
  staffingRating: 5,
  qualityRating: 4,
  state: 'IL',
}

const fullManualData = {
  emr: 'PointClickCare',
  currentCensus: '85',
  patientType: 'SNF',
  previousCoverage: 'Yes',
  previousPerformance: 'Good',
  medicalCoverage: 'Medicare',
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('confirm', vi.fn(() => true))
})

describe('ExportButton', () => {
  it('renders the Download PDF button', () => {
    render(
      <ExportButton
        facilityData={facilityData}
        manualData={fullManualData}
        nameOverride="Test Facility"
        disabled={false}
      />
    )
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
  })

  it('calls downloadPDF when all fields are filled and button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ExportButton
        facilityData={facilityData}
        manualData={fullManualData}
        nameOverride="Test Facility"
        disabled={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /download pdf/i }))
    expect(downloadPDF).toHaveBeenCalledOnce()
    expect(downloadPDF).toHaveBeenCalledWith(facilityData, fullManualData, 'Test Facility')
  })

  it('shows confirm dialog when manual fields are empty', async () => {
    const user = userEvent.setup()
    const emptyManual = {
      emr: '',
      currentCensus: '',
      patientType: '',
      previousCoverage: '',
      previousPerformance: '',
      medicalCoverage: '',
    }

    render(
      <ExportButton
        facilityData={facilityData}
        manualData={emptyManual}
        nameOverride="Test Facility"
        disabled={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /download pdf/i }))
    expect(window.confirm).toHaveBeenCalled()
  })

  it('does not call downloadPDF when user cancels the confirm dialog', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false))
    const user = userEvent.setup()
    const emptyManual = {
      emr: '',
      currentCensus: '',
      patientType: '',
      previousCoverage: '',
      previousPerformance: '',
      medicalCoverage: '',
    }

    render(
      <ExportButton
        facilityData={facilityData}
        manualData={emptyManual}
        nameOverride="Test Facility"
        disabled={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /download pdf/i }))
    expect(downloadPDF).not.toHaveBeenCalled()
  })

  it('is disabled when disabled prop is true', () => {
    render(
      <ExportButton
        facilityData={facilityData}
        manualData={fullManualData}
        nameOverride="Test Facility"
        disabled={true}
      />
    )
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeDisabled()
  })

  it('shows confirm dialog for whitespace-only field values', async () => {
    const user = userEvent.setup()
    const whitespaceManual = { ...fullManualData, emr: '   ' }

    render(
      <ExportButton
        facilityData={facilityData}
        manualData={whitespaceManual}
        nameOverride="Test Facility"
        disabled={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /download pdf/i }))
    expect(window.confirm).toHaveBeenCalled()
  })
})
