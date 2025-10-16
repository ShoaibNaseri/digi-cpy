import { db } from '@/firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { decryptFields } from '../encryptionService'

/**
 * Get school analytics for students and teachers
 * @param {string} schoolId - The school ID to get analytics for
 * @returns {Promise<Object>} School analytics data
 */
export const getSchoolAnalytics = async (schoolId) => {
  try {
    if (!schoolId) {
      throw new Error('School ID is required')
    }

    // Get all users for this school with STUDENT and TEACHER roles
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('schoolId', '==', schoolId),
      where('role', 'in', ['STUDENT', 'TEACHER'])
    )

    const querySnapshot = await getDocs(q)
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      uid: doc.id,
      ...decryptFields(doc.data())
    }))

    // Separate students and teachers
    // Students: include all students regardless of status
    const students = users.filter((user) => user.role === 'STUDENT')
    // All teachers (any status)
    const allTeachers = users.filter((user) => user.role === 'TEACHER')
    // Teachers: only include those with ACCEPTED status
    const teachers = users.filter(
      (user) => user.role === 'TEACHER' && user.status === 'ACCEPTED'
    )

    // Calculate analytics for students
    const studentAnalytics = calculateUserAnalytics(students)

    // Calculate analytics for teachers
    const teacherAnalytics = calculateUserAnalytics(teachers)

    // Calculate overall school analytics (include all users for total count, but filter teachers by status)
    const allAcceptedUsers = [...students, ...teachers] // teachers already filtered by ACCEPTED status
    const schoolAnalytics = calculateSchoolAnalytics(allAcceptedUsers)

    return {
      students: studentAnalytics,
      teachers: {
        ...teacherAnalytics,
        totalTeachers: allTeachers.length, // Total teachers (any status)
        acceptedTeachers: teachers.length // Accepted teachers only
      },
      school: schoolAnalytics,
      totalUsers: users.length,
      totalStudents: students.length,
      totalTeachers: allTeachers.length // Total teachers for overall count
    }
  } catch (error) {
    console.error('Error fetching school analytics:', error)
    throw error
  }
}

/**
 * Calculate analytics for a group of users (students or teachers)
 * @param {Array} users - Array of user objects
 * @returns {Object} Analytics data for the user group
 */
const calculateUserAnalytics = (users) => {
  if (users.length === 0) {
    return {
      averageTimeSpent: 0,
      totalTimeSpent: 0,
      averageSessionTime: 0,
      totalSessions: 0,
      activeUsers: 0,
      averageLoginCount: 0,
      totalLoginCount: 0,
      lastLoginDistribution: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        older: 0
      }
    }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  let totalTimeSpent = 0
  let totalSessions = 0
  let totalLoginCount = 0
  let activeUsers = 0
  let lastLoginDistribution = {
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    older: 0
  }

  users.forEach((user) => {
    const userTimeSpent = user.totalTimeSpent || 0
    const userLoginCount = user.loginCount || 0
    const userLastLogin = user.lastLogin

    totalTimeSpent += userTimeSpent
    totalLoginCount += userLoginCount

    // Calculate sessions (approximate based on login count)
    totalSessions += userLoginCount

    // Check if user is active (logged in within last 7 days)
    if (userLastLogin) {
      const lastLoginDate = userLastLogin.toDate
        ? userLastLogin.toDate()
        : new Date(userLastLogin)

      if (lastLoginDate >= thisWeek) {
        activeUsers++
      }

      // Categorize last login
      if (lastLoginDate >= today) {
        lastLoginDistribution.today++
      } else if (lastLoginDate >= thisWeek) {
        lastLoginDistribution.thisWeek++
      } else if (lastLoginDate >= thisMonth) {
        lastLoginDistribution.thisMonth++
      } else {
        lastLoginDistribution.older++
      }
    }
  })

  return {
    averageTimeSpent: users.length > 0 ? totalTimeSpent / users.length : 0,
    totalTimeSpent,
    averageSessionTime: totalSessions > 0 ? totalTimeSpent / totalSessions : 0,
    totalSessions,
    activeUsers,
    averageLoginCount: users.length > 0 ? totalLoginCount / users.length : 0,
    totalLoginCount,
    lastLoginDistribution,
    userCount: users.length
  }
}

