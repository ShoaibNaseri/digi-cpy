import './StepIndicator.css'
import { HiBuildingOffice2 } from 'react-icons/hi2'
import { HiUser } from 'react-icons/hi'
import { HiCheck } from 'react-icons/hi2'

const StepIndicator = ({ text, isActive, isCompleted, stepNumber }) => {
  const getStepIcon = () => {
    if (isCompleted) {
      return <HiCheck size={24} />
    } else if (stepNumber === 1) {
      return <HiBuildingOffice2 size={24} />
    } else if (stepNumber === 2) {
      return <HiUser size={24} />
    }
    return null
  }

  return (
    <div className={`step-indicator ${isActive ? 'step-indicator--active' : ''} ${isCompleted ? 'step-indicator--completed' : ''}`}>
      <div className="step-indicator__icon">
        {getStepIcon()}
      </div>
      <div className="step-indicator__text">
        <span className="step-indicator__step">Step {stepNumber}</span>
        <span className="step-indicator__title">{text}</span>
      </div>
    </div>
  )
}

export default StepIndicator
