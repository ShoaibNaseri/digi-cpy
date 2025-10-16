import StepIndicator from './StepIndicator'
import { useSchoolPortal } from '@/context/SchoolPortalContext'
import SchoolDetails from './school-details/SchoolDetails'
import UserManagement from './user-management/UserManagement'
import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import './SchoolPortalSetup.css'

const SchoolPortalSetup = () => {
  const { currentStep, setCurrentStep } = useSchoolPortal()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const step = searchParams.get('step')
    if (step !== null) {
      setCurrentStep(parseInt(step))
    }
  }, [searchParams, setCurrentStep])

  const renderView = () => {
    switch (currentStep) {
      case 0:
        return <SchoolDetails />
      case 1:
        return <UserManagement />
      default:
        return null
    }
  }

  return (
    <div className="school-portal-setup">
      <div className='portal__header'>
        <StepIndicator
          text='School Details'
          isActive={currentStep === 0}
          isCompleted={currentStep > 0}
          stepNumber={1}
        />
        <StepIndicator
          text='User Management'
          isActive={currentStep === 1}
          isCompleted={currentStep > 1}
          stepNumber={2}
        />
      </div>
      <div className="portal__content">
        {renderView()}
      </div>
    </div>
  )
}

export default SchoolPortalSetup
