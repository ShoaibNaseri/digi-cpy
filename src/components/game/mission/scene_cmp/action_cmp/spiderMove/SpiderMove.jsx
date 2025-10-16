import { useEffect, useState } from 'react'
import './SpiderMove.css'

const SpiderMove = ({ onComplete, duration = 8000 }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    // Start the spider animation immediately
    setIsVisible(true)

    // Complete the animation after the specified duration
    const completeTimer = setTimeout(() => {
      setAnimationComplete(true)
      if (onComplete) {
        // onComplete()
      }
    }, duration)

    return () => {
      clearTimeout(completeTimer)
    }
  }, [duration, onComplete])

  if (animationComplete) {
    return null
  }

  return (
    <div className='spider-move-container'>
      <div className={`spider ${isVisible ? 'spider-visible' : ''}`}>
        <img
          src='/src/assets/game/action_imgs/spider.gif'
          alt='Spider'
          className='spider-image'
        />
        <div className='spider-shadow'></div>
      </div>
    </div>
  )
}

export default SpiderMove
