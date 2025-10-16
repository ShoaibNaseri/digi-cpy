import { db, auth } from '@/firebase/config'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  setDoc
} from 'firebase/firestore'
import {
  generateInvitationToken,
  sendInvitationEmail
} from './invitationService'
import { createLog } from './logService'
import { encryptFields, decryptFields } from './encryptionService'

export const addUser = async (user, schoolId) => {
  try {
    const usersRef = collection(db, 'users')
    const encryptedUser = encryptFields(user)
    const docRef = await addDoc(usersRef, {
      ...encryptedUser,
      inviteAt: serverTimestamp(),
      status: 'INVITED',
      schoolId: schoolId
    })

    const token = await generateInvitationToken(
      user.email,
      user.role,
      schoolId,
      docRef.id
    )

    const invitationLink = `${window.location.origin}/educator-access/teacher-account-setup?invitationToken=${token}`

    await sendInvitationEmail(user.email, user.role, invitationLink)

    await createLog({
      userId: auth.currentUser.uid,
      collectionName: 'users',
      data: user,
      schoolId: schoolId,
      action: 'ADD_USER'
    })

    return docRef
  } catch (error) {
    console.error('Error adding user:', error)
    throw error
  }
}

export const getUsers = async (status, schoolId, searchQuery) => {
  const usersRef = collection(db, 'users')
  let q = query(usersRef, where('schoolId', '==', schoolId))

  if (status) {
    q = query(
      usersRef,
      where('schoolId', '==', schoolId),
      where('status', '==', status)
    )
  }

  const querySnapshot = await getDocs(q)
  let users = querySnapshot.docs.map((doc) => {
    const userData = doc.data()
    const decryptedData = decryptFields(userData)
    return {
      ...decryptedData,
      uid: doc.id
    }
  })

  // Filter users based on search query if provided
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase()
    users = users.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
    )
  }

  return users
}

export const getUserById = async (id) => {
  const userRef = doc(db, 'users', id)
  const docSnap = await getDoc(userRef)
  const userData = docSnap.data()
  const decryptedData = decryptFields(userData)
  return {
    ...decryptedData,
    uid: docSnap.id
  }
}

export const checkUserExists = async (email) => {
  try {
    const usersRef = collection(db, 'users')
    const encryptedEmail = encryptFields({ email }).email
    const q = query(usersRef, where('email', '==', encryptedEmail))
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  } catch (error) {
    console.error('Error checking user existence:', error)
    return false
  }
}

