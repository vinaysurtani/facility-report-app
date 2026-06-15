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
  Packer,
  ExternalHyperlink,
} from 'docx'

const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 }

function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width,
    shading: opts.shading,
    margins: CELL_MARGINS,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: String(text ?? '--'),
            bold: opts.bold || false,
            color: opts.color || '000000',
            size: 20, // 10pt
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
                          new TextRun({ text: 'INFINITE', bold: true, color: 'FFFFFF', size: 32 }),
                          new TextRun({ text: '  \u2014 Managed by MEDELITE', color: 'B9D2FF', size: 20 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'FACILITY ASSESSMENT SNAPSHOT', color: 'C8DCFF', size: 16 }),
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
                          new TextRun({ text: facilityData.state || '', bold: true, color: 'FFFFFF', size: 56 }),
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
              new TextRun({ text: 'Medicare Care Compare: ', size: 16, color: '64748b' }),
              new ExternalHyperlink({
                link: medicareUrl,
                children: [
                  new TextRun({ text: medicareUrl, size: 16, color: '2C7BE5', underline: {} }),
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
