import { useState, useEffect, useRef } from 'react'
import { playMusic, pauseMusic, setMusicVolume } from '@/utils/audioManager'
import './GameSettingComponent.css'
import {
  FaVolumeUp,
  FaVolumeMute,
  FaCog,
  FaTimes,
  FaPause,
  FaPlay,
  FaExpand,
  FaCompress,
  FaHome,
  FaStickyNote,
  FaGamepad,
  FaSignOutAlt,
  FaArrowLeft
} from 'react-icons/fa'
import GameNoteComponent from '../game_feature/GameNoteComponent'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaGear } from 'react-icons/fa6'

const GameSettingComponent = ({ targetRef, missionId, missionTitle }) => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  // Music state
  const [volume, setVolume] = useState(0.25)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMute, setIsMute] = useState(false)
  const [audioInitialized, setAudioInitialized] = useState(false)

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showGameControlsModal, setShowGameControlsModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const initAttempted = useRef(false)
  const modalRef = useRef(null)
  const settingsModalRef = useRef(null)
  const gameControlsModalRef = useRef(null)
  const exitModalRef = useRef(null)

  // Note state
  const [showNote, setShowNote] = useState(false)

  // Initialize and play music when component mounts
  useEffect(() => {
    const initAudio = () => {
      try {
        setMusicVolume(volume)
        if (isPlaying && volume > 0) {
          playMusic()
          setAudioInitialized(true)
        }
      } catch (error) {
        console.error('Error initializing audio:', error)
      }
    }

    if (!initAttempted.current) {
      initAttempted.current = true
      initAudio()
    }

    return () => {
      pauseMusic()
    }
  }, [])

  // Fullscreen functionality
  const enterFullscreen = () => {
    const elem = targetRef?.current
    if (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen()
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen()
      }
    }
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  // Enhanced fullscreen change handler
  useEffect(() => {
    const onFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement ||
        document.mozFullScreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
    document.addEventListener('msfullscreenchange', onFullscreenChange)
    document.addEventListener('mozfullscreenchange', onFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
      document.removeEventListener('msfullscreenchange', onFullscreenChange)
      document.removeEventListener('mozfullscreenchange', onFullscreenChange)
    }
  }, [])

  // Add click outside handler to close modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false)
      }
      if (
        settingsModalRef.current &&
        !settingsModalRef.current.contains(event.target)
      ) {
        setShowSettingsModal(false)
      }
      if (
        gameControlsModalRef.current &&
        !gameControlsModalRef.current.contains(event.target)
      ) {
        setShowGameControlsModal(false)
      }
      if (
        exitModalRef.current &&
        !exitModalRef.current.contains(event.target)
      ) {
        setShowExitModal(false)
      }
    }

    if (
      showModal ||
      showSettingsModal ||
      showGameControlsModal ||
      showExitModal
    ) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showModal, showSettingsModal, showGameControlsModal, showExitModal])

  const togglePlay = () => {
    try {
      if (isPlaying) {
        pauseMusic()
      } else {
        playMusic()
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      console.error('Error toggling music playback:', error)
    }
  }

  const handleVolumeChange = (e) => {
    try {
      const newVolume = parseFloat(e.target.value)
      setVolume(newVolume)
      setMusicVolume(newVolume)
      setIsMute(newVolume === 0)

      if (newVolume > 0 && isPlaying && !audioInitialized) {
        playMusic()
        setAudioInitialized(true)
      }
    } catch (error) {
      console.error('Error changing volume:', error)
    }
  }

  const handleMute = () => {
    try {
      if (isMute) {
        setVolume(0.1)
        setMusicVolume(0.1)
        setIsMute(false)

        if (isPlaying && !audioInitialized) {
          playMusic()
          setAudioInitialized(true)
        }
      } else {
        setVolume(0)
        setMusicVolume(0)
        setIsMute(true)
      }
    } catch (error) {
      console.error('Error handling mute/unmute:', error)
    }
  }

  // Handle volume changes
  useEffect(() => {
    try {
      setMusicVolume(volume)

      if (volume > 0 && isPlaying && !audioInitialized) {
        playMusic()
        setAudioInitialized(true)
      }
    } catch (error) {
      console.error('Error in volume effect:', error)
    }
  }, [volume, isPlaying])

  // Modal handlers
  const handleSettingsClick = () => {
    setShowModal(false)
    setShowSettingsModal(true)
  }

  const handleGameControlsClick = () => {
    setShowModal(false)
    setShowGameControlsModal(true)
  }

  const handleExitGameClick = () => {
    setShowModal(false)
    setShowExitModal(true)
  }

  const handleExitGameConfirm = async () => {
    // Add your exit game logic here
    console.log('Exiting game...')

    try {
      // Save notes to Firebase before exiting
      console.log(
        'Checking for saveCurrentNoteToFirebase function:',
        typeof window.saveCurrentNoteToFirebase
      )
      if (window.saveCurrentNoteToFirebase) {
        console.log('Calling saveCurrentNoteToFirebase...')
        const result = await window.saveCurrentNoteToFirebase()
        console.log('Save result:', result)
        console.log('Notes saved to Firebase before exit')
      } else {
        console.log(
          'saveCurrentNoteToFirebase function not found on window object'
        )
      }
    } catch (error) {
      console.error('Error saving notes before exit:', error)
    }

    if (currentUser.role === 'STUDENT') {
      navigate('/dashboard/student/missions')
    } else {
      navigate('/dashboard/child/missions')
    }
    setShowExitModal(false)
  }

  const handleBackToMainModal = () => {
    setShowSettingsModal(false)
    setShowGameControlsModal(false)
    setShowExitModal(false)
    setShowModal(true)
  }

  return (
    <>
      {/* Settings icon button */}
      <div className='game-settings-icons-container'>
        <div
          className='game-settings-icon-note'
          onClick={() => setShowNote(true)}
        >
          <img src='/assets/icons/note.webp' alt='note' />
        </div>
        <div
          className='game-settings-icon-note'
          onClick={() => setShowModal(true)}
        >
          <img src='/assets/icons/gears.webp' alt='note' />
        </div>
      </div>

      {/* Main Settings Modal */}
      {showModal && (
        <div className='game-modal-backdrop'>
          <div className='game-modal' ref={modalRef}>
            <div className='game-modal-header'>
              <h3>Game Settings</h3>
              <button
                className='game-settings-close-modal-btn'
                onClick={() => setShowModal(false)}
                aria-label='Close modal'
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className='game-modal-content'>
              <div className='game-settings-settings-options-container'>
                <div
                  className='game-settings-settings-option'
                  onClick={handleSettingsClick}
                >
                  <div className='game-settings-settings-option-icon'>
                    <FaCog size={32} />
                  </div>
                  <div className='game-settings-settings-option-text'>
                    <h4>Settings</h4>
                    <p>Adjust audio, screen, and display preferences.</p>
                  </div>
                </div>

                <div
                  className='game-settings-settings-option'
                  onClick={handleGameControlsClick}
                >
                  <div className='game-settings-settings-option-icon'>
                    <FaGamepad size={32} />
                  </div>
                  <div className='game-settings-settings-option-text'>
                    <h4>Game Controls</h4>
                    <p>Learn the controls and how to play.</p>
                  </div>
                </div>

                <div
                  className='game-settings-settings-option'
                  onClick={handleExitGameClick}
                >
                  <div className='game-settings-settings-option-icon'>
                    <FaSignOutAlt size={32} />
                  </div>
                  <div className='game-settings-settings-option-text'>
                    <h4>Exit Game</h4>
                    <p> Your progress is saved automatically.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className='game-modal-backdrop'>
          <div className='game-modal' ref={settingsModalRef}>
            <div className='game-modal-header'>
              <button
                className='game-settings-back-btn'
                onClick={handleBackToMainModal}
                aria-label='Back to main settings'
              >
                <FaArrowLeft size={20} />
              </button>
              <h3>Settings</h3>
              <button
                className='game-settings-close-modal-btn'
                onClick={() => setShowSettingsModal(false)}
                aria-label='Close modal'
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className='game-modal-content'>
              {/* Screen Settings Section */}
              <div className='game-settings-settings-section'>
                <h4 className='game-settings-section-title'>Screen</h4>
                <div className='game-settings-setting-item'>
                  <label>Fullscreen Mode</label>
                  <button
                    className='game-settings-fullscreen-toggle-btn'
                    onClick={toggleFullscreen}
                    aria-label={
                      isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
                    }
                  >
                    {isFullscreen ? (
                      <FaCompress size={18} />
                    ) : (
                      <FaExpand size={18} />
                    )}
                    <span>
                      {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Audio Settings Section */}
              <div className='game-settings-settings-section'>
                <h4 className='game-settings-section-title'>Audio</h4>
                <div className='game-settings-setting-item'>
                  <label>Background Music</label>
                  <div className='game-settings-volume-control'>
                    <button
                      className='game-settings-icon-btn'
                      onClick={togglePlay}
                      aria-label={isPlaying ? 'Pause music' : 'Play music'}
                    >
                      {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <input
                      type='range'
                      min='0'
                      max='1'
                      step='0.01'
                      value={volume}
                      onChange={handleVolumeChange}
                      className='game-settings-volume-slider'
                      aria-label='Audio volume control'
                      style={{
                        '--volume-percentage': `${volume * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Controls Modal */}
      {showGameControlsModal && (
        <div className='game-modal-backdrop'>
          <div className='game-modal' ref={gameControlsModalRef}>
            <div className='game-modal-header'>
              <button
                className='game-settings-back-btn'
                onClick={handleBackToMainModal}
                aria-label='Back to main settings'
              >
                <FaArrowLeft size={20} />
              </button>
              <h3>Game Controls</h3>
              <button
                className='game-settings-close-modal-btn'
                onClick={() => setShowGameControlsModal(false)}
                aria-label='Close modal'
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className='game-modal-content'>
              <div className='game-settings-settings-section'>
                <h4 className='game-settings-section-title'>How to Play</h4>
                <div className='game-settings-controls-content'>
                  <div className='game-settings-control-item'>
                    <div className='game-settings-control-icon'>
                      <FaGamepad size={24} />
                    </div>
                    <div className='game-settings-control-text'>
                      <h5>Scene Navigation</h5>
                      <p>
                        Use the
                        <span className='game-settings-inline-arrow game-settings-left-arrow'>
                          ←
                        </span>{' '}
                        and
                        <span className='game-settings-inline-arrow game-settings-right-arrow'>
                          →
                        </span>{' '}
                        arrow keys to move forward or back in the scene.
                      </p>
                    </div>
                  </div>

                  <div className='game-settings-control-item'>
                    <div className='game-settings-control-icon'>
                      <FaStickyNote size={24} />
                    </div>
                    <div className='game-settings-control-text'>
                      <h5>Take Notes</h5>
                      <p>
                        Click the note icon to write or review your notes while
                        you play - they save automatically.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Game Confirmation Modal */}
      {showExitModal && (
        <div className='game-modal-backdrop'>
          <div className='game-modal' ref={exitModalRef}>
            <div className='game-modal-header'>
              <button
                className='game-settings-back-btn'
                onClick={handleBackToMainModal}
                aria-label='Back to main settings'
              >
                <FaArrowLeft size={20} />
              </button>
              <h3>Exit Game</h3>
              <span>{'     '}</span>
            </div>

            <div className='game-modal-content'>
              <div className='game-settings-settings-section'>
                <div className='game-settings-exit-confirmation'>
                  <div className='game-settings-exit-icon'>
                    <FaSignOutAlt size={48} />
                  </div>
                  <h4>
                    Agent, are you sure you want <br /> to exit your mission?
                  </h4>
                  <p>Your progress will be saved automatically.</p>

                  <div className='game-settings-exit-buttons'>
                    <button
                      className='game-settings-cancel-btn'
                      onClick={handleBackToMainModal}
                    >
                      Cancel
                    </button>
                    <button
                      className='game-settings-confirm-exit-btn'
                      onClick={handleExitGameConfirm}
                    >
                      Exit Game
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Component */}
      <GameNoteComponent
        missionId={missionId}
        missionTitle={missionTitle}
        isVisible={showNote}
        onToggle={() => setShowNote(false)}
      />
    </>
  )
}

export default GameSettingComponent