export const updateUser = async (id, userData) => {
  try {
    const userRef = doc(db, 'users', id)
    const encryptedData = encryptFields(userData)

    await updateDoc(userRef, {
      ...encryptedData,
      updatedAt: serverTimestamp()
    })

    await createLog({
      userId: auth.currentUser.uid,
      collectionName: 'users',
      data: userData,
      schoolId: 'system',
      action: 'UPDATE_USER'
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: error.message }
  }
}

export const createInitialSchoolData = async (
  email,
  numberOfSeats,
  plan,
  paymentId
) => {
  const schoolRef = doc(collection(db, 'schools'))
  const encryptedEmail = encryptFields({ email }).email
  await setDoc(schoolRef, {
    schoolAdminEmail: encryptedEmail,
    numberOfSeats: parseInt(numberOfSeats),
    plan: plan,
    paymentId: paymentId,
    createdAt: serverTimestamp()
  })

  await createLog({
    userId: 'system',
    collectionName: 'schools',
    data: {
      schoolAdminEmail: email,
      numberOfSeats: parseInt(numberOfSeats),
      plan: plan,
      paymentId: paymentId
    },
    schoolId: schoolRef.id,
    action: 'CREATE_SCHOOL'
  })

  return schoolRef.id
}

export const getUserMonthlyStats = async (schoolId) => {
  const usersRef = collection(db, 'users')
  const q = query(
    usersRef,
    where('schoolId', '==', schoolId),
    where('role', 'in', ['STUDENT', 'TEACHER'])
  )
  const querySnapshot = await getDocs(q)
  const users = querySnapshot.docs.map((doc) => {
    const userData = doc.data()
    const decryptedData = decryptFields(userData)
    return {
      ...decryptedData,
      uid: doc.id
    }
  })

  const students = users.filter((user) => user.role === 'STUDENT')
  const teachers = users.filter((user) => user.role === 'TEACHER')

  const totalStudents = students.length
  const totalTeachers = teachers.length

  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const lastMonthStudents = students.filter((student) => {
    const createdAt = student.createdAt?.toDate?.() || student.createdAt
    return createdAt >= lastMonth
  })

  const lastMonthTeachers = teachers.filter((teacher) => {
    const createdAt = teacher.createdAt?.toDate?.() || teacher.createdAt
    return createdAt >= lastMonth
  })

  const lastMonthStudentPercentage =
    totalStudents > 0 ? (lastMonthStudents.length / totalStudents) * 100 : 0

  const lastMonthTeacherPercentage =
    totalTeachers > 0 ? (lastMonthTeachers.length / totalTeachers) * 100 : 0

  // Get missions statistics
  let totalMissions = 0
  let lastMonthMissions = 0

  try {
    const missionsRef = collection(db, 'missions')
    const missionsQuery = query(missionsRef, where('schoolId', '==', schoolId))
    const missionsSnapshot = await getDocs(missionsQuery)

    totalMissions = missionsSnapshot.docs.length

    // Count missions created in the last month
    lastMonthMissions = missionsSnapshot.docs.filter((doc) => {
      const createdAt = doc.data().createdAt?.toDate?.() || doc.data().createdAt
      return createdAt && createdAt >= lastMonth
    }).length
  } catch (error) {
    console.error('Error getting missions count:', error)
  }

  const lastMonthMissionsPercentage =
    totalMissions > 0 ? (lastMonthMissions / totalMissions) * 100 : 0

  return {
    students: {
      total: totalStudents,
      lastMonth: lastMonthStudents.length,
      lastMonthPercentage: Math.round(lastMonthStudentPercentage * 100) / 100,
      list: students
    },
    teachers: {
      total: totalTeachers,
      lastMonth: lastMonthTeachers.length,
      lastMonthPercentage: Math.round(lastMonthTeacherPercentage * 100) / 100,
      list: teachers
    },
    missions: {
      total: totalMissions,
      lastMonth: lastMonthMissions,
      lastMonthPercentage: Math.round(lastMonthMissionsPercentage * 100) / 100
    }
  }
}

export const getSchoolInfo = async (schoolId) => {
  if (!schoolId) return null
  const schoolRef = doc(db, 'schools', schoolId)
  const docSnap = await getDoc(schoolRef)
  const decryptedData = decryptFields(docSnap.data())
  return {
    ...decryptedData,
    schoolId: docSnap.id
  }
}

export const saveSchoolDetails = async (schoolDetails, primaryContacts) => {
  // Encrypt email fields in school details and primary contacts
  const encryptedSchoolDetails = encryptFields(schoolDetails)
  const encryptedPrimaryContacts = encryptFields(primaryContacts)

  if (schoolDetails.schoolId) {
    const schoolRef = doc(db, 'schools', schoolDetails.schoolId)
    await updateDoc(schoolRef, {
      ...encryptedSchoolDetails,
      ...encryptedPrimaryContacts,
      updatedAt: serverTimestamp()
    })

    await createLog({
      userId: auth.currentUser.uid,
      collectionName: 'schools',
      data: schoolDetails,
      schoolId: schoolDetails.schoolId,
      action: 'UPDATE_SCHOOL'
    })

    return schoolRef
  }

  const schoolRef = collection(db, 'schools')
  const docRef = await addDoc(schoolRef, {
    ...encryptedSchoolDetails,
    ...encryptedPrimaryContacts,
    createdAt: serverTimestamp()
  })

  await createLog({
    userId: auth.currentUser.uid,
    collectionName: 'schools',
    data: schoolDetails,
    schoolId: docRef.id,
    action: 'CREATE_SCHOOL'
  })

  return docRef
}

export const updateSchoolContacts = async (schoolId, contacts) => {
  const schoolRef = doc(db, 'schools', schoolId)
  const encryptedContacts = encryptFields(contacts)
  await updateDoc(schoolRef, {
    ...encryptedContacts,
    updatedAt: serverTimestamp()
  })

  await createLog({
    userId: auth.currentUser.uid,
    collectionName: 'schools',
    data: contacts,
    schoolId: schoolId,
    action: 'UPDATE_SCHOOL_CONTACTS'
  })

  return true
}

export const softDeleteUser = async (id) => {
  const userRef = doc(db, 'users', id)
  await updateDoc(userRef, {
    status: 'DELETED',
    removedAt: serverTimestamp()
  })
}
