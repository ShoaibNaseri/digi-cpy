import ProtectionPlan from '@/components/dashboard/admin/protection-plan/ProtectionPlan'
import { ProtectionProvider } from '@/context/ProtectionContext'

const ProtectionPlanPage = () => {
  return (
    <ProtectionProvider>
      <ProtectionPlan />
    </ProtectionProvider>
  )
}

export default ProtectionPlanPage
