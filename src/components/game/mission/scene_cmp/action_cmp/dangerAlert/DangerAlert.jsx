import { useEffect, useState } from 'react'
import './DangerAlert.css'

const DangerAlert = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Optional: Auto-hide after certain duration
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, 3000) // Hide after 10 seconds

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className='danger-alert-overlay'>
      <div className='danger-alert-container'>
        <div className='danger-alert'>
          <div className='danger-icon'>
            <svg
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M12 9V13M12 17H12.01M12 3L2 20H22L12 3Z'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>
          <h1 className='danger-text'>DANGER</h1>
          <div className='danger-pulse-ring'></div>
          <div className='danger-pulse-ring delay-1'></div>
          <div className='danger-pulse-ring delay-2'></div>
        </div>
      </div>
    </div>
  )
}

export default DangerAlert
