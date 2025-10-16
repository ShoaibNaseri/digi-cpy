import SchoolPortalSetup from '@/components/onboarding/school/school-portal-setup/SchoolPortalSetup'
import { SchoolPortalProvider } from '@/context/SchoolPortalContext'

const SchoolPortalSetupPage = () => {
  return (
    <SchoolPortalProvider>
      <SchoolPortalSetup />
    </SchoolPortalProvider>
  )
}

export default SchoolPortalSetupPage
