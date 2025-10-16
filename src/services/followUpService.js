import { db } from '@/firebase/config'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  increment,
  arrayUnion
} from 'firebase/firestore'

export async function getPendingFollowUps(studentId) {
  try {
    const q = query(
      collection(db, 'incidentReports'),
      where('studentId', '==', studentId),
      where('followUpStatus', 'in', ['not_started', 'pending']),
      where('followUpAttempts', '<', 2)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting pending follow-ups:', error)
    throw error
  }
}

export async function updateFollowUpResponse(
  reportId,
  spokeToAdult,
  followUpMessage
) {
  try {
    const reportRef = doc(db, 'incidentReports', reportId)
    const updateData = {
      lastFollowUpDate: serverTimestamp(),
      followUpAttempts: increment(1),
      followUpStatus: spokeToAdult ? 'completed' : 'pending',
      followUpMessages: arrayUnion({
        message: followUpMessage,
        timestamp: new Date().toISOString(),
        spokeToAdult: spokeToAdult
      }),
      spokeToAdult: spokeToAdult
    }

    if (spokeToAdult) {
      updateData.resolutionDate = serverTimestamp()
      updateData.status = 'resolved'
    }

    await updateDoc(reportRef, updateData)
  } catch (error) {
    console.error('Error updating follow-up response:', error)
    throw error
  }
}

export async function getIncidentResolutionStats(schoolId, startDate, endDate) {
  try {
    const q = query(
      collection(db, 'incidentReports'),
      where('schoolId', '==', schoolId),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate)
    )
    const querySnapshot = await getDocs(q)
    const reports = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))

    const stats = {
      totalIncidents: reports.length,
      resolvedIncidents: reports.filter((r) => r.status === 'resolved').length,
      spokeToAdult: reports.filter((r) => r.spokeToAdult === true).length,
      averageResolutionTime: 0,
      followUpSuccessRate: 0
    }

    // Calculate average resolution time
    const resolvedReports = reports.filter(
      (r) => r.status === 'resolved' && r.resolutionDate
    )
    if (resolvedReports.length > 0) {
      const totalTime = resolvedReports.reduce((acc, report) => {
        const created = report.createdAt.toDate()
        const resolved = report.resolutionDate.toDate()
        return acc + (resolved - created)
      }, 0)
      stats.averageResolutionTime = totalTime / resolvedReports.length
    }

    // Calculate follow-up success rate
    const reportsWithFollowUp = reports.filter((r) => r.followUpAttempts > 0)
    if (reportsWithFollowUp.length > 0) {
      stats.followUpSuccessRate =
        (stats.spokeToAdult / reportsWithFollowUp.length) * 100
    }

    return stats
  } catch (error) {
    console.error('Error getting incident resolution stats:', error)
    throw error
  }
}
