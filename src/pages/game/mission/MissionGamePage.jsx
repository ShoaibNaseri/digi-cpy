import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { getMissionData } from '@/utils/missionUtils'

// Import mission components
import Welcome from '@/components/game/mission/welcom_cmp/WelcomComponent'
import './missionGamePage.css'

import Article from '@/components/game/mission/article_cmp/ArticleComponent'
import AzaCheck from '@/components/game/mission/azacheck_cmp/AzabukiCheckComponent'
import MissionBrief from '@/components/game/mission/missionbrief_cmp/MissionBreifComponent'
import MissionTasks from '@/components/game/mission/tasks_cmp/TaskComponent'
import GameSettingComponent from '@/components/game/mission/bg_music_cmp/GameSettingComponent'
import Scene from '@/components/game/mission/scene_cmp/Scene'
import IntroScene from '@/components/game/mission/intro_scene_cmp/IntroSceneComponent'
import TobeComponent from '@/components/game/mission/to_be_cont/TobeComponent'
import MissionNotFoundModal from '@/components/game/MissionNotFoundModal'
import { useDeviceRotation } from '@/utils/deviceRotation'
import { useImages } from '@/context/ImageContext'
import {
  backgroundImages,
  characterImages,
  backgroundImagesById,
  articleImages,
  actionImages,
  getArticleImage,
  getActionImage
} from '@/utils/gameImagesRegistry'
import {
  getMissionProgress,
  startMissionAttempt,
  endMissionAttempt
} from '@/services/gameMissionProgress'
import {
  getChildMissionProgress,
  startChildMissionAttempt,
  endChildMissionAttempt
} from '@/services/childMissionProgress'

