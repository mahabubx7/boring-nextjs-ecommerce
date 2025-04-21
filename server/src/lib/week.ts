export const getCurrentWeekCode = (date: Date = new Date()) => {
    // Week code format: W<Int>-YYYY-MMM
    // sample, W01-2025-JAN
    // Week numbers are start from first week as W01 to W53 in a calendar year
    const currentDate = new Date(date);
    const currentYear = currentDate.getFullYear();
    // const currentMonth = currentDate.getMonth() + 1; // Months are zero-indexed
    const currentWeek = Math.ceil(currentDate.getDate() / 7); // Week number (1-4 or 1-5)
    const weekCode = `W${String(currentWeek).padStart(2, '0')}-${currentYear}-${currentDate.toLocaleString('default', { month: 'short' }).toUpperCase()}`;
    return weekCode;
}
