// classDataLogic.js - Encapsulate class data processing logic
import { getAllMissions } from '@/utils/jsnMissions'
// Predefined mission list
export const missionList = getAllMissions()

// Calculate all scheduled mission dates based on settings
export const calculateMissionSchedule = (formData) => {
  const { startDate, classDays, frequency, scheduleTime } = formData

  if (!startDate || !scheduleTime) return []

  // Create a date object from the start date
  const classStartDate = new Date(startDate)
  // Set hours to noon to avoid timezone issues
  classStartDate.setHours(12, 0, 0, 0)

  // Map day names to day numbers (0 = Sunday, 1 = Monday, etc.)
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  const selectedDays = Object.keys(classDays).filter((day) => classDays[day])
  const selectedDayNumbers = selectedDays.map((day) => dayMap[day])

  // No selected days
  if (selectedDayNumbers.length === 0) return []

  // Set the time for all missions
  const [hours, minutes] = scheduleTime.split(':').map(Number)

  // Schedule for all missions
  const scheduledMissions = []
  let missionIndex = 0 // Track which mission we're scheduling

  // Create a date starting from the class start date
  let currentDate = new Date(classStartDate)

  // Find the first day after or equal to the start date that matches a selected day
  let foundFirstDayOfWeek = false
  let firstDayOfWeekDate = null

  // First, find the start of the week containing the first selected day
  while (!foundFirstDayOfWeek) {
    if (selectedDayNumbers.includes(currentDate.getDay())) {
      foundFirstDayOfWeek = true
      firstDayOfWeekDate = new Date(currentDate)

      // Rewind to the start of the week (Sunday)
      while (firstDayOfWeekDate.getDay() !== 0) {
        firstDayOfWeekDate.setDate(firstDayOfWeekDate.getDate() - 1)
      }
    } else {
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  // Reset current date to first day of week
  currentDate = new Date(firstDayOfWeekDate)

  // Track the current week or month cycle we're in
  let currentCycle = 0

  // Loop until all 10 missions are scheduled
  while (missionIndex < missionList.length) {
    // We'll assign missions for each selected day in this week if it's the right cycle
    const isAssignmentWeek =
      frequency === 'weekly' ||
      (frequency === 'biweekly' && currentCycle % 2 === 0) ||
      (frequency === 'monthly' && currentCycle === 0)

    // Reset to Sunday of the current week
    currentDate = new Date(firstDayOfWeekDate)
    currentDate.setDate(firstDayOfWeekDate.getDate() + currentCycle * 7)

    // If we should assign missions this week
    if (isAssignmentWeek) {
      // Check each day of the week
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const checkDate = new Date(currentDate)
        checkDate.setDate(currentDate.getDate() + dayOffset)

        // If this day is one of our selected days
        if (selectedDayNumbers.includes(checkDate.getDay())) {
          // Create a new mission date
          const missionDate = new Date(checkDate)
          missionDate.setHours(hours, minutes, 0, 0)

          // Only add if this mission date is on or after the class start date
          if (missionDate >= classStartDate) {
            // Add this mission to our schedule
            scheduledMissions.push({
              missionName: missionList[missionIndex].title,
              dueDate: new Date(missionDate),
              scheduleTime: scheduleTime
            })

            // Increment mission index as we've scheduled one
            missionIndex++

            // If we've finished scheduling all missions, break out of loop
            if (missionIndex >= missionList.length) break
          }
        }
      }
    }

    // Move to the next cycle
    currentCycle++

    // For weekly, move to next week
    if (frequency === 'weekly') {
      // We already increment currentCycle, which will update the date in the next iteration
    }
    // For biweekly, we've already handled the logic with currentCycle % 2
    else if (frequency === 'biweekly') {
      // We already increment currentCycle, which will update the date in the next iteration
    }
    // For monthly, we need to move to the same week in the next month
    else if (
      frequency === 'monthly' &&
      currentCycle > 0 &&
      currentCycle % 4 === 0
    ) {
      // Get the current month and year
      const currentMonth = firstDayOfWeekDate.getMonth()
      const currentYear = firstDayOfWeekDate.getFullYear()

      // Calculate the next month's date
      let nextMonth = currentMonth + currentCycle / 4
      let nextYear = currentYear

      // Adjust if we cross a year boundary
      if (nextMonth >= 12) {
        nextMonth = nextMonth % 12
        nextYear += Math.floor(currentMonth + currentCycle / 4) / 12
      }

      // Set the new date for the same week in the next month
      firstDayOfWeekDate = new Date(nextYear, nextMonth, 1)

      // Find the first Sunday of the month
      while (firstDayOfWeekDate.getDay() !== 0) {
        firstDayOfWeekDate.setDate(firstDayOfWeekDate.getDate() + 1)
      }

      // Then adjust to the same week number as our original week
      const weekOfMonth = Math.floor(classStartDate.getDate() / 7)
      firstDayOfWeekDate.setDate(firstDayOfWeekDate.getDate() + weekOfMonth * 7)

      // Reset the cycle counter
      currentCycle = 0
    }

    // Safety check to prevent infinite loops
    if (currentCycle > 100) {
      console.error('Exceeded maximum cycle count when scheduling missions')
      break
    }
  }

  // Sort the missions by date
  scheduledMissions.sort((a, b) => a.dueDate - b.dueDate)

  // Return all scheduled missions
  return scheduledMissions
}

// Calculate all class session dates based on frequency settings
export const calculateClassSessions = (formData) => {
  const { startDate, classDays, frequency } = formData

  if (!startDate) return []

  // Create a date object and set time to noon to avoid timezone issues
  const start = new Date(startDate)
  start.setHours(12, 0, 0, 0)

  const end = new Date(start)
  // Set default end date 4 months from start date
  end.setMonth(end.getMonth() + 4)

  // No selected days
  const selectedDays = Object.keys(classDays).filter((day) => classDays[day])
  if (selectedDays.length === 0) return []

  // Map day names to day numbers (0 = Sunday, 1 = Monday, etc.)
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  const selectedDayNumbers = selectedDays.map((day) => dayMap[day])

  // Find the first session date - the first selected day on or after the start date
  let firstSessionDate = null

  // Try each day from the start date until we find a matching day
  for (let i = 0; i < 7; i++) {
    const testDate = new Date(start)
    testDate.setDate(testDate.getDate() + i)

    if (selectedDayNumbers.includes(testDate.getDay())) {
      firstSessionDate = new Date(testDate)
      break
    }
  }

  if (!firstSessionDate) return []

  const sessions = []
  let currentDate = new Date(firstSessionDate)

  // Calculate session interval based on frequency
  let intervalDays = 0
  if (frequency === 'weekly') {
    intervalDays = 7
  } else if (frequency === 'biweekly') {
    intervalDays = 14
  }

  // Add first session
  sessions.push(new Date(currentDate))

  // For weekly and biweekly, simply add the appropriate number of days
  if (frequency === 'weekly' || frequency === 'biweekly') {
    while (true) {
      currentDate = new Date(currentDate)
      currentDate.setDate(currentDate.getDate() + intervalDays)

      if (currentDate > end) break
      sessions.push(new Date(currentDate))
    }
  }
  // For monthly, we need to increment by a month and find the appropriate day
  else if (frequency === 'monthly') {
    while (true) {
      // Move to next month, same day
      const newDate = new Date(currentDate)
      newDate.setMonth(newDate.getMonth() + 1)

      // If this date is past the end date, stop
      if (newDate > end) break

      // Find the matching weekday in the new month
      const targetDayOfWeek = currentDate.getDay()

      // Calculate the date of the same weekday in the new month
      const dayDiff = targetDayOfWeek - newDate.getDay()
      const daysToAdd = (dayDiff + 7) % 7
      newDate.setDate(newDate.getDate() + daysToAdd)

      // If this date is past the end date, stop
      if (newDate > end) break

      sessions.push(new Date(newDate))
      currentDate = newDate
    }
  }

  return sessions
}

// Generate text for the next class schedule based on calculated sessions
export const generateClassScheduleText = (
  selectedDays,
  frequency,
  classSessions
) => {
  if (selectedDays.length === 0 || classSessions.length === 0) return 'TBD'

  // Get the current day
  const today = new Date()

  // Find the next upcoming session
  let nextSession = null

  for (const session of classSessions) {
    if (session >= today) {
      nextSession = session
      break
    }
  }

  if (!nextSession) return 'No upcoming sessions'

  // Format the next session date
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

  const month = months[nextSession.getMonth()]
  const date = nextSession.getDate()
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ]
  const dayName = dayNames[nextSession.getDay()]

  // Add frequency information to the display
  let frequencyInfo = ''
  if (frequency === 'biweekly') {
    frequencyInfo = ' (Every 2 weeks)'
  } else if (frequency === 'monthly') {
    frequencyInfo = ' (Monthly)'
  }

  // Special case for today
  const isToday =
    nextSession.getDate() === today.getDate() &&
    nextSession.getMonth() === today.getMonth() &&
    nextSession.getFullYear() === today.getFullYear()

  if (isToday) {
    return `Today${frequencyInfo}`
  }

  // Special case for tomorrow
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const isTomorrow =
    nextSession.getDate() === tomorrow.getDate() &&
    nextSession.getMonth() === tomorrow.getMonth() &&
    nextSession.getFullYear() === tomorrow.getFullYear()

  if (isTomorrow) {
    return `Tomorrow${frequencyInfo}`
  }

  // Default format for other days
  return `${dayName}, ${month} ${date}${frequencyInfo}`
}

