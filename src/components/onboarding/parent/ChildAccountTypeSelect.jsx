import './ChildAccountTypeSelect.css'
import { FaChild } from 'react-icons/fa'
import { FaChildren } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ParentPlanOptionsPage from '@/pages/plan-options/ParentPlanOptionsPage'
import ParentAccountSetup from './ParentAccountStup'
import Loader from '@/components/common/Loader/Loader'
import { useAuth } from '@/context/AuthContext'
import PagePreloader from '@/components/common/preloaders/PagePreloader'
const ChildAccountTypeSelect = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [childType, setChildType] = useState(0)
  const { currentUser } = useAuth()

  useEffect(() => {
    if (currentUser.firstName && currentUser.lastName) {
      setStep(2)
    }
  }, [])
  const handleChildTypeSelect = (type) => {
    setIsLoading(true)
    setChildType(type)
    setStep(3)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }
  const handleNextStep = () => {
    setStep(step + 1)
  }
  if (isLoading) {
    return (
      <div className='account-type-select-container'>
        <PagePreloader color='white' textData='' />
      </div>
    )
  }
  if (step === 1) {
    return (
      <ParentAccountSetup handleNextStep={handleNextStep} currentStep={step} />
    )
  }
  if (step === 2) {
    return (
      <div className='account-type-select-container'>
        <div className='account-type-select-content'>
          <div className='account-type-select-header'>
            <h2 className='account-type-select-title'>
              Who Are You Setting Up Digipalz For?
            </h2>
            <p className='account-type-select-description'>
              Choose the plan that fits your family best.
            </p>
          </div>

          <div className='account-type-select-options-container'>
            <div
              className='account-type-select-option-card'
              onClick={() => handleChildTypeSelect('single')}
            >
              <div className='account-type-select-icon-container'>
                <FaChild className='child-icon' />
              </div>
              <h3>One Child</h3>
              <p className='account-type-select-option-description'>
                Perfect for one child’s personalized learning journey.
              </p>
            </div>

            <div
              className='account-type-select-option-card'
              onClick={() => handleChildTypeSelect('multiple')}
            >
              <div className='account-type-select-icon-container'>
                <FaChildren className='children-icon' />
              </div>
              <h3>Family Plan</h3>
              <p className='account-type-select-option-description'>
                Register and manage up to 3 children under one account.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (step === 3) {
    return <ParentPlanOptionsPage childType={childType} />
  }
}

export default ChildAccountTypeSelect
