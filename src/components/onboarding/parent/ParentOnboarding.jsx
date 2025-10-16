import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import './ParentOnboarding.css'
import ParentAccountSetup from './ParentAccountStup'
import ChildAccountSetup from './ChildAccountSetup'

const ParentOnboarding = () => {
  const { currentUser } = useAuth()
  const [step, setStep] = useState(1)
  const isOnboardingCompleted = currentUser.isOnboarded

  if (isOnboardingCompleted) {
    return <Navigate to='/dashboard/parent' />
  }
  console.log('currentUser', currentUser)
  useEffect(() => {
    if (currentUser?.firstName && currentUser?.lastName) {
      setStep(2)
    }
  }, [currentUser])
  const handleNextStep = () => {
    if (step === 1) {
      setStep(step + 1)
    } else {
      return <Navigate to='/dashboard/parent' />
    }
  }

  const handlePreviousStep = () => {
    setStep(step - 1)
  }
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ParentAccountSetup
            handleNextStep={handleNextStep}
            currentStep={step}
          />
        )
      case 2:
        return (
          <ChildAccountSetup
            handleNextStep={handleNextStep}
            currentStep={step}
          />
        )
      default:
        return <Navigate to='/dashboard/parent' />
    }
  }
  return <div className='parent-onboarding'>{renderStep()}</div>
}

export default ParentOnboarding
