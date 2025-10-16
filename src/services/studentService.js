// studentService.js
import { db, auth } from '@/firebase/config'
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  getDocs,
  query,
  orderBy,
  getDoc,
  updateDoc,
  where,
  deleteDoc
} from 'firebase/firestore'
import { createLog } from './logService'
import { encryptFields, decryptFields } from './encryptionService'

export const createStudentQuiz = async (studentQuiz) => {
  const studentQuizzesRef = collection(db, 'studentQuizzes')
  const newDocRef = doc(studentQuizzesRef)

  const newStudentQuiz = {
    ...studentQuiz,
    id: newDocRef.id,
    status: 'in-progress',
    createdAt: serverTimestamp()
  }

  await setDoc(newDocRef, newStudentQuiz)

  // await createLog({
  //   userId: studentQuiz.studentId,
  //   collectionName: 'studentQuizzes',
  //   data: newStudentQuiz,
  //   schoolId: studentQuiz.schoolId,
  //   action: 'CREATE_STUDENT_QUIZ'
  // })

  return newStudentQuiz
}

export const getStudentByStudentId = async (studentId) => {
  console.log('Looking for student with ID:', studentId)

  try {
    const studentRef = doc(db, 'users', studentId)
    const studentDoc = await getDoc(studentRef)

    if (studentDoc.exists()) {
      console.log('Found student by document ID')
      return decryptFields(studentDoc.data())
    }

    console.log('Document not found, trying to query by studentId field')
    const studentsRef = collection(db, 'users')
    const q = query(
      studentsRef,
      where('studentId', '==', studentId),
      where('role', '==', 'STUDENT')
    )

    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      console.log('Found student by studentId field')
      return decryptFields(querySnapshot.docs[0].data())
    }

    console.log('No student found with exact studentId, trying looser query')
    const looseQuery = query(studentsRef, where('role', '==', 'STUDENT'))

    const looseSnapshot = await getDocs(looseQuery)
    console.log('All students found:', looseSnapshot.docs.length)

    looseSnapshot.docs.forEach((doc) => {
      const data = decryptFields(doc.data())
      console.log('Student in DB:', {
        docId: doc.id,
        studentId: data.studentId,
        name: `${data.firstName || ''} ${data.lastName || ''}`
      })
    })

    const matchingStudent = looseSnapshot.docs.find(
      (doc) => doc.data().studentId === studentId || doc.id === studentId
    )

    if (matchingStudent) {
      console.log('Found student with similar ID')
      return decryptFields(matchingStudent.data())
    }

    console.log('No matching student found')
    return null
  } catch (error) {
    console.error('Error in getStudentByStudentId:', error)
    return null
  }
}

export const removeStudent = async (studentId) => {
  try {
    console.log(`Permanently removing student with ID: ${studentId}`)
    const studentRef = doc(db, 'users', studentId)
    await deleteDoc(studentRef)
    console.log(`Successfully deleted student with ID: ${studentId}`)
    return true
  } catch (error) {
    console.error('Error in removeStudent:', error)
    throw error
  }
}