/**
 * Calculate overall school analytics
 * @param {Array} users - Array of all users (students and teachers)
 * @returns {Object} Overall school analytics
 */
const calculateSchoolAnalytics = (users) => {
  if (users.length === 0) {
    return {
      averageTimePerUser: 0,
      totalTimeSpent: 0,
      totalSessions: 0,
      activeUsers: 0,
      engagementRate: 0
    }
  }

  const now = new Date()
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  let totalTimeSpent = 0
  let totalSessions = 0
  let activeUsers = 0

  users.forEach((user) => {
    const userTimeSpent = user.totalTimeSpent || 0
    const userLoginCount = user.loginCount || 0
    const userLastLogin = user.lastLogin

    totalTimeSpent += userTimeSpent
    totalSessions += userLoginCount

    // Check if user is active
    if (userLastLogin) {
      const lastLoginDate = userLastLogin.toDate
        ? userLastLogin.toDate()
        : new Date(userLastLogin)

      if (lastLoginDate >= thisWeek) {
        activeUsers++
      }
    }
  })

  const engagementRate =
    users.length > 0 ? (activeUsers / users.length) * 100 : 0

  return {
    averageTimePerUser: users.length > 0 ? totalTimeSpent / users.length : 0,
    totalTimeSpent,
    totalSessions,
    activeUsers,
    engagementRate,
    totalUsers: users.length
  }
}

/**
 * Format time duration to human readable string
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Formatted time string
 */
export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0m'

  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else {
    return `${minutes}m`
  }
}

/**
 * Format time duration to hours and minutes
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Formatted time string (e.g., "2h 30m")
 */
export const formatTimeToHoursMinutes = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0h 0m'

  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  return `${hours}h ${minutes % 60}m`
}

/**
 * Get historical time data for chart visualization
 * @param {string} schoolId - The school ID
 * @param {string} period - 'day', 'week', or 'month'
 * @returns {Promise<Object>} Historical time data
 */
export const getHistoricalTimeData = async (schoolId, period = 'week') => {
  try {
    if (!schoolId) {
      throw new Error('School ID is required')
    }

    // Get all users for this school with STUDENT and TEACHER roles
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('schoolId', '==', schoolId),
      where('role', 'in', ['STUDENT', 'TEACHER'])
    )

    const querySnapshot = await getDocs(q)
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      uid: doc.id,
      ...decryptFields(doc.data())
    }))

    // Separate students and teachers
    const students = users.filter((user) => user.role === 'STUDENT')
    const teachers = users.filter(
      (user) => user.role === 'TEACHER' && user.status === 'ACCEPTED'
    )

    // Calculate total time for students and teachers
    const totalStudentTime = students.reduce(
      (sum, user) => sum + (user.totalTimeSpent || 0),
      0
    )
    const totalTeacherTime = teachers.reduce(
      (sum, user) => sum + (user.totalTimeSpent || 0),
      0
    )

    const now = new Date()
    const historicalData = {
      labels: [],
      studentData: [],
      teacherData: []
    }

    switch (period) {
      case 'day':
        // Last 7 days - show total time divided by 7 for visualization
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)

          historicalData.labels.push(
            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          )

          // Show total time divided by 7 days for visualization
          historicalData.studentData.push(totalStudentTime / (1000 * 60 * 7)) // Convert to minutes and divide by 7 days
          historicalData.teacherData.push(totalTeacherTime / (1000 * 60 * 7)) // Convert to minutes and divide by 7 days
        }
        break

      case 'week':
        // Last 4 weeks - show total time divided by 4 for visualization
        for (let i = 3; i >= 0; i--) {
          historicalData.labels.push(`Week ${4 - i}`)

          // Show total time divided by 4 weeks for visualization
          historicalData.studentData.push(totalStudentTime / (1000 * 60 * 4)) // Convert to minutes and divide by 4 weeks
          historicalData.teacherData.push(totalTeacherTime / (1000 * 60 * 4)) // Convert to minutes and divide by 4 weeks
        }
        break

      case 'month':
        // Last 6 months - show total time divided by 6 for visualization
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)

          historicalData.labels.push(
            monthStart.toLocaleDateString('en-US', {
              month: 'short',
              year: '2-digit'
            })
          )

          // Show total time divided by 6 months for visualization
          historicalData.studentData.push(totalStudentTime / (1000 * 60 * 6)) // Convert to minutes and divide by 6 months
          historicalData.teacherData.push(totalTeacherTime / (1000 * 60 * 6)) // Convert to minutes and divide by 6 months
        }
        break
    }

    return historicalData
  } catch (error) {
    console.error('Error fetching historical time data:', error)
    throw error
  }
}

