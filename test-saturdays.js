const isDefaultHoliday = (date) => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0) {
    return true; // Sunday is always a holiday
  }
  if (dayOfWeek === 6) {
    const dateNum = date.getDate();
    const occurrence = Math.ceil(dateNum / 7);
    return !(occurrence === 2 || occurrence === 4);
  }
  return false;
};

// Check for all days in May 2026
console.log("Checking May 2026 Saturdays:");
for (let d = 1; d <= 31; d++) {
  const date = new Date(2026, 4, d); // May is 4 (0-indexed)
  if (date.getDay() === 6) {
    console.log(`May ${d}: Saturday, isDefaultHoliday = ${isDefaultHoliday(date)}, occurrence = ${Math.ceil(d / 7)}`);
  }
}
