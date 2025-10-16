// services/studentReportService.js
import { db } from '@/firebase/config'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { getStudentQuizzes } from './teacherService'
import { decryptFields } from './encryptionService'

/**
 * Fetches student quiz reports for a specific class
 * @param {string} schoolId - The school ID
 * @param {string} classId - The class ID
 * @returns {Promise<Array>} - Array of student quizzes
 */
export const fetchStudentQuizReports = async (schoolId, classId) => {
  try {
    if (!schoolId || !classId) {
      console.log('Missing schoolId or classId')
      return []
    }

    console.log('Fetching quizzes with params:', {
      schoolId,
      classId
    })

    const quizzes = await getStudentQuizzes(schoolId, classId)
    console.log('Fetched quizzes (count):', quizzes.length)

    return quizzes
  } catch (e) {
    console.error('Error fetching quizzes:', e)
    return []
  }
}

/**
 * Fetches student information for a list of quizzes
 * @param {Array} quizzes - Array of quiz objects containing studentId
 * @returns {Promise<Object>} - Object mapping studentIds to student info
 */
export const fetchStudentInfos = async (quizzes) => {
  if (!quizzes || !quizzes.length) return {}

  const infos = {}
  const fetchQueue = []

  // Find unique student IDs that we don't have info for yet
  for (const quiz of quizzes) {
    if (!quiz.studentId || infos[quiz.studentId]) continue
    fetchQueue.push(quiz.studentId)
  }

  if (fetchQueue.length === 0) return infos

  console.log(`Fetching info for ${fetchQueue.length} students`)

  try {
    // Query all users with role STUDENT
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('role', '==', 'STUDENT'))
    const snapshot = await getDocs(q)

    // Create a map of document IDs to user data
    const userIdMap = {}
    snapshot.docs.forEach((doc) => {
      // Decrypt the user data before storing
      const userData = decryptFields(doc.data())
      userIdMap[doc.id] = userData
    })

    // Process each student ID
    for (const studentId of fetchQueue) {
      // First try to find user by document ID
      if (userIdMap[studentId]) {
        const userData = userIdMap[studentId]
        infos[studentId] = {
          firstName: userData.firstName || '',
          lastName: userData.lastName || ''
        }
        console.log(
          `Found student ${studentId} by document ID: ${userData.firstName} ${userData.lastName}`
        )
      } else {
        // If not found by document ID, set a default name
        infos[studentId] = {
          firstName: 'Student',
          lastName: studentId.substring(0, 6)
        }
        console.log(
          `No data found for student ${studentId}, using default name`
        )
      }
    }

    return infos
  } catch (error) {
    console.error('Error fetching student info:', error)
    return infos
  }
}

/**
 * Calculates statistics for a set of student quizzes
 * @param {Array} quizzes - Array of quiz objects
 * @returns {Object} - Statistics object containing averageScore, highestScore, lowestScore, completionRate
 */
export const calculateQuizStatistics = (quizzes) => {
  if (!quizzes || !quizzes.length) {
    return {
      averageScore: 'N/A',
      highestScore: 'N/A',
      lowestScore: 'N/A',
      completionRate: '0'
    }
  }

  // Filter out entries with score value of "N/A" or non-numeric values
  const scores = quizzes
    .filter((s) => {
      if (s.score === 'N/A' || s.score === null || s.score === undefined) {
        return false
      }
      return typeof s.score === 'number' || !isNaN(Number(s.score))
    })
    .map((s) => (typeof s.score === 'number' ? s.score : Number(s.score)))

  const averageScore = scores.length
    ? `${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}`
    : 'N/A'
  const highestScore = scores.length ? `${Math.max(...scores)}` : 'N/A'
  const lowestScore = scores.length ? `${Math.min(...scores)}` : 'N/A'
  const completionRate = quizzes.length
    ? `${(
        (quizzes.filter((s) => (s.status || '').toLowerCase() === 'completed')
          .length /
          quizzes.length) *
        100
      ).toFixed(0)}`
    : 'N/A'

  return {
    averageScore,
    highestScore,
    lowestScore,
    completionRate
  }
}

/**
 * Prepares data for CSV export from quiz data
 * @param {Array} quizzes - Array of quiz objects
 * @param {Function} renderStudentName - Function to render student name
 * @param {Function} getMissionLabel - Function to get mission label
 * @param {String} className - Class name for the file name
 * @param {String} missionName - Mission name for the file name
 * @returns {Object} - Object containing csvContent and fileName
 */
export const prepareExportData = (
  quizzes,
  renderStudentName,
  getMissionLabel,
  className = 'All Classes',
  missionName = 'All Missions'
) => {
  if (quizzes.length === 0) {
    return null
  }

  // Create CSV header
  const headers = [
    'Student Name',
    'Quiz Name',
    'Mission',
    'Score',
    'Submission Date',
    'Status'
  ]

  // Convert data to CSV rows
  const rows = quizzes.map((quiz) => {
    // Format dates
    let submissionDate = 'N/A'
    if (quiz.completedAt) {
      submissionDate = new Date(
        quiz.completedAt.seconds
          ? quiz.completedAt.seconds * 1000
          : quiz.completedAt
      ).toLocaleDateString()
    }

    // Format score
    const score =
      typeof quiz.score === 'number' ? `${quiz.score}%` : quiz.score || 'N/A'

    // Create row data
    return [
      renderStudentName(quiz),
      quiz.quizTitle || 'N/A',
      getMissionLabel(quiz.mission),
      score,
      submissionDate,
      quiz.status || 'N/A'
    ]
  })

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
  ].join('\n')

  // Create file name with class and mission info
  const timestamp = new Date().toISOString().slice(0, 10)
  const fileName = `${className}_${missionName}_Report_${timestamp}.csv`

  return {
    csvContent,
    fileName
  }
}

/**
 * Filters quizzes based on search criteria
 * @param {Array} quizzes - Array of quiz objects
 * @param {String} selectedMission - Selected mission filter
 * @param {String} selectedClassId - Selected class ID
 * @param {String} searchTerm - Search term for student names
 * @param {Object} studentInfos - Object mapping studentIds to student info
 * @returns {Array} - Filtered quizzes
 */
export const filterQuizzes = (
  quizzes,
  selectedMission,
  selectedClassId,
  searchTerm,
  studentInfos
) => {
  // First filter by mission and class
  const missionAndClassFiltered = quizzes.filter((quiz) => {
    return (
      (selectedMission === 'all' || quiz.mission === selectedMission) &&
      quiz.classId === selectedClassId
    )
  })

  // Then filter by student name if search term exists
  if (!searchTerm) {
    return missionAndClassFiltered
  }

  return missionAndClassFiltered.filter((quiz) => {
    const info = studentInfos[quiz.studentId] || {}
    const fullName = `${info.firstName || ''} ${
      info.lastName || ''
    }`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase())
  })
}

/**
 * Gets the formatted student name from a quiz object
 * @param {Object} quiz - Quiz object containing studentId
 * @param {Object} studentInfos - Object mapping studentIds to student info
 * @returns {String} - Formatted student name
 */
export const getStudentName = (quiz, studentInfos) => {
  if (!quiz.studentId) return 'Unknown Student'

  const info = studentInfos[quiz.studentId]
  if (info) {
    if (info.firstName && info.lastName) {
      return `${info.firstName} ${info.lastName}`
    } else if (info.firstName) {
      return info.firstName
    } else if (info.lastName) {
      return info.lastName
    }
  }

  return `Student ${quiz.studentId.substring(0, 6)}`
}
