import { useState, useEffect } from 'react'

const useLandingPageLoader = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [componentsLoaded, setComponentsLoaded] = useState(false)

  useEffect(() => {
    const loadAssets = async () => {
      // Only preload critical above-the-fold images
      const criticalAssets = [
        '/src/assets/LandingPage/banner.webp', // Hero image - most critical
        '/src/assets/LandingPage/mic.webp', // HowWeTeach section
        '/src/assets/LandingPage/mirror.webp', // HowWeTeach section
        '/src/assets/LandingPage/chat.webp' // HowWeTeach section
      ]

      let loadedCount = 0
      const totalAssets = criticalAssets.length

      // Create promises for image loading
      const imagePromises = criticalAssets.map((src, index) => {
        return new Promise((resolve) => {
          const img = new Image()

          img.onload = () => {
            loadedCount++
            setLoadingProgress(Math.round((loadedCount / totalAssets) * 80)) // Reserve 20% for final processing
            resolve()
          }

          img.onerror = () => {
            loadedCount++
            setLoadingProgress(Math.round((loadedCount / totalAssets) * 80))
            resolve() // Continue even if image fails to load
          }

          img.src = src
        })
      })

      // Wait for all images to load
      await Promise.all(imagePromises)

      // Quick final processing
      setLoadingProgress(90)
      await new Promise((resolve) => setTimeout(resolve, 100))

      setLoadingProgress(100)
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Ensure minimum loading time for smooth experience
      const minLoadTime = 500 // 0.5 seconds minimum for smooth transition
      const loadingStartTime = Date.now()
      const elapsedTime = Date.now() - loadingStartTime

      if (elapsedTime < minLoadTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadTime - elapsedTime)
        )
      }

      setComponentsLoaded(true)
    }

    loadAssets()
  }, [])

  useEffect(() => {
    if (componentsLoaded) {
      // Smooth transition delay
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [componentsLoaded])

  return {
    isLoading,
    loadingProgress,
    componentsLoaded
  }
}

export default useLandingPageLoader