export const fetchStudentQuizzes = async (studentId) => {
  try {
    const quizzesRef = collection(db, 'quizzes')
    const querySnapshot = await getDocs(quizzesRef)
    const fetchedQuizzes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))

    const studentQuizzesRef = collection(db, 'studentQuizzes')
    const studentQuizzesQuery = query(
      studentQuizzesRef,
      orderBy('createdAt', 'desc')
    )
    const studentQuizzesSnapshot = await getDocs(studentQuizzesQuery)

    const latestAttempts = {}
    studentQuizzesSnapshot.docs.forEach((doc) => {
      const quiz = { id: doc.id, ...doc.data() }
      if (quiz.studentId === studentId) {
        const originalId = quiz.originalQuizId || quiz.id
        if (
          !latestAttempts[originalId] ||
          new Date(quiz.createdAt?.toDate?.() || quiz.createdAt) >
            new Date(
              latestAttempts[originalId].createdAt?.toDate?.() ||
                latestAttempts[originalId].createdAt
            )
        ) {
          latestAttempts[originalId] = quiz
        }
      }
    })

    const studentQuizzes = Object.values(latestAttempts)

    const availableQuizzes = fetchedQuizzes.filter(
      (quiz) =>
        !studentQuizzes.some(
          (studentQuiz) => studentQuiz.originalQuizId === quiz.id
        )
    )

    const allQuizzes = [...studentQuizzes, ...availableQuizzes].map((quiz) => ({
      ...quiz,
      isExpired: quiz.dueDate
        ? new Date() > new Date(quiz.dueDate.toDate?.() || quiz.dueDate)
        : false
    }))

    return allQuizzes.sort(
      (a, b) =>
        new Date(b.createdAt?.toDate?.() || b.createdAt) -
        new Date(a.createdAt?.toDate?.() || a.createdAt)
    )
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    throw error
  }
}

export const softDeleteStudent = async (studentId, removalData) => {
  try {
    console.log(`Attempting to soft delete student with ID: ${studentId}`)
    console.log('Removal data:', removalData)

    const studentRef = doc(db, 'users', studentId)

    const updateData = encryptFields({
      status: 'REMOVED',
      removedAt: serverTimestamp(),
      removalReason: removalData.reason,
      removalNotes: removalData.notes,
      removedBy: removalData.removedBy
    })

    await updateDoc(studentRef, updateData)

    await createLog({
      userId: removalData.removedBy,
      collectionName: 'users',
      data: {
        studentId,
        reason: removalData.reason,
        notes: removalData.notes
      },
      schoolId: 'system',
      action: 'REMOVE_STUDENT'
    })

    console.log(`Successfully removed student with ID: ${studentId}`)
    return true
  } catch (error) {
    console.error('Error in softDeleteStudent:', error)
    throw error
  }
}

