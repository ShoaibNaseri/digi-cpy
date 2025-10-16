import { useState, useEffect, useRef } from 'react'
import './FootprintVideo.css'

const FootprintVideo = ({ onComplete, videoId, duration: propDuration }) => {
  const [showNextButton, setShowNextButton] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const videoRef = useRef(null)

  // Use prop duration or fallback to default
  const duration = propDuration || 3000

  // For now, we'll keep the YouTube option but add a self-hosted option
  // You'll need to replace this with your actual video file path
  const videoSrc = `/assets/game/videos/1.mp4` // Add your video file here

  // Fallback to YouTube if self-hosted video not available
  const useYouTube = true // Set to false when you have the self-hosted video

  useEffect(() => {
    if (!useYouTube && videoRef.current) {
      // Auto-play for self-hosted video
      videoRef.current.play().catch(console.error)
      setIsPlaying(true)

      // Disable picture-in-picture programmatically
      if (videoRef.current.disablePictureInPicture !== undefined) {
        videoRef.current.disablePictureInPicture = true
      }

      // Prevent picture-in-picture events
      const preventPiP = (e) => {
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      videoRef.current.addEventListener('enterpictureinpicture', preventPiP)
      videoRef.current.addEventListener('leavepictureinpicture', preventPiP)
    }

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (videoRef.current && !useYouTube) {
        if (document.hidden) {
          // Tab is hidden - pause video
          videoRef.current.pause()
        } else {
          // Tab is visible - resume video if it was playing
          if (isPlaying) {
            videoRef.current.play().catch(console.error)
          }
        }
      }
    }

    // Add event listener for tab visibility
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Show Next button after video duration
    const timer = setTimeout(() => {
      setShowNextButton(true)
    }, duration)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [duration, useYouTube, isPlaying])

  const handleVideoPlay = () => {
    setIsPlaying(true)
    setShowControls(true)
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setShowNextButton(true)
  }

  const handleNext = () => {
    if (onComplete) {
      onComplete()
    }
  }

  if (useYouTube) {
    // YouTube fallback with minimal branding
    const embedUrl = `https://www.youtube.com/embed/${
      videoId || 'TI1zZVNLvkk'
    }?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&cc_load_policy=0&hl=en&color=white&theme=dark`

    return (
      <div className='footprint-video-container'>
        <div className='footprint-video-content'>
          <div className='video-wrapper'>
            <iframe
              width='1120'
              height='630'
              src={embedUrl}
              title='Footprint Video'
              frameBorder='0'
              allow='accelerometer; encrypted-media; gyroscope;'
              allowFullScreen
            />
          </div>

          {showNextButton && (
            <div className='next-button-container'>
              <button className='next-button' onClick={handleNext}>
                <span className='btn-icon'>✓</span> NEXT
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='footprint-video-container'>
      <div className='footprint-video-content'>
        <div className='video-wrapper'>
          <video
            ref={videoRef}
            className='custom-video-player'
            width='1120'
            height='630'
            onPlay={handleVideoPlay}
            onEnded={handleVideoEnd}
            onContextMenu={(e) => e.preventDefault()}
            playsInline
            preload='metadata'
            disablePictureInPicture
            controlsList='nodownload nofullscreen noremoteplayback'
          >
            <source src={videoSrc} type='video/mp4' />
            Your browser does not support the video tag.
          </video>

          {!isPlaying && (
            <div className='video-overlay'>
              <button
                className='play-button'
                onClick={() => videoRef.current?.play()}
              >
                <span className='play-icon'>▶</span>
              </button>
            </div>
          )}
        </div>

        {showNextButton && (
          <div className='next-button-container'>
            <button className='next-button' onClick={handleNext}>
              <span className='btn-icon'>✓</span> NEXT
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FootprintVideo
