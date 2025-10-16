import { useState, useEffect, useRef } from 'react'
import './ApplyUni.css'
import graduation_cap from '@/assets/game/missions/mission_2/action_imgs/apply_uni/grad_cap.png'
import resume from '@/assets/game/missions/mission_2/action_imgs/apply_uni/resume.png'
import { FaGraduationCap } from 'react-icons/fa6'
import { FaFileCircleCheck } from 'react-icons/fa6'

const ApplyUni = ({ narrationLocation, onComplete }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [animationPhase, setAnimationPhase] = useState('sphere') // sphere, graduation, resume
  const [showNextButton, setShowNextButton] = useState(false)
  const audioRef = useRef(null)

  const narration =
    narrationLocation ||
    'assets/game/missions/mission_2/narrations/Robotoro_1172.mp3'

  // Preload assets
  useEffect(() => {
    const preloadAssets = async () => {
      const assetPromises = [
        new Promise((resolve) => {
          const img2 = new Image()
          img2.onload = resolve
          img2.src = graduation_cap
        }),
        new Promise((resolve) => {
          const img3 = new Image()
          img3.onload = resolve
          img3.src = resume
        }),
        new Promise((resolve) => {
          const audio = new Audio(`/${narration}`)
          audio.oncanplaythrough = resolve
          audio.onerror = resolve // Continue even if audio fails
          audioRef.current = audio
        })
      ]

      await Promise.all(assetPromises)
      setIsLoading(false)
    }

    preloadAssets()
  }, [narration])

  // Start animation sequence once assets are loaded
  useEffect(() => {
    if (!isLoading) {
      // Play narration
      if (audioRef.current) {
        audioRef.current.play().catch(console.error)
      }

      // Start animation sequence
      const timeline = [
        { phase: 'sphere', duration: 0 }, // Show immediately
        { phase: 'graduation', duration: 1000 }, // After 1 second
        { phase: 'resume', duration: 3000 } // After 3 seconds and continues
      ]

      const timeouts = timeline.map(({ phase, duration }) =>
        setTimeout(() => {
          setAnimationPhase(phase)
        }, duration)
      )

      // Show next button after resume phase starts
      const nextButtonTimeout = setTimeout(() => {
        setShowNextButton(true)
      }, 4000) // Show button 1 second after resume starts

      return () => {
        timeouts.forEach(clearTimeout)
        clearTimeout(nextButtonTimeout)
      }
    }
  }, [isLoading])

  const handleNext = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    onComplete?.()
  }

  if (isLoading) {
    return (
      <div className='apply-uni-container'>
        <div className='loading-spinner'>Loading...</div>
      </div>
    )
  }

  return (
    <div className='apply-uni-container'>
      <div className='apply-uni-content'>
        <div className='sphere-container active'>
          <div
            className={`earth ${
              animationPhase === 'graduation' || animationPhase === 'resume'
                ? 'rotating'
                : ''
            }`}
          >
            <div className='earth-surface'></div>
            <div className='earth-glow'></div>
          </div>

          <div
            className={`graduation-cap-container ${
              animationPhase === 'graduation' ? 'animate' : ''
            }`}
          >
            {/* <FaGraduationCap className='graduation-cap' /> */}
            <img
              src={graduation_cap}
              alt='graduation cap'
              className='graduation-cap'
            />
          </div>

          <div
            className={`resume-container ${
              animationPhase === 'resume' ? 'animate' : ''
            }`}
          >
            <img src={resume} alt='resume' className='resume' />
            {/* <FaFileCircleCheck className='resume' /> */}
          </div>
        </div>

        {showNextButton && (
          <button className='apply-next-button' onClick={handleNext}>
            Next
          </button>
        )}
      </div>
    </div>
  )
}

export default ApplyUni
