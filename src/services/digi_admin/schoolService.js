import { db, auth } from '@/firebase/config'
import {
  collection,
  addDoc,
  query,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  orderBy,
  limit
} from 'firebase/firestore'
import { createLog } from '../logService'
import { decryptFields, encryptFields } from '../encryptionService'

export const getSchools = async (
  searchQuery = '',
  sortField = 'createdAt',
  sortDirection = 'desc',
  pageSize = 50
) => {
  try {
    const schoolsRef = collection(db, 'schools')
    let q = query(
      schoolsRef,
      orderBy(sortField, sortDirection),
      limit(pageSize)
    )

    const querySnapshot = await getDocs(q)
    let schools = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...decryptFields(doc.data())
    }))

    // Filter schools based on search query if provided
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      schools = schools.filter(
        (school) =>
          school.schoolName?.toLowerCase().includes(searchLower) ||
          school.schoolAdminEmail?.toLowerCase().includes(searchLower) ||
          school.address?.toLowerCase().includes(searchLower) ||
          school.phone?.toLowerCase().includes(searchLower) ||
          school.plan?.toLowerCase().includes(searchLower)
      )
    }

    return schools
  } catch (error) {
    console.error('Error fetching schools:', error)
    throw error
  }
}

export const getSchoolById = async (schoolId) => {
  try {
    const schoolRef = doc(db, 'schools', schoolId)
    const docSnap = await getDoc(schoolRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...decryptFields(docSnap.data())
      }
    } else {
      throw new Error('School not found')
    }
  } catch (error) {
    console.error('Error fetching school:', error)
    throw error
  }
}

export const addSchool = async (schoolData) => {
  try {
    const schoolsRef = collection(db, 'schools')
    const encryptedSchoolData = encryptFields(schoolData)
    const docRef = await addDoc(schoolsRef, {
      ...encryptedSchoolData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'ACTIVE'
    })

    await createLog({
      userId: auth.currentUser?.uid || 'system',
      collectionName: 'schools',
      data: schoolData,
      schoolId: docRef.id,
      action: 'ADD_SCHOOL'
    })

    return docRef.id
  } catch (error) {
    console.error('Error adding school:', error)
    throw error
  }
}

export const updateSchool = async (schoolId, schoolData) => {
  try {
    const schoolRef = doc(db, 'schools', schoolId)
    const encryptedSchoolData = encryptFields(schoolData)
    await updateDoc(schoolRef, {
      ...encryptedSchoolData,
      updatedAt: serverTimestamp()
    })

    await createLog({
      userId: auth.currentUser?.uid || 'system',
      collectionName: 'schools',
      data: schoolData,
      schoolId: schoolId,
      action: 'UPDATE_SCHOOL'
    })

    return true
  } catch (error) {
    console.error('Error updating school:', error)
    throw error
  }
}

export const deleteSchool = async (schoolId) => {
  try {
    const schoolRef = doc(db, 'schools', schoolId)
    await deleteDoc(schoolRef)

    await createLog({
      userId: auth.currentUser?.uid || 'system',
      collectionName: 'schools',
      data: { schoolId },
      schoolId: schoolId,
      action: 'DELETE_SCHOOL'
    })

    return true
  } catch (error) {
    console.error('Error deleting school:', error)
    throw error
  }
}

export const getSchoolStats = async () => {
  try {
    const schoolsRef = collection(db, 'schools')
    const querySnapshot = await getDocs(schoolsRef)
    const schools = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...decryptFields(doc.data())
    }))

    const totalSchools = schools.length
    const activeSchools = schools.filter(
      (school) => school.status === 'ACTIVE'
    ).length
    const inactiveSchools = schools.filter(
      (school) => school.status === 'INACTIVE'
    ).length

    // Calculate schools by plan
    const planStats = schools.reduce((acc, school) => {
      const plan = school.plan || 'Unknown'
      acc[plan] = (acc[plan] || 0) + 1
      return acc
    }, {})

    return {
      totalSchools,
      activeSchools,
      inactiveSchools,
      planStats
    }
  } catch (error) {
    console.error('Error fetching school stats:', error)
    throw error
  }
}

export const searchSchools = async (searchTerm) => {
  try {
    const schoolsRef = collection(db, 'schools')
    const querySnapshot = await getDocs(schoolsRef)
    const schools = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...decryptFields(doc.data())
    }))

    const searchLower = searchTerm.toLowerCase()
    const filteredSchools = schools.filter(
      (school) =>
        school.schoolName?.toLowerCase().includes(searchLower) ||
        school.schoolAdminEmail?.toLowerCase().includes(searchLower) ||
        school.address?.toLowerCase().includes(searchLower) ||
        school.phone?.toLowerCase().includes(searchLower)
    )

    return filteredSchools
  } catch (error) {
    console.error('Error searching schools:', error)
    throw error
  }
}
