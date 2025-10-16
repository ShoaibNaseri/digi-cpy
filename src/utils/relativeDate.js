/**
 * Parses relative date expressions into formatted date strings.
 *
 * This utility function converts natural language date expressions into formatted dates.
 * It supports the following formats:
 * - "today" -> Returns today's date
 * - "yesterday" -> Returns yesterday's date
 * - Days of the week with modifiers:
 *   - "last [day]" (e.g., "last monday") -> Returns the most recent occurrence of that day
 *   - "this [day]" (e.g., "this friday") -> Returns the upcoming occurrence of that day
 *   - Just the day (e.g., "monday") -> Returns the next occurrence of that day
 */
export const parseRelativeDate = (input) => {
  const text = input.toLowerCase().trim()

  // set local time
  const today = new Date()

  if (text.includes('today')) {
    return formatDate(today)
  }

  if (text.includes('yesterday')) {
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    return formatDate(yesterday)
  }

  const daysOfWeek = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  }

  let targetDay = null

  for (const [day, dayIndex] of Object.entries(daysOfWeek)) {
    if (text.includes(day)) {
      targetDay = dayIndex
      break
    }
  }

  if (
    targetDay === null &&
    !text.includes('today') &&
    !text.includes('yesterday')
  ) {
    return input
  }

  let resultDate = new Date(today)

  if (targetDay !== null) {
    if (text.includes('last')) {
      const currentDay = today.getDay()

      let daysToGoBack = currentDay - targetDay

      if (daysToGoBack <= 0) {
        daysToGoBack += 7
      }

      resultDate.setDate(today.getDate() - daysToGoBack)
    } else if (text.includes('this')) {
      const currentDay = today.getDay()

      let daysToAdjust = targetDay - currentDay

      if (daysToAdjust < 0) {
        daysToAdjust += 7
      }

      resultDate.setDate(today.getDate() + daysToAdjust)
    } else {
      const currentDay = today.getDay()

      let daysToNext = targetDay - currentDay

      if (daysToNext <= 0) {
        daysToNext += 7
      }

      resultDate.setDate(today.getDate() + daysToNext)
    }
  }

  return formatDate(resultDate)
}

const formatDate = (date) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const month = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()

  return `${month} ${day}, ${year}`
}
