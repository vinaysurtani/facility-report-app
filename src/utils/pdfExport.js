import jsPDF from 'jspdf'

// Generates PDF directly via jsPDF text rendering (no html2canvas).
// Matches the layout of the reference "Facility Assessment Snapshot" document.
export async function downloadPDF(facilityData, manualData, nameOverride) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = 210
  const margin = 15
  const contentW = pageW - margin * 2 // 180mm
  const labelColW = contentW * 0.44   // ~79mm for labels
  const valueColX = margin + labelColW

  // --- HEADER BLOCK: navy background with required branding text ---
  const headerH = 33
  pdf.setFillColor(10, 31, 63) // #0a1f3f (navy)
  pdf.rect(0, 0, pageW, headerH, 'F')

  // "INFINITE" bold white
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(15)
  pdf.setFont('helvetica', 'bold')
  pdf.text('INFINITE', margin, 13)

  // "— Managed by MEDELITE" lighter
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(185, 210, 255)
  pdf.text('\u2014 Managed by MEDELITE', margin + 33, 13)

  // "FACILITY ASSESSMENT SNAPSHOT"
  pdf.setFontSize(8)
  pdf.setTextColor(200, 220, 255)
  pdf.text('FACILITY ASSESSMENT SNAPSHOT', margin, 22)

  // State abbreviation — large, right-aligned
  if (facilityData.state) {
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(255, 255, 255)
    pdf.text(facilityData.state, pageW - margin, 23, { align: 'right' })
  }

  // --- TABLE ---
  const displayName = nameOverride || facilityData.facilityName
  const medicareUrl = `https://www.medicare.gov/care-compare/details/nursing-home/${facilityData.ccn}`

  const rows = [
    ['Name of Facility', displayName],
    ['Location', facilityData.location],
    ['EMR', manualData.emr || '--'],
    ['Census Capacity', String(facilityData.censusCap || '--')],
    ['Current Census', manualData.currentCensus || '--'],
    ['Type of Patient', manualData.patientType || '--'],
    ['Previous Coverage from Medelite', manualData.previousCoverage || '--'],
    ['Previous Provider Performance from Medelite', manualData.previousPerformance || '--'],
    ['Medical Coverage', manualData.medicalCoverage || '--'],
    ['Overall Star Rating', String(facilityData.overallRating || '--')],
    ['Health Inspection', String(facilityData.healthRating || '--')],
    ['Staffing', String(facilityData.staffingRating || '--')],
    ['Quality of Resident Care', String(facilityData.qualityRating || '--')],
    ['Short Term Hospitalization', facilityData.strHospitalization || '--'],
    ['STR National Avg. for Hospitalization', facilityData.strNationalAvgHosp || '--'],
    ['STR State Avg. for Hospitalization', facilityData.strStateAvgHosp || '--'],
    ['STR ED Visit', facilityData.strEdVisit || '--'],
    ['STR ED Visits National Avg.', facilityData.strNationalAvgEd || '--'],
    ['STR ED Visits State Avg.', facilityData.strStateAvgEd || '--'],
    ['LT Hospitalization', facilityData.ltHospitalization || '--'],
    ['LT National Avg. for Hospitalization', facilityData.ltNationalAvgHosp || '--'],
    ['LT State Avg. for Hospitalization', facilityData.ltStateAvgHosp || '--'],
    ['ED Visit', facilityData.ltEdVisit || '--'],
    ['LT ED Visits National Avg.', facilityData.ltNationalAvgEd || '--'],
    ['LT ED Visits State Avg.', facilityData.ltStateAvgEd || '--'],
  ]

  let y = headerH + 7
  const rowH = 9

  pdf.setDrawColor(180, 180, 180)
  pdf.setLineWidth(0.2)

  for (const [label, value] of rows) {
    // Row border
    pdf.rect(margin, y, contentW, rowH, 'S')
    // Vertical divider between label and value
    pdf.line(valueColX, y, valueColX, y + rowH)

    // Label
    pdf.setFontSize(8.5)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(60, 60, 60)
    pdf.text(label, margin + 2, y + 6)

    // Value
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(20, 20, 20)
    const maxW = contentW - labelColW - 4
    const lines = pdf.splitTextToSize(String(value), maxW)
    pdf.text(lines[0], valueColX + 2, y + 6)

    y += rowH
  }

  // Medicare URL
  y += 7
  pdf.setFontSize(7.5)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(100, 100, 100)
  pdf.text('Medicare Care Compare:', margin, y)
  y += 5

  pdf.setTextColor(44, 123, 229)
  pdf.text(medicareUrl, margin, y)
  // Clickable link covering the URL text
  const urlW = pdf.getTextWidth(medicareUrl)
  pdf.link(margin, y - 4, urlW, 5, { url: medicareUrl })

  pdf.save(`facility-assessment-${facilityData.ccn}.pdf`)
}
