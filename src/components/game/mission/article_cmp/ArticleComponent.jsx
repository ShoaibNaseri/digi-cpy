import { useEffect, useState, useRef } from 'react'
import { useDeviceRotation } from '@/utils/deviceRotation'
import './articleComponent.css'
import { useParams } from 'react-router-dom'
import { saveMissionProgressUniversal } from '@/utils/missionProgressUtils'

const ArticleComponent = ({
  interfaceBG,
  missionData,
  onComplete,
  articleImage,
  articleProfile,
  currentStep
}) => {
  const [currentContentIndex, setCurrentContentIndex] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [profileAnimated, setProfileAnimated] = useState(false)
  const [showText, setShowText] = useState(false)
  const [textAnimated, setTextAnimated] = useState(false)
  const [allContentComplete, setAllContentComplete] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)

  const contentScrollRef = useRef(null)
  const needsRotation = useDeviceRotation()
  const { missionId } = useParams()

  const playSoundEffect = (type) => {}

  const saveProgress = async () => {
    const missionDatas = {
      missionId: missionId,
      step: currentStep,
      progress: 20
    }
    await saveMissionProgressUniversal(missionDatas)
  }

  // Check if user has scrolled to bottom
  const handleScroll = () => {
    if (contentScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentScrollRef.current

      // If content is shorter than container, require user to scroll at least once
      const needsScrolling = scrollHeight > clientHeight

      if (needsScrolling) {
        // For scrollable content, check if at bottom
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px threshold
        if (isAtBottom && !hasScrolledToBottom) {
          setHasScrolledToBottom(true)
          setShowScrollIndicator(false) // Hide indicator when scrolled to bottom
        } else if (!isAtBottom && !hasScrolledToBottom) {
          setShowScrollIndicator(true) // Show indicator if not at bottom and not yet scrolled
        }
      } else {
        // For short content, require any scroll interaction
        if (scrollTop > 0 && !hasScrolledToBottom) {
          setHasScrolledToBottom(true)
          setShowScrollIndicator(false) // Hide indicator if any scroll happened
        } else if (scrollTop === 0 && !hasScrolledToBottom) {
          setShowScrollIndicator(false) // No scroll needed, hide indicator
        }
      }
    }
  }

  // Get current content section
  const getCurrentContent = () => {
    if (
      !missionData?.content ||
      currentContentIndex >= missionData.content.length
    ) {
      return null
    }

    const content = missionData.content[currentContentIndex]
    return content
  }

  // Display current section content immediately
  const showCurrentSection = () => {
    const currentContent = getCurrentContent()
    if (!currentContent) {
      return
    }

    // Reset scroll position for new content
    setHasScrolledToBottom(false)

    // Auto-advance to next section after 10 seconds (increased time for reading)
    setTimeout(() => {
      if (currentContentIndex < missionData.content.length - 1) {
        setCurrentContentIndex((prev) => prev + 1)
      } else {
        // All content complete
        setAllContentComplete(true)
        setShowControls(true)
      }
    }, 10000) // 10 seconds to read the content
  }

  // Reset component state
  const resetState = () => {
    setCurrentContentIndex(0)
    setShowControls(false)
    setShowProfile(false)
    setProfileAnimated(false)
    setShowText(false)
    setTextAnimated(false)
    setAllContentComplete(false)
    setHasScrolledToBottom(false)
    setShowScrollIndicator(false) // Reset scroll indicator state
  }

  useEffect(() => {
    // Check for rotation or missing mission data
    if (needsRotation || !missionData?.content) {
      resetState()
      return
    }

    // Initial setup sequence - show everything at once
    resetState()

    const sequenceTimer1 = setTimeout(() => {
      setShowProfile(true)
    }, 500)

    const sequenceTimer2 = setTimeout(() => {
      setProfileAnimated(true)
    }, 700)

    const sequenceTimer3 = setTimeout(() => {
      setShowText(true)
      setTimeout(() => setTextAnimated(true), 100)
    }, 900)

    const sequenceTimer4 = setTimeout(() => {
      // Start showing the first section
      showCurrentSection()
      // Check if scrolling is needed after content is displayed
      if (contentScrollRef.current) {
        const { scrollHeight, clientHeight } = contentScrollRef.current
        if (scrollHeight > clientHeight) {
          setShowScrollIndicator(true)
        }
      }
    }, 1200)

    return () => {
      clearTimeout(sequenceTimer1)
      clearTimeout(sequenceTimer2)
      clearTimeout(sequenceTimer3)
      clearTimeout(sequenceTimer4)
      resetState()
    }
  }, [missionData, needsRotation])

  // Effect to handle content section changes
  useEffect(() => {
    if (currentContentIndex > 0 && !allContentComplete) {
      // Show new section
      setTimeout(() => {
        showCurrentSection()
        // Re-check for scroll indicator on new content
        if (contentScrollRef.current) {
          const { scrollHeight, clientHeight } = contentScrollRef.current
          if (scrollHeight > clientHeight) {
            setShowScrollIndicator(true)
          } else {
            setShowScrollIndicator(false)
          }
        }
      }, 500)
    }
  }, [currentContentIndex])

  const handleFinish = () => {
    playSoundEffect('click')
    if (onComplete) {
      saveProgress()
      onComplete(missionData?.next_scene)
    } else {
      console.warn('ArticleComponent: onFinish prop not provided.')
    }
  }

  // Get current content to display
  const currentContent = getCurrentContent()

  return (
    <>
      {needsRotation && (
        <div className='rotation-overlay'>
          <span className='rotation-icon'>🔄</span>
          <p>Please rotate your device to landscape mode.</p>
        </div>
      )}
      {!needsRotation && (
        <div
          className='content-container'
          style={{
            backgroundImage: interfaceBG ? `url(${interfaceBG})` : 'none'
          }}
        >
          <div className='final-content-block'>
            <h1 style={{ whiteSpace: 'pre-line' }}>
              {currentContent?.title ? currentContent.title.toUpperCase() : ''}
            </h1>

            <div className='article-content-container'>
              <div
                className={`article-content-img ${
                  showProfile ? 'visible' : 'hidden'
                } ${profileAnimated ? 'animated-to-position' : 'centered'}`}
              >
                <img src={articleProfile} alt='Article Profile' />
              </div>
              <div className='article-content-text'>
                {showText && (
                  <div
                    className={`final-text-area ${
                      textAnimated ? 'text-fade-in' : 'text-hidden'
                    }`}
                    ref={contentScrollRef}
                    onScroll={handleScroll}
                    style={{
                      height: '400px',
                      overflowY: 'auto',
                      paddingRight: '10px'
                    }}
                  >
                    {currentContent?.content?.split('\n').map((line, index) => (
                      <p key={`${currentContentIndex}-${index}`}>
                        {line || '\u00A0'}
                      </p>
                    ))}
                  </div>
                )}
                {showScrollIndicator && !hasScrolledToBottom && (
                  <div className='scroll-down-indicator'>
                    <span>Use the side scrollbar to scroll down </span>
                    <span className='arrow-down'>↓</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='article-news-container'>
            <img src={articleImage} alt='Article News' />
          </div>

          <div className='final-controls'>
            <button
              style={{
                visibility:
                  showControls && allContentComplete && hasScrolledToBottom
                    ? 'visible'
                    : 'hidden'
              }}
              className='final-button'
              onClick={handleFinish}
            >
              <span className='btn-icon'>✓</span> NEXT
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ArticleComponent
