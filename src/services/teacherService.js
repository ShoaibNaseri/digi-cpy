import { db, auth, firebaseConfig } from '@/firebase/config'
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  doc,
  writeBatch,
  getDoc,
  orderBy,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import {
  generateStudentInvitationToken,
  sendStudentInvitationEmail
} from './invitationService'
import { createLog } from './logService'
import { encryptFields, decryptFields } from './encryptionService'
import { invalidateAccessCodesForClass } from './accessCodeService'

export const addStudent = async (studentData) => {
  // Encrypt sensitive fields before saving
  const encryptedStudentData = encryptFields(studentData)

  const studentRef = await addDoc(collection(db, 'users'), {
    ...encryptedStudentData,
    role: 'STUDENT',
    status: 'INVITED'
  })

  const token = await generateStudentInvitationToken(
    studentData.firstName, // Use unencrypted data for token generation
    studentData.lastName,
    studentData.email,
    studentData.schoolId,
    studentData.studentId,
    studentData.classId,
    studentRef.id
  )

  const invitationLink = `${window.location.origin}/educator-access/student-account-setup?invitationToken=${token}`

  await sendStudentInvitationEmail(
    studentData.firstName, // Use unencrypted data for email
    studentData.lastName,
    studentData.email,
    invitationLink
  )

  await createLog({
    userId: auth.currentUser.uid,
    collectionName: 'users',
    data: studentData, // Use unencrypted data for logging
    schoolId: 'system',
    action: 'CREATE_STUDENT'
  })

  return studentRef
}

export const updateStudents = async (classId, updatedStudents) => {
  try {
    const batch = writeBatch(db)

    // Get current students from database
    const studentsRef = collection(db, 'users')
    const q = query(
      studentsRef,
      where('classId', '==', classId),
      where('role', '==', 'STUDENT')
    )

    const querySnapshot = await getDocs(q)
    const existingStudents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))

    // Update each student in the database
    for (const updatedStudent of updatedStudents) {
      // Find the corresponding student in the database
      const existingStudent = existingStudents.find(
        (student) =>
          student.id === updatedStudent.id ||
          student.studentId === updatedStudent.studentId
      )

      if (existingStudent) {
        const studentDocRef = doc(db, 'users', existingStudent.id)

        // Prepare the updated data
        const updatedData = {
          firstName: updatedStudent.firstName,
          lastName: updatedStudent.lastName,
          email: updatedStudent.email,
          studentId: updatedStudent.studentId
        }

        // Encrypt sensitive fields before saving
        const encryptedData = encryptFields(updatedData)

        // Add to batch update
        batch.update(studentDocRef, encryptedData)

        // Log the update
        await createLog({
          userId: auth.currentUser.uid,
          collectionName: 'users',
          data: updatedData,
          schoolId: 'system',
          action: 'UPDATE_STUDENT'
        })
      }
    }

    // Commit all updates in a single batch
    await batch.commit()

    return { success: true }
  } catch (error) {
    console.error('Error updating students:', error)
    throw error
  }
}

export const getClassStudents = async (classId) => {
  const studentsRef = collection(db, 'users')
  const q = query(
    studentsRef,
    where('classId', '==', classId),
    where('role', '==', 'STUDENT')
  )
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    // Decrypt sensitive fields before returning
    const decryptedData = decryptFields(data)
    return { id: doc.id, ...decryptedData }
  })
}

export const getStudentQuizzes = async (schoolId, classroomIds) => {
  try {
    const studentQuizzesRef = collection(db, 'studentQuizzes')
    const classIds = Array.isArray(classroomIds) ? classroomIds : [classroomIds]

    if (!classIds || classIds.length === 0) {
      console.log('No classIds provided')
      return []
    }

    // Log the query parameters for debugging
    console.log('Building query with schoolId and classId:', {
      schoolId,
      classIds
    })

    const q = query(
      studentQuizzesRef,
      where('schoolId', '==', schoolId),
      where('classId', 'in', classIds)
    )

    const querySnapshot = await getDocs(q)
    console.log('Query returned:', querySnapshot.docs.length, 'documents')

    // If no results are found, return empty array instead of all documents
    if (querySnapshot.docs.length === 0) {
      console.log('No results found for this class. Returning empty array.')
      return []
    }

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error in getStudentQuizzes:', error)
    return []
  }
}

export const getTeacherClassroom = async (userId, schoolId) => {
  try {
    if (!userId || !schoolId) {
      console.log('getTeacherClassroom: Missing required parameters', {
        userId,
        schoolId
      })
      return []
    }

    const classroomsRef = collection(db, 'classes')
    const q = query(
      classroomsRef,
      where('createdBy', '==', userId),
      where('schoolId', '==', schoolId)
    )

    const querySnapshot = await getDocs(q)
    console.log(
      `getTeacherClassroom: Found ${querySnapshot.docs.length} classrooms`
    )
    querySnapshot.docs.forEach((doc, index) => {
      console.log(`Classroom ${index} data:`, { id: doc.id, ...doc.data() })
    })

    const results = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        classId: doc.id
      }
    })

    console.log('getTeacherClassroom: Returning', results)
    return results
  } catch (error) {
    console.error('Error in getTeacherClassroom:', error)
    return []
  }
}

