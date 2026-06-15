import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType,
  BorderStyle,
  Packer,
  ExternalHyperlink,
} from 'docx'

// Match PDF: tight rows, gray borders
const CELL_MARGINS = { top: 55, bottom: 55, left: 100, right: 100 }
const GRAY_BORDER = { style: BorderStyle.SINGLE, size: 1, color: 'B4B4B4' }
const CELL_BORDERS = { top: GRAY_BORDER, bottom: GRAY_BORDER, left: GRAY_BORDER, right: GRAY_BORDER }

function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width,
    shading: opts.shading,
    margins: CELL_MARGINS,
    borders: opts.noBorder ? undefined : CELL_BORDERS,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: String(text ?? '--'),
            bold: opts.bold || false,
            color: opts.color || '3C3C3C',
            size: 17, // 8.5pt — matches PDF body font
          }),
        ],
      }),
    ],
  })
}

export async function downloadDocx(facilityData, manualData, nameOverride) {
  const displayName = nameOverride || facilityData.facilityName
  const medicareUrl = `https://www.medicare.gov/care-compare/details/nursing-home/${facilityData.ccn}`

  const rows = [
    ['Name of Facility', displayName],
    ['Location', facilityData.location],
    ['EMR', manualData.emr],
    ['Census Capacity', facilityData.censusCap],
    ['Current Census', manualData.currentCensus],
    ['Type of Patient', manualData.patientType],
    ['Previous Coverage from Medelite', manualData.previousCoverage],
    ['Previous Provider Performance from Medelite', manualData.previousPerformance],
    ['Medical Coverage', manualData.medicalCoverage],
    ['Overall Star Rating', facilityData.overallRating],
    ['Health Inspection', facilityData.healthRating],
    ['Staffing', facilityData.staffingRating],
    ['Quality of Resident Care', facilityData.qualityRating],
    ['Short Term Hospitalization', facilityData.strHospitalization],
    ['STR National Avg. for Hospitalization', facilityData.strNationalAvgHosp],
    ['STR State Avg. for Hospitalization', facilityData.strStateAvgHosp],
    ['STR ED Visit', facilityData.strEdVisit],
    ['STR ED Visits National Avg.', facilityData.strNationalAvgEd],
    ['STR ED Visits State Avg.', facilityData.strStateAvgEd],
    ['LT Hospitalization', facilityData.ltHospitalization],
    ['LT National Avg. for Hospitalization', facilityData.ltNationalAvgHosp],
    ['LT State Avg. for Hospitalization', facilityData.ltStateAvgHosp],
    ['ED Visit', facilityData.ltEdVisit],
    ['LT ED Visits National Avg.', facilityData.ltNationalAvgEd],
    ['LT ED Visits State Avg.', facilityData.ltStateAvgEd],
  ]

  const navyShading = { type: ShadingType.SOLID, color: '0a1f3f' }
  const labelW = { size: 44, type: WidthType.PERCENTAGE }
  const valueW = { size: 56, type: WidthType.PERCENTAGE }

  const doc = new Document({
    sections: [
      {
        children: [
          // --- HEADER ---
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 75, type: WidthType.PERCENTAGE },
                    shading: navyShading,
                    margins: CELL_MARGINS,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'INFINITE', bold: true, color: 'FFFFFF', size: 30 }),
                          new TextRun({ text: '  \u2014 Managed by MEDELITE', color: 'B9D2FF', size: 18 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'FACILITY ASSESSMENT SNAPSHOT', color: 'C8DCFF', size: 14 }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: navyShading,
                    margins: CELL_MARGINS,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: facilityData.state || '', bold: true, color: 'FFFFFF', size: 40 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '' }),

          // --- DATA TABLE ---
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows.map(([label, value]) =>
              new TableRow({
                children: [
                  cell(label, { width: labelW, bold: true }),
                  cell(value, { width: valueW }),
                ],
              })
            ),
          }),

          new Paragraph({ text: '' }),

          // --- MEDICARE URL ---
          new Paragraph({
            children: [
              new TextRun({ text: 'Medicare Care Compare: ', size: 15, color: '646464' }),
              new ExternalHyperlink({
                link: medicareUrl,
                children: [
                  new TextRun({ text: medicareUrl, size: 15, color: '2C7BE5', underline: {} }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `facility-assessment-${facilityData.ccn}.docx`
  a.click()
  URL.revokeObjectURL(url)
}
