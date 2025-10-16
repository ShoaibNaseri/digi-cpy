import { useState, useEffect } from 'react'
import './scene.css'
import { useParams } from 'react-router-dom'
import SceneComponent from './SceneComponent'
import { useImages } from '@/context/ImageContext'
import TobeComponent from '../to_be_cont/TobeComponent'
import { saveMissionProgressUniversal } from '@/utils/missionProgressUtils'
import { createMissionCompletionNotification } from '@/services/studentNotificationService'
import { auth } from '@/firebase/config'
import { getMissionTitle } from '@/utils/missionUtils'
// Loading component to display while images are loading
const LoadingComponent = () => (
  <div className='scene-loading'>
    <div className='loading-spinner'></div>
    <div>Loading scene...</div>
  </div>
)

const Scene = ({
  scenesData = [],
  dialogueBgImage,
  mainBackground,
  characterImageMap,
  backgroundImagesMap,
  sceneId,
  currentStep,
  totalScene,
  missionProgressPercent,
  onComplete
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [sceneComplete, setSceneComplete] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(true) // Track if images are loaded
  const { backgroundImages, getBackgroundImage } = useImages()
  const { missionId } = useParams()
  const [progress, setProgress] = useState(missionProgressPercent || 0)
  const [isComplete, setIsComplete] = useState(false)

  const userId = auth.currentUser.uid
  const missionName = getMissionTitle(missionId)

  // Get the current scene data
  const currentScene = scenesData[currentSceneIndex] || null
  const saveProgress = async (
    newProgress = progress,
    newIsComplete = isComplete,
    newSceneId = currentSceneIndex
  ) => {
    const missionDatas = {
      missionId: missionId,
      step: currentStep,
      sceneId: newSceneId,
      progress: newProgress,
      isComplete: newIsComplete
    }
    await saveMissionProgressUniversal(missionDatas)
  }
  useEffect(() => {
    if (currentScene) {
    }
  }, [currentScene, currentSceneIndex, backgroundImages])

  // Preload character images
  useEffect(() => {
    const preloadImages = async () => {
      setImagesLoaded(false)
      try {
        // If we had any additional images to preload, we'd do it here
        setImagesLoaded(true)
      } catch (error) {
        console.error('Error preloading images:', error)
        setImagesLoaded(true) // Still set to true to allow rendering
      }
    }

    preloadImages()
  }, [])
  const countPercentagePerScene = (progress, totalScene) => {
    const totalProgress = (100 - progress) / totalScene + progress
    return Math.round(totalProgress)
  }
  // Handler for when a scene is completed
  const handleSceneComplete = () => {
    // If there are more scenes, advance to the next one
    if (currentSceneIndex < scenesData.length - 1) {
      const nextSceneIndex = currentSceneIndex + 1
      const newProgress = countPercentagePerScene(progress, totalScene)

      setCurrentSceneIndex(nextSceneIndex)
      setProgress(newProgress)
      saveProgress(newProgress, isComplete, nextSceneIndex)
    } else {
      // All scenes completed
      if (onComplete) {
        onComplete('mission_brief')
      } else {
        const newProgress = 100

        setIsComplete(true)
        setProgress(newProgress)
        saveProgress(newProgress, true, currentSceneIndex)
        setSceneComplete(true)
        createMissionCompletionNotification(userId, missionName)
      }
    }
  }

  // Get the dynamic background for the current scene
  const getSceneBackground = () => {
    if (!currentScene) return mainBackground

    // If there's a background property in the scene, directly use it as the key
    if (currentScene.background) {
      // First check if the background name exists directly in the registry
      const bgFromRegistry = backgroundImages[currentScene.background]
      if (bgFromRegistry) {
        return bgFromRegistry
      } else {
        console.warn(
          `No background found for ${currentScene.background} in registry`
        )
      }
    }

    // Fallback: If there's a scene ID, try using that with the backgroundImagesMap
    if (
      currentScene.id &&
      backgroundImagesMap &&
      backgroundImagesMap[currentScene.id]
    ) {
      return backgroundImagesMap[currentScene.id]
    }

    // Default to the main background if nothing else works

    return mainBackground
  }

  // Show loading component if images aren't loaded yet
  if (!imagesLoaded) {
    return <LoadingComponent />
  }

  // Show completion message if all scenes are completed
  if (sceneComplete) {
    return <TobeComponent interfaceBG={dialogueBgImage} />
  }

  if (!currentScene) {
    return <div className='scene-error'>No scene data available</div>
  }

  return (
    <SceneComponent
      key={`scene-${currentSceneIndex}`}
      comingData={currentScene}
      dialogues={currentScene.dialogues}
      characters={currentScene.characters}
      onSceneComplete={handleSceneComplete}
      bgImage={getSceneBackground()}
      isFirstScene={currentSceneIndex === 0}
      characterImageMap={characterImageMap}
      dialogueBoxImage={dialogueBgImage}
    />
  )
}

export default Scene
