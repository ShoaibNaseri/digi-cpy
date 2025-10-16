import { db } from '@/firebase/config'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { decryptFields } from '../encryptionService'

/**
 * Fetch all user analytics data
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of user analytics
 */
export const getUserAnalytics = async (filters = {}) => {
  try {
    const usersRef = collection(db, 'users')
    let q = query(usersRef, orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(q)
    let users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      uid: doc.id,
      ...decryptFields(doc.data())
    }))

    // Include all users (including ADMIN) in analytics
    // No filtering by role here - filtering happens later based on user selection

    // Calculate analytics for each user
    const analyticsData = users.map((user) => {
      const totalTimeSpent = user.totalTimeSpent || 0
      const loginCount = user.loginCount || 0
      const lastLogin = user.lastLogin
      const loginHistory = user.loginHistory || []

      // Calculate time since last login
      let timeSinceLastLogin = null
      if (lastLogin) {
        const lastLoginDate = lastLogin.toDate
          ? lastLogin.toDate()
          : new Date(lastLogin)
        timeSinceLastLogin = Date.now() - lastLoginDate.getTime()
      }

      return {
        ...user,
        analytics: {
          totalTimeSpent,
          loginCount,
          lastLogin: lastLogin
            ? lastLogin.toDate
              ? lastLogin.toDate()
              : new Date(lastLogin)
            : null,
          timeSinceLastLogin,
          loginHistory: loginHistory.map((timestamp) =>
            timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
          ),
          averageSessionTime: loginCount > 0 ? totalTimeSpent / loginCount : 0
        }
      }
    })

    // Apply filters
    let filteredData = analyticsData

    // Filter by role
    if (filters.role && filters.role !== 'ALL') {
      filteredData = filteredData.filter((user) => user.role === filters.role)
    }

    // Filter by time period for login activity
    if (filters.timePeriod && filters.timePeriod !== 'ALL') {
      const now = new Date()
      let startDate

      switch (filters.timePeriod) {
        case 'TODAY':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'WEEK':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'MONTH':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          startDate = null
      }

      if (startDate) {
        filteredData = filteredData.filter((user) => {
          if (!user.analytics.lastLogin) return false
          return user.analytics.lastLogin >= startDate
        })
      }
    }

    return filteredData
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    throw error
  }
}

/**
 * Get aggregated analytics summary
 * @param {Array} analyticsData - User analytics data
 * @returns {Object} Summary statistics
 */
export const getAnalyticsSummary = (analyticsData) => {
  const totalUsers = analyticsData.length
  const totalTimeSpent = analyticsData.reduce(
    (sum, user) => sum + (user.analytics.totalTimeSpent || 0),
    0
  )
  const totalLogins = analyticsData.reduce(
    (sum, user) => sum + (user.analytics.loginCount || 0),
    0
  )

  const activeUsers = analyticsData.filter((user) => {
    if (!user.analytics.lastLogin) return false
    const daysSinceLogin =
      user.analytics.timeSinceLastLogin / (1000 * 60 * 60 * 24)
    return daysSinceLogin <= 7 // Active in last 7 days
  }).length

  const averageTimePerUser = totalUsers > 0 ? totalTimeSpent / totalUsers : 0
  const averageLoginsPerUser = totalUsers > 0 ? totalLogins / totalUsers : 0

  return {
    totalUsers,
    totalTimeSpent,
    totalLogins,
    activeUsers,
    averageTimePerUser,
    averageLoginsPerUser,
    inactiveUsers: totalUsers - activeUsers
  }
}

/**
 * Get chart data for time spent by role
 * @param {Array} analyticsData - User analytics data
 * @returns {Object} Chart data
 */
export const getTimeSpentByRoleChartData = (analyticsData) => {
  const roleData = {}

  analyticsData.forEach((user) => {
    const role = user.role || 'UNKNOWN'
    if (!roleData[role]) {
      roleData[role] = {
        totalTime: 0,
        userCount: 0
      }
    }
    roleData[role].totalTime += user.analytics.totalTimeSpent || 0
    roleData[role].userCount += 1
  })

  const labels = Object.keys(roleData)
  const data = labels.map((role) => roleData[role].totalTime)
  const userCounts = labels.map((role) => roleData[role].userCount)

  return {
    labels,
    datasets: [
      {
        label: 'Total Time Spent (minutes)',
        data: data.map((time) => Math.round(time / (1000 * 60))), // Convert to minutes
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 2
      }
    ],
    userCounts
  }
}

/**
 * Get chart data for login activity over time
 * @param {Array} analyticsData - User analytics data
 * @returns {Object} Chart data
 */
export const getLoginActivityChartData = (analyticsData) => {
  const last30Days = []
  const loginCounts = {}

  // Generate last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    last30Days.push(dateStr)
    loginCounts[dateStr] = 0
  }

  // Count logins per day
  analyticsData.forEach((user) => {
    user.analytics.loginHistory.forEach((loginDate) => {
      const dateStr = loginDate.toISOString().split('T')[0]
      if (loginCounts.hasOwnProperty(dateStr)) {
        loginCounts[dateStr]++
      }
    })
  })

  return {
    labels: last30Days.map((date) => {
      const d = new Date(date)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Daily Logins',
        data: last30Days.map((date) => loginCounts[date]),
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }
    ]
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
 * Format time since last login
 * @param {number} milliseconds - Time in milliseconds since last login
 * @returns {string} Formatted time string
 */
export const formatTimeSince = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return 'Never'

  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}
