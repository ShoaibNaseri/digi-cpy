import './cyberdefinition.css'
import img1 from '@/assets/game/missions/mission_one/action_imgs/cyber_definition/1.png'
import img2 from '@/assets/game/missions/mission_one/action_imgs/cyber_definition/2.png'
import img3 from '@/assets/game/missions/mission_one/action_imgs/cyber_definition/3.png'
import img4 from '@/assets/game/missions/mission_one/action_imgs/cyber_definition/4.png'
import img5 from '@/assets/game/missions/mission_one/action_imgs/cyber_definition/5.png'
import img6 from '@/assets/game/missions/mission_one/action_imgs/cyber_definition/6.png'
import pageTurnSound from '@/assets/game/game_sounds/next.mp3'
import bgimg from '@/assets/game/missions/mission_one/action_imgs/cyber_definition/librarySceneBg.webp'
import { useState, useEffect, useRef } from 'react'
import { FaArrowRight } from 'react-icons/fa'
const images = [img1, img2, img3, img4, img5, img6]

// Voice-over files mapping (index 1-5 for images 2-6)
const voiceOvers = [
  null, // No voice-over for first image (book cover)
  '/assets/game/game_actions/cyber_definition/Narrator_946.mp3',
  '/assets/game/game_actions/cyber_definition/Narrator_947.mp3',
  '/assets/game/game_actions/cyber_definition/Narrator_948.mp3',
  '/assets/game/game_actions/cyber_definition/Narrator_949.mp3',
  '/assets/game/game_actions/cyber_definition/Narrator_950.mp3'
]

const CyberDefinition = ({ onComplete }) => {
  const [currentImage, setCurrentImage] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [bookOpened, setBookOpened] = useState(false)
  const [pageFlipping, setPageFlipping] = useState(false)
  const [bookOpening, setBookOpening] = useState(false)
  const [showNextButton, setShowNextButton] = useState(false)
  const [isVoiceOverPlaying, setIsVoiceOverPlaying] = useState(false)

  const audioRef = useRef(null)
  const pageTurnAudioRef = useRef(null)

  useEffect(() => {
    setIsVisible(true)
    // Initialize page turn audio
    pageTurnAudioRef.current = new Audio(pageTurnSound)
  }, [])

  // Play voice-over when image changes (starting from image 2)
  useEffect(() => {
    if (currentImage >= 1 && voiceOvers[currentImage]) {
      // Add 1 second delay to let image display completely before starting voice-over
      setTimeout(() => {
        playVoiceOver(voiceOvers[currentImage])
      }, 1000)
    }
  }, [currentImage])

  const playVoiceOver = (audioSrc) => {
    setIsVoiceOverPlaying(true)
    setShowNextButton(false)

    if (audioRef.current) {
      audioRef.current.pause()
    }

    audioRef.current = new Audio(audioSrc)

    audioRef.current.onended = () => {
      setIsVoiceOverPlaying(false)
      // Wait 3 seconds after voice-over ends, then show Next button
      setTimeout(() => {
        setShowNextButton(true)
      }, 3000)
    }

    audioRef.current.onerror = () => {
      setIsVoiceOverPlaying(false)
      // If audio fails to load, show button after 2 seconds
      setTimeout(() => {
        setShowNextButton(true)
      }, 2000)
    }

    audioRef.current.play()
  }

  const handleOpenBook = () => {
    if (!bookOpened && !bookOpening) {
      setBookOpening(true)

      // Start book opening animation
      setTimeout(() => {
        setBookOpened(true)
        setBookOpening(false)
        setCurrentImage(1)
      }, 1000)
    }
  }

  const handleNextPage = () => {
    if (isVoiceOverPlaying) return // Prevent clicking while voice-over is playing

    // Play page turn sound
    if (pageTurnAudioRef.current) {
      pageTurnAudioRef.current.currentTime = 0
      pageTurnAudioRef.current.play()
    }

    // Check if we're on the last image
    if (currentImage === images.length - 1) {
      console.log('Cyber definition complete')
      onComplete()
      return
    }

    // Continue with normal page turning if not on last image
    if (currentImage < images.length - 1) {
      setPageFlipping(true)
      setShowNextButton(false)

      // Change image at the middle of the flip animation for smoother transition
      setTimeout(() => {
        setCurrentImage((prevIndex) => prevIndex + 1)
      }, 150) // Half of the flip animation duration

      // End the flip animation
      setTimeout(() => {
        setPageFlipping(false)
      }, 300)
    }
  }

  const handlePageTurn = () => {
    // For book cover, use the old behavior
    if (currentImage === 0) {
      handleOpenBook()
      return
    }

    // For other pages, only allow next if button is shown
    if (showNextButton) {
      handleNextPage()
    }
  }

  const renderBookContent = () => {
    if (!bookOpened) {
      return (
        <img
          src={images[0]}
          alt='book cover'
          className={`book-cover ${bookOpening ? 'book-open' : ''}`}
          onClick={handleOpenBook}
        />
      )
    } else {
      return (
        <div className='page-container'>
          <img
            src={images[currentImage]}
            alt={`book page ${currentImage}`}
            className={`book-page ${pageFlipping ? 'page-flip' : ''} ${
              isVisible ? 'fade-in' : ''
            }`}
            onClick={handlePageTurn}
          />
          {showNextButton && (
            <button
              className='cyber-definition-next-button'
              onClick={handleNextPage}
              disabled={isVoiceOverPlaying}
            >
              Next <FaArrowRight />
            </button>
          )}
        </div>
      )
    }
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (pageTurnAudioRef.current) {
        pageTurnAudioRef.current.pause()
      }
    }
  }, [])

  return (
    <div
      className='cyber-definition-container'
      style={{ backgroundImage: `url(${bgimg})` }}
    >
      <div className='cyber-definition-content'>
        <div className='cyber-definition-content-item'>
          {renderBookContent()}
        </div>
      </div>
    </div>
  )
}

export default CyberDefinition
