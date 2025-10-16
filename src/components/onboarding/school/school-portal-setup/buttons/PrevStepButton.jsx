import './PrevStepButton.css'
import { useSchoolPortal } from '@/context/SchoolPortalContext'
import { useSearchParams } from 'react-router-dom'
import { HiChevronLeft } from 'react-icons/hi2'

const PrevStepButton = ({ text, stepNum, isDisabled }) => {
  const { setCurrentStep } = useSchoolPortal()
  const [searchParams, setSearchParams] = useSearchParams()

  const handlePrevStep = () => {
    setCurrentStep(stepNum)
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('step', stepNum)
    setSearchParams(newSearchParams)
  }

  return (
    <button
      className='prev-step-button'
      onClick={handlePrevStep}
      disabled={isDisabled}
    >
      <HiChevronLeft className="prev-step-button__icon" size={20} />
      {text || 'Back'}
    </button>
  )
}

export default PrevStepButton
