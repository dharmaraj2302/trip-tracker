import * as XLSX from 'xlsx'

/**
 * Builds an Excel workbook for one trip's expenses, ready for office reimbursement.
 * trip: trip row; expenses: array of expense rows
 */
export function exportTripToExcel(trip, expenses) {
  const rows = expenses
    .slice()
    .sort((a, b) => a.expense_date.localeCompare(b.expense_date))
    .map((e) => ({
      Date: e.expense_date,
      Category: e.category,
      Type: e.subtype || '',
      Amount: Number(e.amount),
      Note: e.note || '',
      'Receipt Attached': e.receipt_url ? 'Yes' : 'No',
    }))

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  rows.push({ Date: '', Category: '', Type: '', Amount: '', Note: '', 'Receipt Attached': '' })
  rows.push({ Date: '', Category: '', Type: 'TOTAL', Amount: total, Note: '', 'Receipt Attached': '' })

  const worksheet = XLSX.utils.json_to_sheet(rows)
  worksheet['!cols'] = [
    { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 30 }, { wch: 14 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses')

  const filename = `${trip.title.replace(/\s+/g, '_')}_${trip.from_date}_to_${trip.to_date}.xlsx`
  XLSX.writeFile(workbook, filename)
}
