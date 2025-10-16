import { useState, useEffect, useRef } from 'react'
import './ThumbScan.css'
import faceScanImg from '@/assets/game/action_imgs/face_scan.png'
import thumbScanImg from '@/assets/game/action_imgs/thumb_scan.png'
import scaningSoun1 from '@/assets/game/game_sounds/eye_scan.wav'
import scaningSoun2 from '@/assets/game/game_sounds/face_scan.wav'

const ThumbScan = ({ onComplete }) => {
  const [fingerprintProgress, setFingerprintProgress] = useState(0)
  const [facialProgress, setFacialProgress] = useState(0)
  const [isScanning, setIsScanning] = useState(true)
  const [fingerprintComplete, setFingerprintComplete] = useState(false)
  const [facialComplete, setFacialComplete] = useState(false)
  const [showNextButton, setShowNextButton] = useState(false)

  const audioRef1 = useRef(null)
  const audioRef2 = useRef(null)

  useEffect(() => {
    // Initialize audio elements
    audioRef1.current = new Audio(scaningSoun1)
    audioRef2.current = new Audio(scaningSoun2)

    // Set audio properties
    audioRef1.current.volume = 0.3
    audioRef2.current.volume = 0.3
    audioRef1.current.loop = false
    audioRef2.current.loop = false
  }, [])

  useEffect(() => {
    if (!isScanning) return

    // Start fingerprint scanning
    const fingerprintInterval = setInterval(() => {
      setFingerprintProgress((prev) => {
        if (prev >= 100) {
          setFingerprintComplete(true)
          return 100
        }
        const increment = Math.random() * 15 + 5
        const newProgress = prev + increment
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 500)

    // Start facial scanning
    const facialInterval = setInterval(() => {
      setFacialProgress((prev) => {
        if (prev >= 100) {
          setFacialComplete(true)
          return 100
        }
        const increment = Math.random() * 12 + 3
        const newProgress = prev + increment
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 600)

    return () => {
      clearInterval(fingerprintInterval)
      clearInterval(facialInterval)
    }
  }, [isScanning])

  // Simple audio management - play once when scanning starts
  useEffect(() => {
    if (isScanning && !fingerprintComplete && !facialComplete) {
      // Play sounds once when scanning starts
      if (audioRef1.current) {
        audioRef1.current
          .play()
          .catch((e) => console.log('Audio play failed:', e))
      }
      if (audioRef2.current) {
        audioRef2.current
          .play()
          .catch((e) => console.log('Audio play failed:', e))
      }
    } else {
      // Stop all sounds when scanning stops or completes
      if (audioRef1.current) {
        audioRef1.current.pause()
        audioRef1.current.currentTime = 0
      }
      if (audioRef2.current) {
        audioRef2.current.pause()
        audioRef2.current.currentTime = 0
      }
    }
  }, [isScanning, fingerprintComplete, facialComplete])

  // Check if both scans are complete to show Next button
  useEffect(() => {
    if (fingerprintComplete && facialComplete) {
      setShowNextButton(true)
    }
  }, [fingerprintComplete, facialComplete])

  const handleNext = () => {
    onComplete()
  }

  return (
    <div className='thumb-scan-container'>
      {/* Scanners Row */}
      <div className='scanners-row'>
        {/* Fingerprint Scanner Section */}
        <div
          className={`scanner-section ${fingerprintComplete ? 'success' : ''}`}
        >
          <div className='fingerprint-scanner'>
            <img
              src={thumbScanImg}
              alt='thumb-scan'
              className='scanner-image'
            />
            {isScanning && <div className='scan-overlay'></div>}
            <div className='percentage-counter'>
              {fingerprintComplete
                ? '100%'
                : `${Math.round(fingerprintProgress)}%`}
            </div>
          </div>
          <div className='progress-container'>
            <div
              className='progress-bar'
              style={{ width: `${fingerprintProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Facial Scanner Section */}
        <div className={`scanner-section ${facialComplete ? 'success' : ''}`}>
          <div className='facial-scanner'>
            <img src={faceScanImg} alt='face-scan' className='scanner-image' />
            {isScanning && <div className='scan-overlay'></div>}
            <div className='percentage-counter'>
              {facialComplete ? '100%' : `${Math.round(facialProgress)}%`}
            </div>
          </div>
          <div className='progress-container'>
            <div
              className='progress-bar facial'
              style={{ width: `${facialProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      {showNextButton && (
        <button className='thumb-scan-next-button' onClick={handleNext}>
          Next
        </button>
      )}
    </div>
  )
}

export default ThumbScan
