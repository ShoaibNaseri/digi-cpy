// import correctVoiceOver from '@/assets/game/missions/missoin_3/narrations/Astra_1895.mp3'
// import incorrectVoiceOver from '@/assets/game/missions/missoin_3/narrations/Astra_1896.mp3'
import { useState, useEffect, useRef } from 'react'
import familyRoomBg from '@/assets/game/bg_imgs/cabin_family_room.webp'
import './WhatYouSee.css'

const WhatYouSee = ({ onComplete }) => {
  const correctVoiceOver_src =
    '/assets/game/missions/mission_3/narrations/Astra_1896.mp3'
  const incorrectVoiceOver_src =
    '/assets/game/missions/mission_3/narrations/Astra_1895.mp3'

  const [isCorrect, setIsCorrect] = useState(false)
  const [isCorrectVoiceOver, setIsCorrectVoiceOver] = useState(false)
  const [isIncorrectVoiceOver, setIsIncorrectVoiceOver] = useState(false)
  const [isCorrectVoiceOverPlaying, setIsCorrectVoiceOverPlaying] =
    useState(false)
  const [assetsLoaded, setAssetsLoaded] = useState(false)

  const correctAudioRef = useRef(null)
  const incorrectAudioRef = useRef(null)
  const containerRef = useRef(null)

  // Load assets on component mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        // Create audio objects
        const correctAudio = new Audio(correctVoiceOver_src)
        const incorrectAudio = new Audio(incorrectVoiceOver_src)

        // Store references immediately
        correctAudioRef.current = correctAudio
        incorrectAudioRef.current = incorrectAudio

        // Set loaded state after a short delay to allow audio to initialize
        setTimeout(() => {
          setAssetsLoaded(true)
        }, 1000)
      } catch (error) {
        // Continue even if audio fails to load
        setAssetsLoaded(true)
      }
    }

    loadAssets()
  }, [])

  const playCorrectVoiceOver = () => {
    if (correctAudioRef.current && assetsLoaded) {
      correctAudioRef.current.currentTime = 0
      correctAudioRef.current.play()
      setIsCorrectVoiceOver(true)
      setIsCorrectVoiceOverPlaying(true)

      correctAudioRef.current.addEventListener(
        'ended',
        () => {
          setIsCorrectVoiceOverPlaying(false)
          // Call onComplete after correct voice over finishes
          if (onComplete) {
            onComplete()
          }
        },
        { once: true }
      )
    }
  }

  const playIncorrectVoiceOver = () => {
    if (incorrectAudioRef.current && assetsLoaded) {
      incorrectAudioRef.current.currentTime = 0
      incorrectAudioRef.current.play()
      setIsIncorrectVoiceOver(true)

      incorrectAudioRef.current.addEventListener(
        'ended',
        () => {
          setIsIncorrectVoiceOver(false)
        },
        { once: true }
      )
    }
  }

  const handleWebcamClick = (e) => {
    e.stopPropagation()
    if (assetsLoaded && !isCorrectVoiceOverPlaying) {
      playCorrectVoiceOver()
      setIsCorrect(true)
    }
  }

  const handleContainerClick = (e) => {
    // Check if click is not on the webcam hotspot
    const webcamElement = e.target.closest('.webcam')
    if (!webcamElement && assetsLoaded && !isCorrectVoiceOverPlaying) {
      playIncorrectVoiceOver()
      setIsCorrect(false)
    }
  }

  if (!assetsLoaded) {
    return <div className=''></div>
  }

  return (
    <div
      className='what-you-see-container'
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <img
        className='what-you-see-content'
        src={familyRoomBg}
        alt='family room'
      />
      <div className='hotspot webcam' onClick={handleWebcamClick}></div>
    </div>
  )
}

export default WhatYouSee
