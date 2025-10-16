import { db } from '@/firebase/config'
import { collection, getDocs, getDoc, doc } from 'firebase/firestore'

export const getLawEnforcementReports = async () => {
  const reports = await getDocs(collection(db, 'lawEnforcementReports'))
  return reports.docs.map((doc) => doc.data())
}

export const getLawEnforcementReportById = async (id) => {
  const report = await getDoc(doc(db, 'lawEnforcementReports', id))
  return report.data()
}
