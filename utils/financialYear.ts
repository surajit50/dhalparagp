// utils/financialYear.ts

export function getFinancialYearDateRange(financialYear: string) {
    const [startYearStr] = financialYear.split("-");
    const startYear = parseInt(startYearStr);
  
    const financialYearStart = new Date(startYear, 3, 1); // April 1
    const financialYearEnd = new Date(startYear + 1, 2, 31); // March 31
  
    return { financialYearStart, financialYearEnd };
  }

  export function getQuarterDateRange(financialYear: string, quarter: string) {
    const [startYearStr] = financialYear.split("-");
    const startYear = parseInt(startYearStr) || new Date().getFullYear();
    const endYear = startYear + 1;

    let startDate: Date;
    let endDate: Date;

    switch (quarter) {
      case "Q1":
        startDate = new Date(startYear, 3, 1, 0, 0, 0, 0); // Apr 1
        endDate = new Date(startYear, 5, 30, 23, 59, 59, 999); // Jun 30
        break;
      case "Q2":
        startDate = new Date(startYear, 6, 1, 0, 0, 0, 0); // Jul 1
        endDate = new Date(startYear, 8, 30, 23, 59, 59, 999); // Sep 30
        break;
      case "Q3":
        startDate = new Date(startYear, 9, 1, 0, 0, 0, 0); // Oct 1
        endDate = new Date(startYear, 11, 31, 23, 59, 59, 999); // Dec 31
        break;
      case "Q4":
        startDate = new Date(endYear, 0, 1, 0, 0, 0, 0); // Jan 1
        endDate = new Date(endYear, 2, 31, 23, 59, 59, 999); // Mar 31
        break;
      default:
        // Fallback to full financial year
        startDate = new Date(startYear, 3, 1, 0, 0, 0, 0);
        endDate = new Date(endYear, 2, 31, 23, 59, 59, 999);
        break;
    }

    return { startDate, endDate };
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