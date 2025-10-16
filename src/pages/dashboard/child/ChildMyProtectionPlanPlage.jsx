import MyProtectionPlan from '@/components/dashboard/my-protection-plan/MyProtectionPlan'
import { MyProtectionPlanProvider } from '@/context/MyProtectionPlanContext'

const ChildMyProtectionPlanPlage = () => {
  return (
    <MyProtectionPlanProvider>
      <MyProtectionPlan />
    </MyProtectionPlanProvider>
  )
}

export default ChildMyProtectionPlanPlage
