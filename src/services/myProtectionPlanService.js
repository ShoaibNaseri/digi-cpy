import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  where,
  doc,
  deleteDoc
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { decryptFields } from './encryptionService'

const PLANS_PER_PAGE = 6

export const myProtectionPlanService = {
  // Student-specific functions
  async getTotalPages(userId) {
    const coll = collection(db, 'incidentReports')
    const q = query(coll, where('userId', '==', userId))
    const snapshot = await getCountFromServer(q)
    const total = snapshot.data().count
    return Math.ceil(total / PLANS_PER_PAGE)
  },

  async getAllPlans(userId) {
    const q = query(
      collection(db, 'incidentReports'),
      orderBy('createdAt', 'desc'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...decryptFields(doc.data())
    }))
  },

  async getPlansByPage(page, lastVisible = null, userId) {
    let q
    if (page === 1) {
      q = query(
        collection(db, 'incidentReports'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(PLANS_PER_PAGE)
      )
    } else {
      q = query(
        collection(db, 'incidentReports'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(PLANS_PER_PAGE)
      )
    }

    const querySnapshot = await getDocs(q)
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
    const plans = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...decryptFields(doc.data())
    }))

    return {
      plans,
      lastVisible: lastVisibleDoc
    }
  },

  // Admin-specific functions
  async getAdminTotalPages() {
    const coll = collection(db, 'incidentReports') // Changed from 'quizzes' to 'incidentReports' for consistency
    const snapshot = await getCountFromServer(coll)
    const total = snapshot.data().count
    return Math.ceil(total / PLANS_PER_PAGE)
  },

  async getAllAdminPlans() {
    const q = query(
      collection(db, 'incidentReports'), // Changed from 'plans' to 'incidentReports' for consistency
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...decryptFields(doc.data())
    }))
  },

  async getAdminPlansByPage(page, lastVisible = null) {
    let q
    if (page === 1) {
      q = query(
        collection(db, 'incidentReports'), // Changed from 'quizzes' to 'incidentReports' for consistency
        orderBy('createdAt', 'desc'),
        limit(PLANS_PER_PAGE)
      )
    } else {
      q = query(
        collection(db, 'incidentReports'), // Changed from 'quizzes' to 'incidentReports' for consistency
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(PLANS_PER_PAGE)
      )
    }

    const querySnapshot = await getDocs(q)
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
    const plans = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...decryptFields(doc.data())
    }))

    return {
      plans,
      lastVisible: lastVisibleDoc
    }
  },

  // Shared functions
  filterPlans(plans, searchQuery, statusFilter) {
    let filtered = [...plans]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((plan) => plan.status === statusFilter)
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()

      filtered = filtered.filter((plan) => {
        try {
          // Parse the incident report if it's a string
          let parsedReport
          if (typeof plan.incidentReport === 'string') {
            parsedReport = JSON.parse(plan.incidentReport)
          } else {
            parsedReport = plan.incidentReport
          }

          // If parsing fails or no incident report, skip this plan
          if (!parsedReport) {
            return false
          }

          // Search in various fields
          const searchableFields = [
            parsedReport.metadata?.concern || '',
            parsedReport.metadata?.for || '',
            parsedReport.metadata?.platform || '',
            parsedReport.metadata?.threatDetected || '',
            parsedReport.incidentSummary || '',
            parsedReport.anonymousSummary || ''
          ]

          // Check if any field contains the search query
          return searchableFields.some((field) =>
            String(field).toLowerCase().includes(searchLower)
          )
        } catch (error) {
          return false
        }
      })
    }

    return filtered
  },

  // Delete protection plan
  async deletePlan(planId, userId) {
    try {
      // Verify the plan belongs to the user before deleting
      const planRef = doc(db, 'incidentReports', planId)
      const planDoc = await getDocs(
        query(collection(db, 'incidentReports'), where('userId', '==', userId))
      )

      const planExists = planDoc.docs.some((doc) => doc.id === planId)

      if (!planExists) {
        throw new Error(
          'Protection plan not found or you do not have permission to delete it'
        )
      }

      await deleteDoc(planRef)
      return true
    } catch (error) {
      console.error('Error deleting protection plan:', error)
      throw error
    }
  }
}