export const deleteStudent = async (studentId, removalData) => {
  try {
    console.log(
      `Deleting student with ID: ${studentId} and all related records`
    )
    console.log('Removal data:', removalData)

    // 1. 创建日志记录删除操作
    try {
      await createLog({
        userId: removalData.removedBy,
        collectionName: 'users',
        data: {
          studentId,
          reason: removalData.reason,
          notes: removalData.notes
        },
        schoolId: 'system',
        action: 'DELETE_STUDENT_COMPLETE'
      })
    } catch (logError) {
      console.warn(
        'Failed to create deletion log, but will continue with deletion:',
        logError
      )
    }

    // 2. 获取学生数据，用于后续删除相关记录
    const studentRef = doc(db, 'users', studentId)
    const studentDoc = await getDoc(studentRef)

    if (!studentDoc.exists()) {
      console.warn(`Student with ID ${studentId} not found in database`)
      return false
    }

    const studentData = decryptFields(studentDoc.data())

    // 3. 删除学生测验记录
    try {
      const studentQuizzesRef = collection(db, 'studentQuizzes')
      const quizzesQuery = query(
        studentQuizzesRef,
        where('studentId', '==', studentId)
      )
      const quizzesSnapshot = await getDocs(quizzesQuery)

      const quizDeletePromises = []
      quizzesSnapshot.forEach((quizDoc) => {
        console.log(`Deleting student quiz: ${quizDoc.id}`)
        quizDeletePromises.push(
          deleteDoc(doc(db, 'studentQuizzes', quizDoc.id))
        )
      })

      if (quizDeletePromises.length > 0) {
        await Promise.all(quizDeletePromises)
        console.log(`Deleted ${quizDeletePromises.length} student quizzes`)
      }
    } catch (error) {
      console.error('Error deleting student quizzes:', error)
    }

    // 4. 删除学生任务进度记录
    try {
      const missionProgressRef = collection(db, 'studentMissionsProgress')
      const missionQuery = query(
        missionProgressRef,
        where('studentId', '==', studentId)
      )
      const missionSnapshot = await getDocs(missionQuery)

      const missionDeletePromises = []
      missionSnapshot.forEach((missionDoc) => {
        console.log(`Deleting mission progress: ${missionDoc.id}`)
        missionDeletePromises.push(
          deleteDoc(doc(db, 'studentMissionsProgress', missionDoc.id))
        )
      })

      if (missionDeletePromises.length > 0) {
        await Promise.all(missionDeletePromises)
        console.log(
          `Deleted ${missionDeletePromises.length} mission progress records`
        )
      }
    } catch (error) {
      console.error('Error deleting student mission progress:', error)
    }

    // 5. 删除消息记录
    try {
      const messagesRef = collection(db, 'messages')
      const messagesQuery = query(
        messagesRef,
        where('participants', 'array-contains', studentId)
      )
      const messagesSnapshot = await getDocs(messagesQuery)

      const messageDeletePromises = []
      messagesSnapshot.forEach((messageDoc) => {
        console.log(`Deleting message: ${messageDoc.id}`)
        messageDeletePromises.push(
          deleteDoc(doc(db, 'messages', messageDoc.id))
        )
      })

      if (messageDeletePromises.length > 0) {
        await Promise.all(messageDeletePromises)
        console.log(`Deleted ${messageDeletePromises.length} messages`)
      }
    } catch (error) {
      console.error('Error deleting student messages:', error)
    }

    // 6. 删除事件报告记录
    try {
      const incidentReportsRef = collection(db, 'incidentReports')
      const reportsQuery = query(
        incidentReportsRef,
        where('involvedUserIds', 'array-contains', studentId)
      )
      const reportsSnapshot = await getDocs(reportsQuery)

      const reportDeletePromises = []
      reportsSnapshot.forEach((reportDoc) => {
        console.log(`Deleting incident report: ${reportDoc.id}`)
        reportDeletePromises.push(
          deleteDoc(doc(db, 'incidentReports', reportDoc.id))
        )
      })

      if (reportDeletePromises.length > 0) {
        await Promise.all(reportDeletePromises)
        console.log(`Deleted ${reportDeletePromises.length} incident reports`)
      }
    } catch (error) {
      console.error('Error deleting incident reports:', error)
    }

    // 7. 从班级记录中移除学生（如果有班级ID）
    if (studentData.classId) {
      try {
        const classRef = doc(db, 'classes', studentData.classId)
        const classDoc = await getDoc(classRef)

        if (classDoc.exists()) {
          const classData = classDoc.data()
          if (classData.students && Array.isArray(classData.students)) {
            // 过滤掉当前学生
            const updatedStudents = classData.students
              .filter(
                (student) =>
                  student.id !== studentId &&
                  student.studentId !== studentData.studentId
              )
              .map((student) => encryptFields(student))

            // 更新班级记录
            await updateDoc(classRef, {
              students: updatedStudents
            })
            console.log(`Removed student from class: ${studentData.classId}`)
          }
        }
      } catch (error) {
        console.error('Error removing student from class:', error)
      }
    }

    // 8. 删除相关日志记录
    try {
      const logsRef = collection(db, 'logs')
      const logsQuery = query(logsRef, where('userId', '==', studentId))
      const logsSnapshot = await getDocs(logsQuery)

      const logDeletePromises = []
      logsSnapshot.forEach((logDoc) => {
        console.log(`Deleting log: ${logDoc.id}`)
        logDeletePromises.push(deleteDoc(doc(db, 'logs', logDoc.id)))
      })

      if (logDeletePromises.length > 0) {
        await Promise.all(logDeletePromises)
        console.log(`Deleted ${logDeletePromises.length} logs`)
      }
    } catch (error) {
      console.error('Error deleting logs:', error)
    }

    // 9. 最后删除学生用户记录
    await deleteDoc(studentRef)
    console.log(
      `Successfully deleted student with ID: ${studentId} and all related records`
    )

    return true
  } catch (error) {
    console.error('Error in deleteStudent:', error)
    throw error
  }
}
