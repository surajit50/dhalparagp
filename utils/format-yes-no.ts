/**
 * Formats Yes/No values with colored HTML spans for PDFme
 * Green for Yes (#16a34a), Red for No (#dc2626)
 */
export function formatYesNoHTML(value: boolean | string): string {
  const isYes = value === true || value === "Yes" || value === "yes"

  if (isYes) {
    return `<span style="color: #16a34a; font-weight: 600;">Yes</span>`
  } else {
    return `<span style="color: #dc2626; font-weight: 600;">No</span>`
  }
}

/**
 * Formats an array of Yes/No values for a table row
 */
export function formatRowYesNoValues(values: (boolean | string)[]): string[] {
  return values.map((value) => formatYesNoHTML(value))
}

/**
 * Example usage for agency data
 */
export function formatAgencyRow(
  sno: number,
  name: string,
  amount1: number,
  amount2: number,
  evaluations: (boolean | string)[],
): string[] {
  return [sno.toString(), name, amount1.toFixed(2), amount2.toFixed(2), ...formatRowYesNoValues(evaluations)]
}
