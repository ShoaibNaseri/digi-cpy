import { createContext, useContext, useState, useEffect } from 'react'
import { preloadMissionImages } from '@/utils/gameImageLoader'
import {
  characterImages,
  backgroundImages,
  articleImages,
  getCharacterImage,
  getBackgroundImage,
  getArticleImage
} from '@/utils/gameImagesRegistry'

// Create a context for images
const ImageContext = createContext()

export const ImageProvider = ({ children, missionData = null }) => {
  const [loadingImages, setLoadingImages] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [error, setError] = useState(null)

  // Function to load all mission images
  const loadMissionImages = (data) => {
    if (!data) return

    setLoadingImages(true)
    setLoadingProgress(0)
    setError(null)

    preloadMissionImages(
      data,
      // Progress callback
      (progress) => {
        setLoadingProgress(progress)
      },
      // Complete callback
      () => {
        setImagesLoaded(true)
        setLoadingImages(false)
      },
      // Error callback
      (err) => {
        setError(err)
        // We don't stop loading on error, just log it
      }
    )
  }

  // Load mission images if provided
  useEffect(() => {
    if (missionData) {
      loadMissionImages(missionData)
    }
  }, [missionData])

  // The context value
  const contextValue = {
    // Image loading state
    loadingImages,
    loadingProgress,
    imagesLoaded,
    error,

    // Image access methods
    getCharacterImage,
    getBackgroundImage,
    getArticleImage,

    // Raw image collections
    characterImages,
    backgroundImages,
    articleImages,

    // Methods
    loadMissionImages
  }

  return (
    <ImageContext.Provider value={contextValue}>
      {children}
    </ImageContext.Provider>
  )
}

// Custom hook to use the image context
export const useImages = () => {
  const context = useContext(ImageContext)
  if (!context) {
    throw new Error('useImages must be used within an ImageProvider')
  }
  return context
}