/**
 * Calculate time spent by users on a specific date
 * @param {Array} users - Array of users
 * @param {Date} date - Target date
 * @returns {number} Total time in milliseconds
 */
const calculateTimeForDate = (users, date) => {
  let totalTime = 0

  users.forEach((user) => {
    // Check if user was active on this date
    if (user.lastLogin) {
      const lastLoginDate = user.lastLogin.toDate
        ? user.lastLogin.toDate()
        : new Date(user.lastLogin)

      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      // If user was active on this date, distribute their total time proportionally
      if (lastLoginDate >= dayStart && lastLoginDate <= dayEnd) {
        // Calculate how many days the user has been active
        const userCreatedAt = user.createdAt?.toDate?.() || user.createdAt
        const daysActive = Math.max(
          1,
          Math.ceil((lastLoginDate - userCreatedAt) / (1000 * 60 * 60 * 24))
        )

        // Distribute total time across active days
        const dailyTime = user.totalTimeSpent / daysActive
        totalTime += dailyTime
      }
    }
  })

  return totalTime
}

/**
 * Calculate time spent by users in a specific period
 * @param {Array} users - Array of users
 * @param {Date} startDate - Period start date
 * @param {Date} endDate - Period end date
 * @returns {number} Total time in milliseconds
 */
const calculateTimeForPeriod = (users, startDate, endDate) => {
  let totalTime = 0

  users.forEach((user) => {
    // Check if user was active during this period
    if (user.lastLogin) {
      const lastLoginDate = user.lastLogin.toDate
        ? user.lastLogin.toDate()
        : new Date(user.lastLogin)

      if (lastLoginDate >= startDate && lastLoginDate <= endDate) {
        // Calculate how many days the user has been active total
        const userCreatedAt = user.createdAt?.toDate?.() || user.createdAt
        const totalDaysActive = Math.max(
          1,
          Math.ceil((lastLoginDate - userCreatedAt) / (1000 * 60 * 60 * 24))
        )

        // Calculate how many days in this specific period
        const periodStart =
          userCreatedAt > startDate ? userCreatedAt : startDate
        const periodEnd = lastLoginDate < endDate ? lastLoginDate : endDate
        const daysInPeriod = Math.max(
          1,
          Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24))
        )

        // Distribute total time proportionally based on days in period vs total active days
        const proportionalTime =
          user.totalTimeSpent * (daysInPeriod / totalDaysActive)
        totalTime += proportionalTime
      }
    }
  })

  return totalTime
}

/**
 * Get detailed user analytics for a specific school
 * @param {string} schoolId - The school ID
 * @returns {Promise<Object>} Detailed analytics with user breakdowns
 */
export const getDetailedSchoolAnalytics = async (schoolId) => {
  try {
    const basicAnalytics = await getSchoolAnalytics(schoolId)

    // Add additional insights
    const insights = {
      topPerformers: {
        students: [], // Will be populated with top performing students
        teachers: [] // Will be populated with top performing teachers
      },
      engagementTrends: {
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0
      },
      timeDistribution: {
        peakHours: [],
        averageSessionLength: 0
      }
    }

    return {
      ...basicAnalytics,
      insights
    }
  } catch (error) {
    console.error('Error fetching detailed school analytics:', error)
    throw error
  }
}
