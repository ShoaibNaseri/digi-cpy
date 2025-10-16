import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  doc
} from 'firebase/firestore'
import { db } from '../firebase/config'

const PLANS_PER_PAGE = 6

export const planService = {
  async getTotalPages() {
    const coll = collection(db, 'quizzes')
    const snapshot = await getCountFromServer(coll)
    const total = snapshot.data().count
    return Math.ceil(total / PLANS_PER_PAGE)
  },

  async getAllPlans() {
    const q = query(collection(db, 'plans'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
  },

  async getPlansByPage(page, lastVisible = null) {
    let q
    if (page === 1) {
      q = query(
        collection(db, 'quizzes'),
        orderBy('createdAt', 'desc'),
        limit(PLANS_PER_PAGE)
      )
    } else {
      q = query(
        collection(db, 'quizzes'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(PLANS_PER_PAGE)
      )
    }

    const querySnapshot = await getDocs(q)
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
    const plans = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))

    return {
      plans,
      lastVisible: lastVisibleDoc
    }
  },

  filterPlans(plans, searchQuery, statusFilter) {
    let filtered = [...plans]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((plan) => plan.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter((plan) =>
        plan.planTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }
}
