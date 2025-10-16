import { useState, useEffect } from 'react'

const useAssetLoader = (assetPaths) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!assetPaths || assetPaths.length === 0) {
      setIsLoading(false)
      return
    }

    let assetsLoaded = 0
    const totalAssets = assetPaths.length

    const handleAssetLoad = () => {
      assetsLoaded++
      if (assetsLoaded === totalAssets) {
        setIsLoading(false)
      }
    }

    const handleAssetError = (event) => {
      console.error(
        'Failed to load asset:',
        event.target.src || event.target.href
      )
      setError(`Failed to load asset: ${event.target.src || event.target.href}`)
      // Optionally, decide whether to stop loading or continue with errors
      // For now, we'll still count it as 'attempted' load to prevent infinite loading state
      handleAssetLoad()
    }

    assetPaths.forEach((path) => {
      if (path.endsWith('.wav') || path.endsWith('.mp3')) {
        const audio = new Audio(path)
        audio.addEventListener('canplaythrough', handleAssetLoad)
        audio.addEventListener('error', handleAssetError)
        // To initiate loading without playing
        audio.load()
      } else if (
        path.endsWith('.png') ||
        path.endsWith('.jpg') ||
        path.endsWith('.jpeg') ||
        path.endsWith('.gif') ||
        path.endsWith('.webp') ||
        path.endsWith('.svg')
      ) {
        const img = new Image()
        img.src = path
        img.onload = handleAssetLoad
        img.onerror = handleAssetError
      } else {
        console.warn('Unsupported asset type for preloading:', path)
        handleAssetLoad() // Treat as loaded to not block
      }
    })

    return () => {
      // Cleanup event listeners if component unmounts during loading
      assetPaths.forEach((path) => {
        if (path.endsWith('.wav') || path.endsWith('.mp3')) {
          // Note: Creating new Audio objects for cleanup is generally not ideal
          // Better to store references if cleanup is critical during unmount mid-load.
          // For simplicity and typical use cases, this might be sufficient.
          const audio = new Audio(path)
          audio.removeEventListener('canplaythrough', handleAssetLoad)
          audio.removeEventListener('error', handleAssetError)
        } else if (
          path.endsWith('.png') ||
          path.endsWith('.jpg') ||
          path.endsWith('.jpeg') ||
          path.endsWith('.gif') ||
          path.endsWith('.webp') ||
          path.endsWith('.svg')
        ) {
          const img = new Image()
          img.src = path
          img.onload = null
          img.onerror = null
        }
      })
    }
  }, [assetPaths])

  return { isLoading, error }
}

export default useAssetLoader
