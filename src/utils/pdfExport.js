import jsPDF from 'jspdf'

// Loads an image URL and returns a base64 data URL string.
async function toDataURL(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

// Generates PDF directly via jsPDF text rendering (no html2canvas).
// Matches the layout of the reference "Facility Assessment Snapshot" document.
export async function downloadPDF(facilityData, manualData, nameOverride) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = 210
  const margin = 15
  const contentW = pageW - margin * 2 // 180mm
  const labelColW = contentW * 0.44   // ~79mm for labels
  const valueColX = margin + labelColW

  // --- HEADER: logo image + state abbreviation ---
  const headerH = 28
  // White header background (default)
  pdf.setDrawColor(220, 220, 220)
  pdf.setLineWidth(0.3)
  pdf.line(0, headerH, pageW, headerH)

  // Embed logo
  try {
    const logoData = await toDataURL('/logo.png')
    // Logo: height 18mm, width proportional (~60mm based on ~3.3:1 aspect)
    pdf.addImage(logoData, 'PNG', margin, 5, 60, 18)
  } catch {
    // Fallback to text if image fails to load
    pdf.setFontSize(13)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(10, 31, 63)
    pdf.text('INFINITE \u2014 Managed by MEDELITE', margin, 17)
  }

  // State — right-aligned, large
  if (facilityData.state) {
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(10, 31, 63)
    pdf.text(facilityData.state, pageW - margin, 14, { align: 'right' })
  }

  // "FACILITY ASSESSMENT SNAPSHOT" subtitle under state
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(100, 116, 139)
  pdf.text('FACILITY ASSESSMENT SNAPSHOT', pageW - margin, 20, { align: 'right' })

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
