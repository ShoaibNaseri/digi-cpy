import { useEffect, useState } from 'react'
import './PlayNarration.css'

const PlayNarration = ({ onComplete, data }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    console.log('PlayNarration data:', data)
    
    if (!data?.narration) {
      console.log('No narration data provided, completing immediately')
      onComplete()
      return
    }

    const audio = new Audio(`/assets/${data.narration}`)
    let isMounted = true

    // Set up event handlers
    const handleCanPlayThrough = () => {
      if (!isMounted) return
      console.log('Audio loaded successfully, starting playback')
      setIsLoading(false)
      setIsPlaying(true)
      
      audio.play().catch((playError) => {
        if (!isMounted) return
        console.error('Error playing audio:', playError)
        setError('Failed to play audio')
        setIsLoading(false)
        setIsPlaying(false)
      })
    }

    const handleEnded = () => {
      if (!isMounted) return
      console.log('Narration ended, completing')
      setIsPlaying(false)
      onComplete()
    }

    const handleError = (e) => {
      if (!isMounted) return
      console.error('Audio loading error:', e)
      setError('Failed to load audio')
      setIsLoading(false)
      setIsPlaying(false)
    }

    // Add event listeners
    audio.addEventListener('canplaythrough', handleCanPlayThrough)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    // Start loading the audio
    audio.load()

    // Cleanup function
    return () => {
      isMounted = false
      audio.pause()
      audio.removeEventListener('canplaythrough', handleCanPlayThrough)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [data, onComplete])

  return (
    <div className='play-narration'>
      <div className='narration-content'>
        {isLoading && (
          <div className='narration-loading'>
            <div className='loading-spinner'></div>
            <p>Loading narration...</p>
          </div>
        )}
        
        {error && (
          <div className='narration-error'>
            <p>{error}</p>
          </div>
        )}
        
        {isPlaying && !error && (
          <div className='narration-playing'>
            <div className='playing-indicator'>
              <div className='sound-wave'>
                <div className='bar'></div>
                <div className='bar'></div>
                <div className='bar'></div>
                <div className='bar'></div>
                <div className='bar'></div>
              </div>
            </div>
            <p>Playing narration...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayNarration
