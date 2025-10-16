import { db, auth } from '@/firebase/config'
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  getDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore'
import { createLog } from './logService'
import { getClassStudents } from '@/services/teacherService'

export const createClass = async (classData) => {
  try {
    const classRef = collection(db, 'classes')
    const newClass = await addDoc(classRef, classData)
    await createLog({
      userId: auth.currentUser.uid,
      collectionName: 'classes',
      data: classData,
      schoolId: 'system',
      action: 'CREATE_CLASS'
    })
    return newClass
  } catch (error) {
    console.error('Error in createClass:', error)
    throw error
  }
}

export const updateClass = async (classData, classId) => {
  try {
    const classRef = doc(db, 'classes', classId)
    const updatedClass = await updateDoc(classRef, classData)
    await createLog({
      userId: auth.currentUser.uid,
      collectionName: 'classes',
      data: classData,
      schoolId: 'system',
      action: 'UPDATE_CLASS'
    })
    return updatedClass
  } catch (error) {
    console.error('Error in updateClass:', error)
    throw error
  }
}

export const getClassByClassId = async (classId) => {
  try {
    const classRef = doc(db, 'classes', classId)
    const classDoc = await getDoc(classRef)
    return classDoc.exists() ? classDoc.data() : null
  } catch (error) {
    console.error('Error in getClassByClassId:', error)
    throw error
  }
}

export const subscribeToTeacherClasses = (userId, schoolId, callback) => {
  try {
    const classesRef = collection(db, 'classes')
    const q = query(
      classesRef,
      where('createdBy', '==', userId),
      where('schoolId', '==', schoolId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedClassesData = {}

      snapshot.forEach((doc) => {
        updatedClassesData[doc.id] = {
          ...doc.data(),
          classId: doc.id
        }
      })

      callback(updatedClassesData)
    })

    return unsubscribe
  } catch (error) {
    console.error('Error in subscribeToTeacherClasses:', error)
    throw error
  }
}

export const convertClassArrayToObject = (classesArray) => {
  const classesDataObj = {}
  classesArray.forEach((classData) => {
    classesDataObj[classData.classId] = {
      ...classData,
      classId: classData.classId
    }
  })
  return classesDataObj
}
