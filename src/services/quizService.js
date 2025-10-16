import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  doc,
  updateDoc,
  deleteDoc,
  where,
  setDoc,
  getDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore'
import { db } from '@/firebase/config'

const QUIZZES_PER_PAGE = 6

export const quizService = {
  async getTotalPages() {
    const coll = collection(db, 'quizzes')
    const snapshot = await getCountFromServer(coll)
    const total = snapshot.data().count
    return Math.ceil(total / QUIZZES_PER_PAGE)
  },

  async getAllQuizzes() {
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
  },

  async getQuizzesByPage(page, lastVisible = null) {
    let q
    if (page === 1) {
      q = query(
        collection(db, 'quizzes'),
        orderBy('createdAt', 'desc'),
        limit(QUIZZES_PER_PAGE)
      )
    } else {
      q = query(
        collection(db, 'quizzes'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(QUIZZES_PER_PAGE)
      )
    }

    const querySnapshot = await getDocs(q)
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
    const quizzes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))

    return {
      quizzes,
      lastVisible: lastVisibleDoc
    }
  },

  async updateQuizRetryStatus(quizId, canUserRetryQuiz) {
    const quizRef = doc(db, 'quizzes', quizId)
    await updateDoc(quizRef, {
      canUserRetryQuiz,
      updatedAt: new Date()
    })
  },

  filterQuizzes(quizzes, searchQuery, statusFilter) {
    let filtered = [...quizzes]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((quiz) => quiz.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter((quiz) =>
        quiz.quizTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  },

  async deleteQuiz(quizId) {
    // Delete the quiz
    const quizRef = doc(db, 'quizzes', quizId)
    await deleteDoc(quizRef)

    // Find and delete all related studentQuizzes
    const studentQuizzesRef = collection(db, 'studentQuizzes')
    const q = query(studentQuizzesRef, where('originalQuizId', '==', quizId))
    const querySnapshot = await getDocs(q)

    // Delete each studentQuiz
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
  },

  async getQuizRetryStatus(quizId) {
    const quizRef = doc(db, 'quizzes', quizId)
    const quizDoc = await getDoc(quizRef)
    if (quizDoc.exists()) {
      return quizDoc.data().canUserRetryQuiz
    }
    return false
  },

  async createQuizRetry(quiz, userId) {
    const studentQuizzesRef = collection(db, 'studentQuizzes')
    const newDocRef = doc(studentQuizzesRef)

    const newStudentQuiz = {
      ...quiz,
      id: newDocRef.id,
      status: 'in-progress',
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      remainingTime: quiz.quizDuration * 60,
      progress: 0,
      completedAt: null,
      createdAt: new Date(),
      studentId: userId,
      originalQuizId: quiz.originalQuizId || quiz.id
    }

    await setDoc(newDocRef, newStudentQuiz)
    return newDocRef.id
  },

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  },

  async getStudentQuiz(quizId) {
    const quizRef = doc(db, 'studentQuizzes', quizId)
    const quizDoc = await getDoc(quizRef)

    if (quizDoc.exists()) {
      return { id: quizDoc.id, ...quizDoc.data() }
    }
    return null
  },

  async updateQuizProgress(quizId, data) {
    const quizRef = doc(db, 'studentQuizzes', quizId)
    await updateDoc(quizRef, data)
  },

  async submitQuiz(quizId, data) {
    const quizRef = doc(db, 'studentQuizzes', quizId)
    await updateDoc(quizRef, {
      ...data,
      status: 'completed',
      completedAt: serverTimestamp()
    })

    const updatedQuizDoc = await getDoc(quizRef)
    if (updatedQuizDoc.exists()) {
      return { id: updatedQuizDoc.id, ...updatedQuizDoc.data() }
    }
    return null
  },

  async saveQuiz(quizData, status, currentUser, quizId = null) {
    if (quizId) {
      const quizRef = doc(db, 'quizzes', quizId)
      await updateDoc(quizRef, {
        ...quizData,
        status: status,
        updatedAt: new Date()
      })
      return { success: true, message: `Quiz updated as ${status}` }
    } else {
      const quizRef = collection(db, 'quizzes')
      const docRef = await addDoc(quizRef, {
        ...quizData,
        status: status,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: currentUser.uid,
        authorEmail: currentUser.email
      })
      return {
        success: true,
        message: `Quiz saved as ${status}`,
        quizId: docRef.id
      }
    }
  },

  async getQuizById(quizId) {
    const quizRef = doc(db, 'quizzes', quizId)
    const quizDoc = await getDoc(quizRef)
    if (quizDoc.exists()) {
      return quizDoc.data()
    }
    return null
  }
}