const MissionGamePage = () => {
  const { missionId } = useParams()
  const location = useLocation()
  const [missionData, setMissionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(null)
  const [showComponents, setShowComponents] = useState(false) // Control component visibility
  const [showMissionNotFoundModal, setShowMissionNotFoundModal] =
    useState(false)
  const [missionProgressPercent, setMissionProgressPercent] = useState(0)
  const [missionProgress, setMissionProgress] = useState(null)
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [missionContext, setMissionContext] = useState(null)
  const missionRef = useRef(null)
  const [totalScene, setTotalScene] = useState(0)

  // Get image loading state and helpers from context
  const {
    loadingImages,
    loadingProgress,
    imagesLoaded,
    error,
    loadMissionImages
  } = useImages()

  // Background states
  const [currentBackground, setCurrentBackground] = useState(null)
  const [interfaceBG, setInterfaceBG] = useState(null)
  const needsRotation = useDeviceRotation()

  // Use utility function to get mission data
  const mission_data = getMissionData(missionId)

  // Get mission context from localStorage and mission title
  useEffect(() => {
    const contextData = localStorage.getItem('currentMissionContext')
    if (contextData) {
      setMissionContext(JSON.parse(contextData))
    }
  }, [])

  const missionTitle =
    location.state?.missionTitle ||
    missionContext?.missionTitle ||
    mission_data?.title ||
    'Unknown Mission'

  // Track mission attempt start
  useEffect(() => {
    const startAttempt = async () => {
      if (missionId && missionTitle && mission_data && missionContext) {
        try {
          let startTime
          if (missionContext.userType === 'child') {
            startTime = await startChildMissionAttempt(
              missionId,
              missionTitle,
              missionContext.userId
            )
          } else {
            startTime = await startMissionAttempt(missionId, missionTitle)
          }

          setSessionStartTime(startTime)
        } catch (error) {}
      }
    }

    startAttempt()
  }, [missionId, missionTitle, mission_data, missionContext])

  // Track mission attempt end on component unmount or page unload
  useEffect(() => {
    const endAttempt = () => {
      if (missionId && sessionStartTime && missionContext) {
        if (missionContext.userType === 'child') {
          endChildMissionAttempt(
            missionId,
            sessionStartTime,
            missionContext.userId
          )
        } else {
          endMissionAttempt(missionId, sessionStartTime)
        }
      }
    }
    // Handle page unload (browser close, refresh, navigation away)
    const handleBeforeUnload = () => {
      endAttempt()
    }

    // Handle route changes
    const handlePopState = () => {
      endAttempt()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    // Cleanup on component unmount
    return () => {
      endAttempt()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [missionId, sessionStartTime, missionContext])

  // Check if mission data exists on component mount
  useEffect(() => {
    if (!mission_data) {
      setLoading(false)
      setShowMissionNotFoundModal(true)
      return
    }

    // Only load mission images if mission data exists
    loadMissionImages(mission_data)
  }, [mission_data, loadMissionImages])

  useEffect(() => {
    const fetchMissionProgress = async () => {
      if (missionId && missionContext) {
        try {
          let progress
          if (missionContext.userType === 'child') {
            progress = await getChildMissionProgress(
              missionId,
              missionContext.userId
            )
          } else {
            progress = await getMissionProgress(missionId)
          }

          setMissionProgress(progress)
          setMissionProgressPercent(progress?.progress)
          // Set current step based on progress, with fallback to intro_scene
          if (progress?.isComplete) {
            setCurrentStep('tobe_cont')
          } else {
            if (progress?.step) {
              setCurrentStep(progress.step)
            } else {
              setCurrentStep('intro_scene')
            }
          }
        } catch (error) {
          // Set default step if there's an error
          setCurrentStep('intro_scene')
        }
      }
    }

    fetchMissionProgress()
  }, [missionId, missionContext])

  // Media configuration for each step
  const stepMedia = {
    intro_scene: {
      backgroundMusic: null,
      voiceNarration: null,
      backgroundImage: backgroundImages.missionBg,
      missionData: mission_data?.intro_scene,
      interfaceBG: backgroundImages.dialogueBg
    },
    welcome: {
      backgroundMusic: null,
      voiceNarration: null,
      backgroundImage: backgroundImages.missionBg,
      missionData: mission_data?.welcome,
      interfaceBG: backgroundImages.dialogueBg
    },
    article: {
      backgroundMusic: null,
      voiceNarration: null,
      backgroundImage: backgroundImages.missionBg,
      missionData: mission_data?.article,
      interfaceBG: backgroundImages.dialogueBg,
      articleImage: articleImages.newsIcon,
      articleProfile: getArticleImage(mission_data?.article?.profile_image)
    },
    spider_scenes: {
      backgroundMusic: null,
      voiceNarration: null,
      backgroundImage: backgroundImages.missionBg,
      missionData: mission_data?.spider_scenes,
      interfaceBG: backgroundImages.dialogueBg
    },
    'aza-check': {
      backgroundMusic: null,
      voiceNarration: null,
      backgroundImage: backgroundImages.azabukiOffice,
      missionData: mission_data?.azabuki_check,
      interfaceBG: backgroundImages.dialogueBg,
      characterImage: characterImages.mrAzabuki
    },
    mission_brief: {
      backgroundMusic: null,
      voiceNarration: null,
      backgroundImage: backgroundImages.missionBg,
      missionData: mission_data?.mission_brief,
      interfaceBG: backgroundImages.dialogueBg
    },
    mission_tasks: {
      backgroundMusic: null,
      voiceNarration: null,
      backgroundImage: backgroundImages.missionBg,
      missionData: mission_data?.mission_tasks,
      interfaceBG: backgroundImages.dialogueBg
    },
    scene: {
      backgroundMusic: null,
      voiceNarration: null,
      backgroundImage: backgroundImages.missionBg,
      missionData: mission_data?.scenes,
      interfaceBG: backgroundImages.dialogueBg
    }
  }

  // Set up the mission when data and images are loaded
  useEffect(() => {
    // Skip if no mission data exists
    if (!mission_data) return

    // Update loading state based on image loading
    setLoading(loadingImages || !imagesLoaded)

    // Set mission data when everything is loaded
    if (imagesLoaded && !loadingImages) {
      setMissionData(mission_data)

      // Set default backgrounds
      if (currentStep === 'intro_scene') {
        setCurrentBackground(backgroundImages.missionBg)
      } else if (currentStep === 'aza-check') {
        setCurrentBackground(backgroundImages.azabukiOffice)
      } else {
        setCurrentBackground(backgroundImages.missionBg)
      }
      setInterfaceBG(backgroundImages.dialogueBg)

      // Set body style
      document.body.style.overflow = 'hidden'

      // Complete loading after a small delay
      setTimeout(() => {
        setLoading(false)
        // Show background first, then components after additional delay
        setTimeout(() => {
          setShowComponents(true)
        }, 100) // 1.5 second delay for components to appear
      }, 300)
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [mission_data, loadingImages, imagesLoaded])

  const handleStepComplete = (nextStep) => {
    // If mission-tasks is complete, navigate to scene

    setCurrentBackground(backgroundImages.missionBg)

    if (currentStep === 'mission_tasks' && nextStep === 'complete') {
      setCurrentStep('scene')
    } else {
      setCurrentStep(nextStep)
    }
  }

  const handleStartOver = () => {
    setCurrentStep(missionProgress?.step)
  }

  const handleRetry = () => {
    // Reset states and retry loading
    setLoading(true)
    window.location.reload()
  }

  const handleCloseModal = () => {
    setShowMissionNotFoundModal(false)
  }

  useEffect(() => {
    if (mission_data?.scenes) {
      setTotalScene(mission_data?.scenes?.length)
    }
  }, [mission_data])

  if (loading) {
    return (
      <div className='game-loading'>
        <div className='loading-spinner'></div>
        <div className='loading-text'>Loading game resources...</div>
        <div className='loading-progress'>
          <div
            className='mission-progress-bar'
            style={{ width: `${loadingProgress}%` }}
          ></div>
          <div className='mission-progress-text'>{loadingProgress}%</div>
        </div>
        {loadingProgress === 100 && (
          <div className='loading-complete'>Starting mission...</div>
        )}
      </div>
    )
  }

  // Show modal if mission data not found
  if (showMissionNotFoundModal) {
    return (
      <MissionNotFoundModal
        isOpen={showMissionNotFoundModal}
        onClose={handleCloseModal}
      />
    )
  }

  if (!missionData || !currentBackground || !interfaceBG) {
    return (
      <div className='game-error'>
        <div className='error-icon'>!</div>
        <div className='error-message'>
          Failed to load mission resources. Please try again.
        </div>
        <button className='game-button' onClick={handleRetry}>
          Retry Mission
        </button>
      </div>
    )
  }

  // Render the appropriate step component
  const renderCurrentStep = () => {
    const media = stepMedia[currentStep]

    switch (currentStep) {
      case 'intro_scene':
        return (
          <IntroScene
            missionData={media.missionData}
            dialogueBgImage={backgroundImages.dialogueBg}
            mainBackground={backgroundImages.digipalzHeadquarter}
            onComplete={handleStepComplete}
            characterImageMap={characterImages}
            currentStep={currentStep}
          />
        )
      case 'welcome':
        return (
          <Welcome
            missionData={media.missionData}
            onComplete={handleStepComplete}
            backgroundMusic={media.backgroundMusic}
            voiceNarration={media.voiceNarration}
            interfaceBG={interfaceBG}
            mainBackground={currentBackground}
            robotroImage={characterImages.robotoroDialoguebox}
            currentStep={currentStep}
          />
        )

      case 'article':
        return (
          <Article
            missionData={media.missionData}
            onComplete={handleStepComplete}
            backgroundMusic={media.backgroundMusic}
            voiceNarration={media.voiceNarration}
            interfaceBG={interfaceBG}
            articleImage={media.articleImage}
            articleProfile={media.articleProfile}
            currentStep={currentStep}
          />
        )
      case 'aza-check':
        return (
          <AzaCheck
            missionData={media.missionData}
            onComplete={handleStepComplete}
            backgroundMusic={media.backgroundMusic}
            voiceNarration={media.voiceNarration}
            characterImage={characterImages.mrAzabuki}
            interfaceBG={interfaceBG}
            currentStep={currentStep}
          />
        )
      case 'spider_scenes':
        return (
          <Scene
            scenesData={media.missionData}
            dialogueBgImage={backgroundImages.dialogueBg}
            mainBackground={currentBackground}
            characterImageMap={characterImages}
            backgroundImagesMap={backgroundImagesById}
            currentStep={currentStep}
            onComplete={handleStepComplete}
          />
        )
      case 'mission_brief':
        return (
          <MissionBrief
            data={media.missionData}
            onComplete={handleStepComplete}
            backgroundMusic={media.backgroundMusic}
            voiceNarration={media.voiceNarration}
            interfaceBG={interfaceBG}
            robotroImage={characterImages.robotoroDialoguebox}
            currentStep={currentStep}
          />
        )
      case 'mission_tasks':
        return (
          <MissionTasks
            missionData={media.missionData}
            onComplete={handleStepComplete}
            onStartOver={handleStartOver}
            interfaceBG={interfaceBG}
            currentStep={currentStep}
          />
        )
      case 'scene':
        return (
          <Scene
            scenesData={media.missionData}
            dialogueBgImage={backgroundImages.dialogueBg}
            mainBackground={currentBackground}
            characterImageMap={characterImages}
            backgroundImagesMap={backgroundImagesById}
            currentStep={currentStep}
            sceneId={missionProgress?.sceneId || 0}
            totalScene={totalScene}
            missionProgressPercent={missionProgressPercent}
          />
        )
      case 'tobe_cont':
        return (
          <TobeComponent
            interfaceBG={interfaceBG}
            onComplete={handleStepComplete}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <div
        ref={missionRef}
        className='mission-page-main'
        style={{ backgroundImage: `url(${currentBackground})` }}
      >
        {/* Game Settings (Audio & Fullscreen & Notes) */}
        <GameSettingComponent targetRef={missionRef} missionId={missionId} />

        {showComponents && renderCurrentStep()}
      </div>
    </>
  )
}

export default MissionGamePage
