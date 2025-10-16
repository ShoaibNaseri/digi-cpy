// Utility for generating calendar data for the planner

/**
 * Generates calendar data for a given month and year, mapping missions to days.
 * @param {Array} assignedMissions - List of missions with dueDate property (Date object)
 * @param {number} currentYear - The year for the calendar
 * @param {number} currentMonth - The month for the calendar (0-indexed)
 * @returns {Array} Array of days with missions
 */
export function generateCalendarData(
  assignedMissions,
  currentYear,
  currentMonth
) {
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  // Get weekday of first day (0 is Sunday, 1 is Monday, etc.)
  const firstDayWeekday = firstDayOfMonth.getDay()

  // Prepare calendar data
  const calData = []

  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDayWeekday; i++) {
    calData.push({ day: null, missions: [] })
  }

  // Add actual days with missions
  for (let day = 1; day <= daysInMonth; day++) {
    // Find missions assigned to this date
    const dayMissions = assignedMissions.filter((mission) => {
      const missionDate = new Date(mission.dueDate)
      return (
        missionDate.getDate() === day &&
        missionDate.getMonth() === currentMonth &&
        missionDate.getFullYear() === currentYear
      )
    })

    calData.push({
      day: day,
      missions: dayMissions
    })
  }

  return calData
}
