import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './SpeakerVolume.css'
import cabinLinvingRoomBg from '@/assets/game/bg_imgs/cabin_living_room.webp'

const SpeakerVolume = ({ onComplete }) => {
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const [volume, setVolume] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const volumeBarRef = useRef(null)

  const handleSpeakerClick = () => {
    setShowVolumeControl(true)
  }

  const handleVolumeChange = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume))
    setVolume(clampedVolume)

    // Check if volume reaches 100%
    if (clampedVolume === 100) {
      setTimeout(() => {
        setShowVolumeControl(false)
        onComplete()
      }, 100)
    }
  }

  const handleKeyDown = (e) => {
    if (!showVolumeControl) return

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleVolumeChange(volume + 5)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleVolumeChange(volume - 5)
    } else if (e.key === 'Escape') {
      setShowVolumeControl(false)
    }
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    // Calculate volume immediately on mouse down
    const rect = volumeBarRef.current?.getBoundingClientRect()
    if (rect) {
      const clickY = e.clientY - rect.top
      const barHeight = rect.height
      const newVolume = Math.max(
        0,
        Math.min(100, 100 - (clickY / barHeight) * 100)
      )
      handleVolumeChange(newVolume)
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const rect = volumeBarRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickY = e.clientY - rect.top
    const barHeight = rect.height
    const newVolume = Math.max(
      0,
      Math.min(100, 100 - (clickY / barHeight) * 100)
    )

    handleVolumeChange(newVolume)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const closeVolumeControl = () => {
    setShowVolumeControl(false)
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [showVolumeControl, volume])

  const getVolumeBarColor = (volume) => {
    if (volume < 30) return '#ff4444'
    if (volume < 70) return '#ffaa00'
    return '#44ff44'
  }

  return (
    <div className='speaker-volume-container'>
      <img
        src={cabinLinvingRoomBg}
        alt='cabin living room'
        className='speaker-volume-background'
      />

      {/* Speaker 1 */}
      <div
        className={`hotspot speaker-1 ${showVolumeControl ? 'active' : ''}`}
        onClick={handleSpeakerClick}
      >
        <div className='speaker-icon'>🔊</div>
      </div>

      {/* Speaker 2 */}
      <div
        className={`hotspot speaker-2 ${showVolumeControl ? 'active' : ''}`}
        onClick={handleSpeakerClick}
      >
        <div className='speaker-icon'>🔊</div>
      </div>

      {/* Single Volume Control Modal */}
      <AnimatePresence>
        {showVolumeControl && (
          <>
            {/* Backdrop */}
            <motion.div
              className='volume-backdrop'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeVolumeControl}
            />

            {/* Volume Control Modal */}
            <motion.div
              className='volume-control-modal'
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className='modal-header'>
                <h3>Adjust Speaker Volume</h3>
                <button className='close-button' onClick={closeVolumeControl}>
                  ×
                </button>
              </div>

              <div className='volume-content'>
                <div className='volume-label'>
                  Set volume to 100% to continue
                </div>
                <div
                  className='volume-bar-container'
                  ref={volumeBarRef}
                  onMouseDown={handleMouseDown}
                  style={{ cursor: isDragging ? 'ns-resize' : 'pointer' }}
                >
                  <div
                    className='volume-bar-fill'
                    style={{
                      height: `${volume}%`,
                      backgroundColor: '#0066ff'
                    }}
                  />
                  <div className='volume-percentage'>{Math.round(volume)}%</div>
                  <div className='volume-speaker-icon'>🔊</div>
                </div>
                <div className='volume-instructions'>
                  Use ↑↓ arrows or drag to adjust • Press ESC to close
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
    </div>
  )
}

export default SpeakerVolume
