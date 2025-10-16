import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTeacherClassroom,
  getStudentQuizzes,
  viewClassQuiz,
  deleteTeacherClassroom,
  getClassStudents
} from '@/services/teacherService'
import { createClass } from '@/services/classService'
import { db } from '@/firebase/config'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { calculateTeacherStats } from '@/services/teacherStatsService'

// Query keys for teacher-related queries
export const teacherQueryKeys = {
  all: ['teacher'],
  classrooms: (userId, schoolId) => [
    ...teacherQueryKeys.all,
    'classrooms',
    userId,
    schoolId
  ],
  classroomsWithStudents: (userId, schoolId) => [
    ...teacherQueryKeys.all,
    'classroomsWithStudents',
    userId,
    schoolId
  ],
  studentQuizzes: (schoolId, classroomIds) => [
    ...teacherQueryKeys.all,
    'studentQuizzes',
    schoolId,
    classroomIds
  ],
  quiz: (quizId) => [...teacherQueryKeys.all, 'quiz', quizId],
  classStudents: (classId) => [
    ...teacherQueryKeys.all,
    'classStudents',
    classId
  ]
}

/**
 * Hook to fetch teacher classrooms with real-time updates
 * @param {string} userId - Teacher user ID
 * @param {string} schoolId - School ID
 * @param {boolean} enabled - Whether the query should be enabled
 */
export const useTeacherClassrooms = (userId, schoolId, enabled = true) => {
  return useQuery({
    queryKey: teacherQueryKeys.classrooms(userId, schoolId),
    queryFn: () => getTeacherClassroom(userId, schoolId),
    enabled: enabled && !!userId && !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}

/**
 * Hook to fetch teacher classrooms with students data using real-time listener
 * @param {string} userId - Teacher user ID
 * @param {string} schoolId - School ID
 * @param {boolean} enabled - Whether the query should be enabled
 */
export const useTeacherClassroomsWithStudents = (
  userId,
  schoolId,
  enabled = true
) => {
  return useQuery({
    queryKey: teacherQueryKeys.classroomsWithStudents(userId, schoolId),
    queryFn: async () => {
      if (!userId || !schoolId) return { classes: {}, classStudents: {} }

      return new Promise((resolve, reject) => {
        const classesRef = collection(db, 'classes')
        const classesQuery = query(
          classesRef,
          where('schoolId', '==', schoolId),
          where('createdBy', '==', userId)
        )

        const unsubscribe = onSnapshot(
          classesQuery,
          async (snapshot) => {
            try {
              const classesData = {}
              const studentsData = {}

              // Process each class document
              const classPromises = snapshot.docs.map(async (doc) => {
                const data = doc.data()
                const classId = doc.id

                // Fetch students for this class
                const students = await getClassStudents(classId)

                classesData[classId] = {
                  ...data,
                  classId: classId,
                  students: students
                }

                studentsData[classId] = students
              })

              await Promise.all(classPromises)

              resolve({
                classes: classesData,
                classStudents: studentsData
              })
            } catch (error) {
              reject(error)
            }
          },
          (error) => {
            reject(error)
          }
        )

        // Store unsubscribe function for cleanup
        resolve.unsubscribe = unsubscribe
      })
    },
    enabled: enabled && !!userId && !!schoolId,
    staleTime: 0, // Always consider stale to enable real-time updates
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}

/**
 * Hook to fetch student quizzes for given classrooms
 * @param {string} schoolId - School ID
 * @param {Array} classroomIds - Array of classroom IDs
 * @param {boolean} enabled - Whether the query should be enabled
 */
export const useStudentQuizzes = (schoolId, classroomIds, enabled = true) => {
  return useQuery({
    queryKey: teacherQueryKeys.studentQuizzes(schoolId, classroomIds),
    queryFn: () => getStudentQuizzes(schoolId, classroomIds),
    enabled: enabled && !!schoolId && classroomIds && classroomIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}

/**
 * Hook to fetch a specific quiz by ID
 * @param {string} quizId - Quiz ID
 * @param {boolean} enabled - Whether the query should be enabled
 */
export const useQuiz = (quizId, enabled = true) => {
  return useQuery({
    queryKey: teacherQueryKeys.quiz(quizId),
    queryFn: () => viewClassQuiz(quizId),
    enabled: enabled && !!quizId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}

/**
 * Hook to fetch students for a specific class
 * @param {string} classId - Class ID
 * @param {boolean} enabled - Whether the query should be enabled
 */
export const useClassStudents = (classId, enabled = true) => {
  return useQuery({
    queryKey: teacherQueryKeys.classStudents(classId),
    queryFn: () => getClassStudents(classId),
    enabled: enabled && !!classId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}

/**
 * Hook to delete a teacher classroom
 * @returns {Object} - Mutation object with mutate function
 */
export const useDeleteTeacherClassroom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTeacherClassroom,
    onSuccess: (data, classId) => {
      // Invalidate all teacher-related queries
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.all
      })

      // Remove specific class from cache
      queryClient.removeQueries({
        queryKey: teacherQueryKeys.classStudents(classId)
      })
    },
    onError: (error) => {
      console.error('Error deleting classroom:', error)
    }
  })
}

/**
 * Hook to create a new teacher classroom
 * @returns {Object} - Mutation object with mutate function
 */
export const useCreateTeacherClassroom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (classData) => {
      // Import the complex class creation logic
      const {
        saveClassToFirebase,
        saveMissionsToFirebase,
        sendStudentEmailNotifications,
        updateSchoolSeatUsage,
        checkSchoolHasEnoughSeats
      } = await import('@/utils/createClassLogic/firebaseLogic')

      const { calculateMissionSchedule, prepareFormDataForClassroom } =
        await import('@/utils/teacher/classDataLogic')

      // Check if school has enough seats
      const studentsCount =
        parseInt(classData.numberOfStudents, 10) ||
        classData.students.length ||
        0
      const seatCheckResult = await checkSchoolHasEnoughSeats(
        classData.schoolId,
        'unified',
        studentsCount
      )

      if (!seatCheckResult.hasEnoughSeats) {
        throw new Error(
          `Not enough seats available. Available: ${seatCheckResult.availableSeats}, Used: ${seatCheckResult.usedSeats}, Required: ${studentsCount}`
        )
      }

      // Calculate mission schedule
      const scheduledMissions = calculateMissionSchedule(classData)

      if (scheduledMissions.length === 0) {
        throw new Error('Failed to generate mission schedule')
      }

      // Process form data for Firestore
      const enhancedFormData = {
        ...prepareFormDataForClassroom(classData, scheduledMissions),
        schoolId: classData.schoolId,
        seatType: 'unified'
      }

      // Update school's seat usage count
      await updateSchoolSeatUsage(
        classData.schoolId,
        'unified',
        classData.numberOfStudents || classData.students.length
      )

      // Save to Firebase
      const classId = await saveClassToFirebase(
        enhancedFormData,
        classData.currentUser
      )

      // Create and attach all missions
      await saveMissionsToFirebase(
        classId,
        scheduledMissions,
        classData.currentUser,
        enhancedFormData
      )

      // Send email notifications if students exist
      if (classData.students && classData.students.length > 0) {
        await sendStudentEmailNotifications(
          classData.students,
          classId,
          classData.currentUser
        )
      }

      return { classId, enhancedFormData }
    },
    onSuccess: () => {
      // Invalidate teacher classrooms queries to refetch data
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.all
      })
    },
    onError: (error) => {
      console.error('Error creating classroom:', error)
    }
  })
}

