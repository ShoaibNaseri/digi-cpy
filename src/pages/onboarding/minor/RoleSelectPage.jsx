import RoleSelect from '@/components/onboarding/minor/RoleSelect'

const RoleSelectPage = () => {
  const handleSelectPlan = (planType) => {
    console.log('Selected plan:', planType)
  }

  return <RoleSelect onSelectPlan={handleSelectPlan} />
}

export default RoleSelectPage
