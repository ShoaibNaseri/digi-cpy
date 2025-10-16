import { db } from '@/firebase/config'
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from 'firebase/firestore'
import { decryptFields } from '../encryptionService'

/**
 * Get analytics for all missions or a specific mission
 * @param {string|null} missionId - Optional mission ID to filter by
 */
export const getMissionAnalytics = async (missionId = null) => {
  try {
    console.log(
      'getMissionAnalytics called with missionId:',
      missionId,
      typeof missionId
    )
    const missionProgressRef = collection(db, 'studentMissionsProgress')
    let q = missionProgressRef

    if (missionId) {
      // Try both string and number formats to handle different storage types
      q = query(
        missionProgressRef,
        where('missionId', '==', missionId.toString())
      )
    }

    const snapshot = await getDocs(q)
    console.log('Raw query results:', snapshot.docs.length, 'documents')

    const missionData = snapshot.docs.map((doc) => {
      const data = doc.data()
      console.log(
        'Document data:',
        doc.id,
        data.missionId,
        data.missionTitle,
        data.attemptCount
      )
      return {
        id: doc.id,
        ...data
      }
    })

    console.log('Processed mission data:', missionData.length, 'records')
    return missionData
  } catch (error) {
    console.error('Error fetching mission analytics:', error)
    throw error
  }
}

/**
 * Get aggregated analytics summary for all missions
 */
export const getMissionAnalyticsSummary = async () => {
  try {
    const allMissionData = await getMissionAnalytics()

    // Group by mission ID
    const missionGroups = {}
    allMissionData.forEach((record) => {
      const missionId = record.missionId?.toString() || 'unknown'
      if (!missionGroups[missionId]) {
        missionGroups[missionId] = []
      }
      missionGroups[missionId].push(record)
    })

    // Calculate summary for each mission
    const missionSummaries = Object.entries(missionGroups).map(
      ([missionId, records]) => {
        const totalAttempts = records.reduce(
          (sum, record) => sum + (record.attemptCount || 0),
          0
        )
        const totalTimeSpent = records.reduce(
          (sum, record) => sum + (record.totalTimeSpent || 0),
          0
        )
        const uniqueUsers = records.length
        const averageTimePerUser =
          uniqueUsers > 0 ? totalTimeSpent / uniqueUsers : 0
        const averageAttemptsPerUser =
          uniqueUsers > 0 ? totalAttempts / uniqueUsers : 0

        // Get most recent attempt across all users
        const lastAttempts = records
          .map((record) => record.lastAttemptStartTime?.toDate?.())
          .filter((date) => date)
          .sort((a, b) => b.getTime() - a.getTime())

        return {
          missionId: parseInt(missionId) || 0,
          missionTitle: records[0]?.missionTitle || `Mission ${missionId}`,
          totalAttempts,
          totalTimeSpent,
          uniqueUsers,
          averageTimePerUser,
          averageAttemptsPerUser,
          lastActivity: lastAttempts[0] || null,
          records
        }
      }
    )

    // Overall summary
    const overallSummary = {
      totalMissions: missionSummaries.length,
      totalUsers: new Set(allMissionData.map((record) => record.userId)).size,
      totalAttempts: missionSummaries.reduce(
        (sum, mission) => sum + mission.totalAttempts,
        0
      ),
      totalTimeSpent: missionSummaries.reduce(
        (sum, mission) => sum + mission.totalTimeSpent,
        0
      ),
      averageTimePerMission:
        missionSummaries.length > 0
          ? missionSummaries.reduce(
              (sum, mission) => sum + mission.totalTimeSpent,
              0
            ) / missionSummaries.length
          : 0
    }

    return {
      overallSummary,
      missionSummaries: missionSummaries.sort(
        (a, b) => a.missionId - b.missionId
      )
    }
  } catch (error) {
    console.error('Error calculating mission analytics summary:', error)
    throw error
  }
}

/**
 * Get detailed analytics for a specific mission
 * @param {string} missionId - Mission ID
 */
