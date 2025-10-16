import MyProtectionPlan from '@/components/dashboard/my-protection-plan/MyProtectionPlan'
import { MyProtectionPlanProvider } from '@/context/MyProtectionPlanContext'

const StudentMyProtectionPlan = () => {
  return (
    <MyProtectionPlanProvider>
      <MyProtectionPlan />
    </MyProtectionPlanProvider>
  )
}

export default StudentMyProtectionPlan