/**
 * Comprehensive hook that combines all teacher data with real-time updates
 * @param {Object} currentUser - Current user object
 * @returns {Object} - Combined teacher data and stats
 */
export const useTeacherData = (currentUser) => {
  const userId = currentUser?.uid
  const schoolId = currentUser?.schoolId

  // Fetch classrooms with students using real-time updates
  const {
    data: classroomsData,
    isLoading: classroomsLoading,
    error: classroomsError
  } = useTeacherClassroomsWithStudents(userId, schoolId, !!userId && !!schoolId)

  // Extract classroom IDs for student quizzes query
  const classroomIds = classroomsData?.classes
    ? Object.keys(classroomsData.classes)
    : []

  // Fetch student quizzes
  const {
    data: studentQuizzes = [],
    isLoading: quizzesLoading,
    error: quizzesError
  } = useStudentQuizzes(schoolId, classroomIds, classroomIds.length > 0)

  // Calculate stats
  const totalStudents = classroomsData?.classStudents
    ? Object.values(classroomsData.classStudents).reduce(
        (total, students) => total + (students?.length || 0),
        0
      )
    : 0

  const totalClasses = Object.keys(classroomsData?.classes || {}).length

  // Calculate average score
  const completedQuizzes = studentQuizzes.filter(
    (quiz) => quiz.status === 'completed' || quiz.status === 'COMPLETED'
  )
  const averageScore =
    completedQuizzes.length > 0
      ? completedQuizzes.reduce((total, quiz) => total + quiz.score, 0) /
        completedQuizzes.length
      : 0

  // Enhanced stats using calculateTeacherStats if available
  let enhancedStats = {
    totalStudents,
    totalClasses,
    quizCount: studentQuizzes.length,
    averageScore: `${Math.round(averageScore)}%`
  }

  try {
    if (typeof calculateTeacherStats === 'function') {
      const calculatedStats = calculateTeacherStats(studentQuizzes)
      if (calculatedStats && calculatedStats.averageScore) {
        enhancedStats.averageScore = calculatedStats.averageScore
      }
    }
  } catch (error) {
    console.error('Error using enhanced stats calculation:', error)
  }

  return {
    classes: classroomsData?.classes || {},
    classStudents: classroomsData?.classStudents || {},
    studentQuizzes,
    averageScore,
    loading: classroomsLoading || quizzesLoading,
    stats: enhancedStats,
    error: classroomsError || quizzesError
  }
}
