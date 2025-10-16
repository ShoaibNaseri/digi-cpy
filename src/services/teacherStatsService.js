import { db } from '@/firebase/config'
import { collection, query, where, getDocs } from 'firebase/firestore'

/**
 * Calculates overall statistics for a teacher's dashboard
 * @param {Array} quizzes - Array of student quiz objects
 * @returns {Object} Object containing various statistics
 */
export const calculateTeacherStats = (quizzes = []) => {
  if (!Array.isArray(quizzes) || quizzes.length === 0) {
    return {
      totalStudents: 0,
      totalClasses: 0,
      quizCount: 0,
      averageScore: 'N/A'
    }
  }

  // Count quizzes
  const quizCount = quizzes.length

  // Calculate average score from completed quizzes
  const completedQuizzes = quizzes.filter(
    (quiz) =>
      (quiz.status === 'COMPLETED' || quiz.status === 'completed') &&
      typeof quiz.score === 'number'
  )

  let averageScore = 'N/A'
  if (completedQuizzes.length > 0) {
    const totalScore = completedQuizzes.reduce(
      (sum, quiz) => sum + quiz.score,
      0
    )
    averageScore = `${Math.round(totalScore / completedQuizzes.length)}%`
  }

  // Get unique students and classes
  const uniqueStudents = new Set()
  const uniqueClasses = new Set()

  quizzes.forEach((quiz) => {
    if (quiz.studentId) uniqueStudents.add(quiz.studentId)
    if (quiz.classId) uniqueClasses.add(quiz.classId)
  })

  return {
    totalStudents: uniqueStudents.size,
    totalClasses: uniqueClasses.size,
    quizCount,
    averageScore
  }
}

/**
 * Fetches all student quizzes for a teacher across all their classes
 * This function is added for future expansion but isn't required for basic functionality
 * @param {string} schoolId - The school ID
 * @param {Array} classIds - Array of class IDs the teacher manages
 * @returns {Array} Array of student quiz objects
 */
export const fetchAllStudentQuizzes = async (schoolId, classIds) => {
  try {
    if (!schoolId || !classIds || classIds.length === 0) {
      console.log('Missing required parameters for fetchAllStudentQuizzes')
      return []
    }

    const studentQuizzesRef = collection(db, 'studentQuizzes')
    const q = query(
      studentQuizzesRef,
      where('schoolId', '==', schoolId),
      where('classId', 'in', classIds)
    )

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching all student quizzes:', error)
    return []
  }
}