export const getSpecificMissionAnalytics = async (missionId) => {
  try {
    console.log('=== SPECIFIC MISSION ANALYTICS ===')
    console.log('Requested missionId:', missionId, 'type:', typeof missionId)

    const missionData = await getMissionAnalytics(missionId)
    console.log(
      'Found mission data for missionId',
      missionId,
      ':',
      missionData.length,
      'records'
    )

    if (missionData.length > 0) {
      console.log('Sample record:', {
        missionId: missionData[0].missionId,
        missionTitle: missionData[0].missionTitle,
        userId: missionData[0].userId,
        attemptCount: missionData[0].attemptCount
      })
    }

    if (missionData.length === 0) {
      console.log('No data found for mission:', missionId)
      return {
        missionId: parseInt(missionId) || 0,
        missionTitle: `Mission ${missionId}`,
        totalAttempts: 0,
        totalTimeSpent: 0,
        uniqueUsers: 0,
        averageTimePerUser: 0,
        averageAttemptsPerUser: 0,
        userDetails: []
      }
    }

    const totalAttempts = missionData.reduce(
      (sum, record) => sum + (record.attemptCount || 0),
      0
    )
    const totalTimeSpent = missionData.reduce(
      (sum, record) => sum + (record.totalTimeSpent || 0),
      0
    )
    const uniqueUsers = missionData.length
    const averageTimePerUser =
      uniqueUsers > 0 ? totalTimeSpent / uniqueUsers : 0
    const averageAttemptsPerUser =
      uniqueUsers > 0 ? totalAttempts / uniqueUsers : 0

    console.log('Mission stats:', {
      totalAttempts,
      totalTimeSpent,
      uniqueUsers,
      averageTimePerUser,
      averageAttemptsPerUser
    })

    // Get user details for table
    const userDetails = await Promise.all(
      missionData.map(async (record) => {
        // Get user info from users collection
        try {
          // Use doc() to get user document directly by userId
          const userDocRef = doc(db, 'users', record.userId)
          const userDocSnap = await getDoc(userDocRef)
          const userData = userDocSnap.exists()
            ? decryptFields(userDocSnap.data())
            : {}

          return {
            userId: record.userId,
            firstName: userData.firstName || 'Unknown',
            lastName: userData.lastName || 'User',
            email: userData.email || 'No email',
            role: userData.role || 'STUDENT',
            attemptCount: record.attemptCount || 0,
            totalTimeSpent: record.totalTimeSpent || 0,
            averageSessionTime:
              record.attempts?.length > 0
                ? (record.totalTimeSpent || 0) / record.attempts.length
                : 0,
            lastAttempt: record.lastAttemptStartTime?.toDate?.() || null,
            progress: record.progress || 0,
            currentStep: record.step || 'intro_scene',
            attempts: record.attempts || []
          }
        } catch (error) {
          console.error(
            'Error fetching user data for userId:',
            record.userId,
            error
          )
          return {
            userId: record.userId,
            firstName: 'Unknown',
            lastName: 'User',
            email: 'No email',
            role: 'STUDENT',
            attemptCount: record.attemptCount || 0,
            totalTimeSpent: record.totalTimeSpent || 0,
            averageSessionTime: 0,
            lastAttempt: record.lastAttemptStartTime?.toDate?.() || null,
            progress: record.progress || 0,
            currentStep: record.step || 'intro_scene',
            attempts: record.attempts || []
          }
        }
      })
    )

    console.log('User details processed:', userDetails.length, 'users')

    const result = {
      missionId: parseInt(missionId) || 0,
      missionTitle: missionData[0]?.missionTitle || `Mission ${missionId}`,
      totalAttempts,
      totalTimeSpent,
      uniqueUsers,
      averageTimePerUser,
      averageAttemptsPerUser,
      userDetails: userDetails.sort(
        (a, b) => (b.totalTimeSpent || 0) - (a.totalTimeSpent || 0)
      )
    }

    console.log('Final result for mission', missionId, ':', {
      missionTitle: result.missionTitle,
      userCount: result.userDetails.length,
      totalAttempts: result.totalAttempts
    })

    return result
  } catch (error) {
    console.error('Error fetching specific mission analytics:', error)
    throw error
  }
}

/**
 * Get chart data for mission attempts over time
 * @param {string|null} missionId - Optional mission ID to filter by
 */
