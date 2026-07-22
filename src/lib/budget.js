export const FOOD_MIN = 750
export const FOOD_MAX = 850

/**
 * Groups food expenses by date and returns a per-day total + status.
 * status: 'under' | 'in-band' | 'over'
 */
export function dailyFoodSummary(expenses) {
  const byDate = {}
  for (const e of expenses) {
    if (e.category !== 'food') continue
    byDate[e.expense_date] = (byDate[e.expense_date] || 0) + Number(e.amount)
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({
      date,
      total,
      status: total < FOOD_MIN ? 'under' : total > FOOD_MAX ? 'over' : 'in-band',
    }))
}

export function statusColor(status) {
  if (status === 'in-band') return 'text-teal border-teal'
  if (status === 'over') return 'text-rust border-rust'
  return 'text-amber border-amber' // under
}

export function statusLabel(status) {
  if (status === 'in-band') return 'Within band'
  if (status === 'over') return 'Over limit'
  return 'Under minimum'
}
