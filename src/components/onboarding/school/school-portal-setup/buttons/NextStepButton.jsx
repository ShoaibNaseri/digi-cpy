import './NextStepButton.css'
import { useSchoolPortal } from '@/context/SchoolPortalContext'
import { useSearchParams } from 'react-router-dom'

const NextStepButton = ({ text, stepNum, isDisabled, onClick, isLoading }) => {
  const { setCurrentStep } = useSchoolPortal()
  const [searchParams, setSearchParams] = useSearchParams()

  const handleNextStep = async () => {
    if (onClick) {
      const result = await onClick()
      if (result === false) {
        return
      }
    }

    setCurrentStep(stepNum)
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('step', stepNum)
    setSearchParams(newSearchParams)
  }

  return (
    <button
      className='next-step-button'
      onClick={handleNextStep}
      disabled={isDisabled}
    >
      {isLoading ? 'Saving...' : (text || 'Save & Continue')}
    </button>
  )
}

export default NextStepButton
