import { db } from '@/firebase/config'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDoc
} from 'firebase/firestore'
import { decryptFields, encryptFields } from './encryptionService'

export async function saveIncidentReport(reportData) {
  try {
    const evidenceImages = Array.isArray(reportData.evidenceImages)
      ? reportData.evidenceImages
      : []

    const reportRef = await addDoc(collection(db, 'incidentReports'), {
      ...encryptFields(reportData),
      createdAt: serverTimestamp(),
      status: 'pending',
      followUpStatus: 'not_started',
      followUpAttempts: 0,
      lastFollowUpDate: null,
      evidenceImages
    })

    const savedReport = { id: reportRef.id, ...reportData }

    return savedReport
  } catch (error) {
    throw error
  }
}

export async function saveLawEnforcementReport(reportData) {
  try {
    const evidenceImages = Array.isArray(reportData.evidenceImages)
      ? reportData.evidenceImages
      : []

    const reportRef = await addDoc(collection(db, 'lawEnforcementReports'), {
      ...reportData,
      createdAt: serverTimestamp(),
      evidenceImages
    })

    const savedReport = { id: reportRef.id, ...reportData }

    return savedReport
  } catch (error) {
    throw error
  }
}

export async function getIncidentReport(reportId) {
  try {
    const reportRef = doc(db, 'incidentReports', reportId)
    const reportDoc = await getDoc(reportRef)

    return decryptFields(reportDoc.data())
  } catch (error) {
    throw error
  }
}

export async function updateIncidentReport(reportId, updateData) {
  try {
    const reportRef = doc(db, 'incidentReports', reportId)
    await updateDoc(reportRef, updateData)
    return true
  } catch (error) {
    console.error('Error updating incident report:', error)
    throw error
  }
}

export async function getStudentIncidentReports(studentId) {
  try {
    const q = query(
      collection(db, 'incidentReports'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...decryptFields(doc.data())
    }))
  } catch (error) {
    throw error
  }
}

export function generateProtectionPlan(incidentData) {
  const plan = {
    incidentSummary: {
      type: incidentData.incidentType,
      platform: incidentData.platform,
      impactLevel: incidentData.impactLevel,
      timeline: incidentData.timeline || 'Not specified'
    },
    actionSteps: [
      'Stop engaging with the situation',
      'Collect and save any evidence',
      'Block the person or account involved',
      'Talk to a trusted adult'
    ],
    guardianSummary: {
      incidentDescription: incidentData.description,
      platform: incidentData.platform,
      predictedImpact: incidentData.impactLevel,
      keyTakeaways: [
        'Your child has taken the right step by reporting this incident',
        'This is a common issue that can be addressed with proper support',
        "Your child's safety and well-being are our top priority"
      ]
    },
    conversationPrompts: [
      'I need to talk to you about something that happened online',
      "I'm feeling uncomfortable about a situation I encountered",
      "I reported this to the school's safety system, but I'd like to discuss it with you"
    ],
    goldenRules: [
      'I have the right to feel safe online and offline',
      'I am capable of speaking up for myself and others',
      'I know my trusted guardian is supposed to support me and will listen without judgment',
      "It's okay to ask for help when something doesn't feel right",
      'My feelings about online situations are valid and important',
      'I can set boundaries for my online interactions',
      'I deserve respect in all my interactions, online and offline',
      'I can take control of my digital safety',
      'I have the power to make good decisions about my online activities',
      'I am not alone in dealing with online challenges'
    ]
  }

  return plan
}