export const getMissionAttemptsChartData = async (missionId = null) => {
  try {
    console.log('Fetching chart data for mission:', missionId)
    const missionData = await getMissionAnalytics(missionId)
    console.log('Mission data for chart - found', missionData.length, 'records')

    // Get attempts from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyAttempts = {}

    // Initialize all days with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      dailyAttempts[dateKey] = 0
    }

    let totalAttemptsProcessed = 0

    // Count attempts by day
    missionData.forEach((record) => {
      if (record.attempts && Array.isArray(record.attempts)) {
        record.attempts.forEach((attempt) => {
          let attemptDate = null

          // Handle different date formats from Firestore
          if (attempt.startTime instanceof Date) {
            attemptDate = attempt.startTime
          } else if (attempt.startTime?.toDate) {
            attemptDate = attempt.startTime.toDate()
          } else if (attempt.startTime?.seconds) {
            // Handle Firestore timestamp format
            attemptDate = new Date(attempt.startTime.seconds * 1000)
          } else if (typeof attempt.startTime === 'string') {
            attemptDate = new Date(attempt.startTime)
          }

          if (attemptDate && attemptDate >= thirtyDaysAgo) {
            const dateKey = attemptDate.toISOString().split('T')[0]
            if (Object.prototype.hasOwnProperty.call(dailyAttempts, dateKey)) {
              dailyAttempts[dateKey]++
              totalAttemptsProcessed++
            }
          }
        })
      }
    })

    const sortedDates = Object.keys(dailyAttempts).sort()
    const labels = sortedDates.map((date) =>
      new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    )
    const data = sortedDates.map((date) => dailyAttempts[date])

    console.log(
      'Chart data - processed',
      totalAttemptsProcessed,
      'attempts in last 30 days'
    )

    return {
      labels,
      datasets: [
        {
          label: 'Daily Attempts',
          data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    }
  } catch (error) {
    console.error('Error generating mission attempts chart data:', error)
    return { labels: [], datasets: [] }
  }
}

/**
 * Get chart data for time spent by mission
 */
export const getTimeSpentByMissionChartData = async () => {
  try {
    const { missionSummaries } = await getMissionAnalyticsSummary()

    const labels = missionSummaries.map((mission) => mission.missionTitle)
    const data = missionSummaries.map((mission) =>
      Math.round(mission.totalTimeSpent / (1000 * 60))
    ) // Convert to minutes

    const colors = [
      'rgba(130, 5, 40, 0.8)',
      'rgba(12, 12, 12, 0.8)',
      'rgba(137, 5, 5, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(147, 51, 234, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(14, 165, 233, 0.8)'
    ]

    return {
      labels,
      datasets: [
        {
          label: 'Time Spent (minutes)',
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors
            .slice(0, labels.length)
            .map((color) => color.replace('0.8', '1')),
          borderWidth: 2
        }
      ]
    }
  } catch (error) {
    console.error('Error generating time spent by mission chart data:', error)
    return { labels: [], datasets: [] }
  }
}

/**
 * Format duration from milliseconds to readable string
 * @param {number} milliseconds
 */
export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds === 0) return '0m'

  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Format time since last activity
 * @param {Date} date
 */
export const formatTimeSince = (date) => {
  if (!date) return 'Never'

  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffTime / (1000 * 60))

  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

/**
 * Debug function to see all mission progress data
 */
export const debugAllMissionData = async () => {
  try {
    console.log('=== DEBUG: Fetching ALL mission progress documents ===')
    const missionProgressRef = collection(db, 'studentMissionsProgress')
    const snapshot = await getDocs(missionProgressRef)

    console.log(
      'Total documents in studentMissionsProgress:',
      snapshot.docs.length
    )

    snapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      console.log(`Document ${index + 1}:`, {
        docId: doc.id,
        missionId: data.missionId,
        missionIdType: typeof data.missionId,
        missionTitle: data.missionTitle,
        userId: data.userId,
        attemptCount: data.attemptCount,
        totalTimeSpent: data.totalTimeSpent,
        attemptsLength: data.attempts?.length || 0
      })
    })

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error in debug function:', error)
    return []
  }
}