// Prepare class data for Firebase
export const prepareFormDataForClassroom = (data, scheduledMissions) => {
  // Format the selected days into a string (e.g., "Mon, Wed, Fri")
  const selectedDays = Object.keys(data.classDays).filter(
    (day) => data.classDays[day]
  )
  const classDaysFormatted = selectedDays.join(', ')

  // Calculate all class sessions with fixed date handling
  const classSessions = calculateClassSessions(data)

  // Generate class schedule text
  const classSchedule = generateClassScheduleText(
    selectedDays,
    data.frequency,
    classSessions
  )

  // Determine unit - use className as unit if it exists
  const unit = data.className || 'General'

  // Set default class name if not provided
  const className = data.className || 'New Class'

  // Create description with frequency information
  let frequencyText = ''
  if (data.frequency === 'weekly') {
    frequencyText = 'weekly'
  } else if (data.frequency === 'biweekly') {
    frequencyText = 'every two weeks'
  } else if (data.frequency === 'monthly') {
    frequencyText = 'monthly'
  }

  // Format date for the description with proper timezone handling
  let startDateFormatted = ''
  if (data.startDate) {
    const date = new Date(data.startDate)
    // Set hours to noon to avoid timezone issues
    date.setHours(12, 0, 0, 0)
    startDateFormatted = date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const description = `${className} meets on ${classDaysFormatted} ${frequencyText}, starting from ${startDateFormatted}.`

  return {
    ...data,
    className,
    classDaysFormatted,
    formattedStartDate: startDateFormatted,
    nextClass: classSchedule,
    unit: unit,
    description: description,
    classSessions: classSessions,
    scheduledMissions: scheduledMissions, // Add the scheduled missions
    // Add these fields to match the TeacherClassroom expectations
    assignmentsPending: scheduledMissions.length,
    title: data.grade ? `${className} (Grade ${data.grade})` : className
  }
}

// Validate form
export const validateClassForm = (formData) => {
  // Check if required fields are filled
  const hasGrade = formData.grade.trim() !== ''
  const hasClassName = formData.className.trim() !== ''
  const hasStartDate = formData.startDate.trim() !== ''
  const hasSelectedDay = Object.values(formData.classDays).some(
    (selected) => selected
  )
  const hasScheduleTime =
    formData.scheduleTime && formData.scheduleTime.trim() !== ''

  return {
    isValid:
      hasGrade &&
      hasClassName &&
      hasStartDate &&
      hasSelectedDay &&
      hasScheduleTime,
    hasSelectedDay
  }
}

// Helper functions for class display formatting
export const getFormattedClassDays = (classDays) => {
  const selectedDays = Object.keys(classDays).filter((day) => classDays[day])
  // Full day names for selected days
  const dayNames = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday'
  }
  return selectedDays.map((day) => dayNames[day]).join(', ')
}

export const getFormattedFrequency = (frequency) => {
  switch (frequency) {
    case 'weekly':
      return 'Once a week'
    case 'biweekly':
      return 'Every two weeks'
    case 'monthly':
      return 'Monthly'
    default:
      return frequency
  }
}