export const deleteTeacherClassroom = async (classroomId) => {
  try {
    const batch = writeBatch(db)

    // First check if there are any students in the class
    const studentsRef = collection(db, 'users')
    const studentsQuery = query(
      studentsRef,
      where('classId', '==', classroomId),
      where('role', '==', 'STUDENT')
    )

    const studentsSnapshot = await getDocs(studentsQuery)

    // Only try to delete students if there are any
    if (studentsSnapshot.size > 0) {
      try {
        await deleteClassroomStudentsCloudFunction(classroomId)
        console.log('Successfully deleted class students')
      } catch (error) {
        // Log the error but continue with class deletion
        console.error('Error deleting students:', error)
        console.log(
          'Continuing with class deletion despite student deletion error'
        )
      }
    } else {
      console.log('No students found in this class, skipping student deletion')
    }

    // Invalidate all active access codes for this class
    try {
      await invalidateAccessCodesForClass(classroomId)
      console.log('Successfully invalidated access codes for class')
    } catch (error) {
      // Log the error but continue with class deletion
      console.error('Error invalidating access codes:', error)
      console.log(
        'Continuing with class deletion despite access code invalidation error'
      )
    }

    // Delete associated missions
    const missionsRef = collection(db, 'missions')
    const missionsQuery = query(
      missionsRef,
      where('classIds', 'array-contains', classroomId)
    )
    const missionsSnapshot = await getDocs(missionsQuery)

    missionsSnapshot.forEach((missionDoc) => {
      const missionData = missionDoc.data()

      if (missionData.classIds && missionData.classIds.length > 1) {
        const updatedClassIds = missionData.classIds.filter(
          (id) => id !== classroomId
        )
        batch.update(doc(db, 'missions', missionDoc.id), {
          classIds: updatedClassIds
        })
      } else {
        batch.delete(doc(db, 'missions', missionDoc.id))
      }
    })

    // Delete the classroom document
    const classroomRef = doc(db, 'classes', classroomId)
    batch.delete(classroomRef)

    await createLog({
      userId: auth.currentUser.uid,
      collectionName: 'classes',
      data: { classroomId },
      schoolId: 'system',
      action: 'DELETE_CLASSROOM'
    })

    await batch.commit()

    return { success: true }
  } catch (error) {
    console.error('Error in deleteTeacherClassroom:', error)
    throw error
  }
}

export const deleteClassroomStudentsCloudFunction = async (classroomId) => {
  try {
    // Get the current user's ID token for authentication
    const idToken = await auth.currentUser.getIdToken(true)

    const response = await fetch(
      `${firebaseConfig.functionsUrl}/deleteStudentsByClassId`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}` // Add authentication token
        },
        body: JSON.stringify({ classId: classroomId })
      }
    )

    console.log('response', response)

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }))
      console.error('response', response)
      throw new Error(
        errorData.error ||
          `Failed to delete students (Status: ${response.status})`
      )
    }

    return response.json()
  } catch (error) {
    console.error('Error in deleteClassroomStudentsCloudFunction:', error)
    throw error
  }
}

export const viewClassQuiz = async (quizId) => {
  const quizRef = doc(db, 'quizzes', quizId)
  const quizDoc = await getDoc(quizRef)
  return quizDoc.data()
}

export const getIncidentReports = async (schoolId, classIds) => {
  try {
    const reportsRef = collection(db, 'incidentReports')
    let q

    if (Array.isArray(classIds)) {
      // If classIds is an array (All Classes selected)
      q = query(
        reportsRef,
        where('schoolId', '==', schoolId),
        where('classId', 'in', classIds)
      )
    } else {
      // If classIds is a single ID (specific class selected)
      q = query(
        reportsRef,
        where('schoolId', '==', schoolId),
        where('classId', '==', classIds)
      )
    }

    const querySnapshot = await getDocs(q)
    const reports = querySnapshot.docs.map((doc) => ({
      reportId: doc.id,
      ...decryptFields(doc.data())
    }))

    return reports
  } catch (error) {
    console.error('Error fetching incident reports:', error)
    throw error
  }
}

// New function to remove a student from a class
export const removeStudent = async (studentId, removalData) => {
  try {
    // Get a reference to the student document
    const studentRef = doc(db, 'users', studentId)

    // Get the student data first
    const studentSnapshot = await getDoc(studentRef)

    if (!studentSnapshot.exists()) {
      throw new Error('Student not found')
    }

    const studentData = studentSnapshot.data()
    const classId = studentData.classId

    // Create a batch operation
    const batch = writeBatch(db)

    // Remove the student from the users collection
    batch.delete(studentRef)

    // Log the removal
    await createLog({
      userId: auth.currentUser.uid,
      collectionName: 'users',
      data: {
        studentId,
        classId,
        removalReason: removalData.reason,
        notes: removalData.notes
      },
      schoolId: 'system',
      action: 'REMOVE_STUDENT'
    })

    // Commit the batch
    await batch.commit()

    return { success: true, message: 'Student removed successfully' }
  } catch (error) {
    console.error('Error removing student:', error)
    throw error
  }
}
