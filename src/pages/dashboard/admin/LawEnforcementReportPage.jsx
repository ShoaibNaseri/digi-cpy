import React from 'react'
import LawEnforcementReport from '@/components/dashboard/admin/law-enforcement-report/LawEnforcementReport'
import { LawIncidentProvider } from '@/context/LawIncidentContext'

const LawEnforcementReportPage = () => {
  return (
    <LawIncidentProvider>
      <LawEnforcementReport />
    </LawIncidentProvider>
  )
}

export default LawEnforcementReportPage
