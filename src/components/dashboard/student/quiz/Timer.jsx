import { useState, useEffect } from 'react'
import './Timer.css'

const Timer = ({ duration, onTimeUp, initialTime, onTimeUpdate, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime || duration * 60)

  useEffect(() => {
    let timer
    if (isActive) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            onTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [onTimeUp, isActive])

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(timeLeft)
    }
  }, [timeLeft, onTimeUpdate])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className='timer'>
      <div className='timer__label'>Time Remaining:</div>
      <div className='timer__display'>{formatTime(timeLeft)}</div>
    </div>
  )
}

export default Timer
