import { useEffect, useState, useRef } from 'react'
import img1 from '@/assets/game/action_imgs/pap1.png'
import img2 from '@/assets/game/action_imgs/pap2.png'
import img3 from '@/assets/game/action_imgs/pap3.png'

import catchImageSound from '@/assets/game/game_sounds/camera_shot.wav'
import ActionLoadingIndicator from '@/components/common/ActionLoadingIndicator'
import './Paparazzi.css'

const Paparazzi = ({ onComplete }) => {
  const [showImages, setShowImages] = useState(false)
  const [flashActive, setFlashActive] = useState(false)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    // Preload all assets
    const preloadAssets = async () => {
      try {
        // Preload images
        const imagePromises = [
          new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = resolve
            img.onerror = reject
            img.src = img1
          }),
          new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = resolve
            img.onerror = reject
            img.src = img2
          }),
          new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = resolve
            img.onerror = reject
            img.src = img3
          })
        ]

        // Preload audio
        const audioPromise = new Promise((resolve, reject) => {
          const audio = new Audio()
          audio.oncanplaythrough = resolve
          audio.onerror = reject
          audio.src = catchImageSound
        })

        // Wait for all assets to load
        await Promise.all([...imagePromises, audioPromise])
        setAssetsLoaded(true)
      } catch (error) {
        console.error('Failed to preload assets:', error)
        // Fallback: show component even if some assets fail to load
        setAssetsLoaded(true)
      }
    }

    preloadAssets()
  }, [])

  useEffect(() => {
    if (!assetsLoaded) return

    // Trigger animation after assets are loaded
    const animationTimer = setTimeout(() => {
      setShowImages(true)
    }, 100)

    // Start flash sequence after images are in position
    const soundTimer = setTimeout(() => {
      triggerFlashSequence()
    }, 1100) // Wait for slide-up animation to complete

    return () => {
      clearTimeout(animationTimer)
      clearTimeout(soundTimer)
    }
  }, [assetsLoaded])

  const playFlashSound = () => {
    // Create a new audio instance for each flash to allow overlapping sounds
    const audio = new Audio(catchImageSound)
    audio.volume = 0.7
    audio.play().catch((err) => console.log('Audio play failed:', err))
  }

  const triggerFlashSequence = () => {
    // Multiple flashes over 4 seconds with varying intervals for realism
    const flashIntervals = [
      0, 300, 600, 1000, 1400, 1900, 2400, 2900, 3400, 3800
    ]

    flashIntervals.forEach((interval) => {
      setTimeout(() => {
        setFlashActive(true)
        playFlashSound()
        // Quick flash - on for 50ms then off
        setTimeout(() => setFlashActive(false), 50)
      }, interval)
    })

    // Call onComplete after the last flash completes
    const lastFlashTime = Math.max(...flashIntervals) + 100 // 100ms for the flash duration
    setTimeout(() => {
      console.log('onComplete', onComplete)
      if (onComplete && typeof onComplete === 'function') {
        console.log('onComplete')
        onComplete()
      }
    }, lastFlashTime)
  }

  // Show loading state while assets are being loaded
  if (!assetsLoaded) {
    return (
      <div className='paparazzi-container'>
        <ActionLoadingIndicator message='Loading paparazzi...' />
      </div>
    )
  }

  return (
    <div className='paparazzi-container'>
      {/* Flash overlay */}
      <div className={`camera-flash ${flashActive ? 'active' : ''}`} />

      {/* Paparazzi images */}
      <div className='paparazzi-images'>
        <img
          src={img1}
          alt='Paparazzi 1'
          className={`paparazzi-img paparazzi-left ${
            showImages ? 'slide-up' : ''
          }`}
        />
        <img
          src={img2}
          alt='Paparazzi 2'
          className={`paparazzi-img paparazzi-center ${
            showImages ? 'slide-up' : ''
          }`}
        />
        <img
          src={img3}
          alt='Paparazzi 3'
          className={`paparazzi-img paparazzi-right ${
            showImages ? 'slide-up' : ''
          }`}
        />
      </div>
    </div>
  )
}

export default Paparazzi
