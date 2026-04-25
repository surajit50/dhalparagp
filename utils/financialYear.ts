// utils/financialYear.ts

export function getFinancialYearDateRange(financialYear: string) {
    const [startYearStr] = financialYear.split("-");
    const startYear = parseInt(startYearStr);
  
    const financialYearStart = new Date(startYear, 3, 1); // April 1
    const financialYearEnd = new Date(startYear + 1, 2, 31); // March 31
  
    return { financialYearStart, financialYearEnd };
  }

  export function generateFinancialYears(startYear = 2020) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    let endYear;
  
    if (currentMonth >= 3) { // After March, the new financial year has started
      endYear = currentYear;
    } else {
      endYear = currentYear - 1;
    }
  
    const years = [];
    for (let year = endYear; year >= startYear; year--) {
      years.push(`${year}-${year + 1}`);
    }
    return years;
  }

  export function getCurrentFinancialYear() {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-indexed (0 for January)
    const currentYear = today.getFullYear();
  
    if (currentMonth >= 3) {
      // April to December: The financial year is currentYear to currentYear + 1
      return `${currentYear}-${currentYear + 1}`;
    } else {
      // January to March: The financial year is currentYear - 1 to currentYear
      return `${currentYear - 1}-${currentYear}`;
    }
  }