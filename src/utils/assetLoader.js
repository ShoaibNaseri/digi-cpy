import { useState } from 'react'

/**
 * Asset Loading Utility
 * Handles loading of various game assets (images, audio, etc.)
 */

/**
 * Load a single asset
 * @param {string} assetUrl - URL of the asset to load
 * @returns {Promise} - Promise that resolves when asset is loaded
 */
const loadAsset = (assetUrl) => {
  return new Promise((resolve, reject) => {
    const isAudio = assetUrl.match(/\.(mp3|wav|m4a|ogg)$/i)
    const isImage = assetUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)

    if (isImage) {
      const img = new Image()
      img.onload = () => resolve(assetUrl)
      img.onerror = () => reject(new Error(`Failed to load image: ${assetUrl}`))
      img.src = assetUrl
    } else if (isAudio) {
      const audio = new Audio()
      audio.oncanplaythrough = () => resolve(assetUrl)
      audio.onerror = () =>
        reject(new Error(`Failed to load audio: ${assetUrl}`))
      audio.src = assetUrl
    } else {
      // For other assets, try to fetch them
      fetch(assetUrl)
        .then((response) => {
          if (response.ok) {
            resolve(assetUrl)
          } else {
            reject(new Error(`Failed to load asset: ${assetUrl}`))
          }
        })
        .catch((error) => reject(error))
    }
  })
}

/**
 * Load multiple assets
 * @param {string[]} assets - Array of asset URLs to load
 * @param {function} onProgress - Optional callback for progress updates
 * @returns {Promise} - Promise that resolves when all assets are loaded
 */
export const loadGameAssets = async (assets, onProgress = null) => {
  if (!assets || assets.length === 0) {
    return Promise.resolve()
  }

  let loadedCount = 0

  for (const asset of assets) {
    try {
      await loadAsset(asset)
      loadedCount++

      if (onProgress) {
        onProgress({
          loaded: loadedCount,
          total: assets.length,
          progress: (loadedCount / assets.length) * 100,
          currentAsset: asset
        })
      }
    } catch (error) {
      console.warn(`Failed to load asset: ${asset}`, error)
      loadedCount++

      if (onProgress) {
        onProgress({
          loaded: loadedCount,
          total: assets.length,
          progress: (loadedCount / assets.length) * 100,
          currentAsset: asset,
          error: error
        })
      }
    }
  }

  return Promise.resolve()
}

/**
 * Hook for loading assets with state management
 * @param {string[]} assets - Array of asset URLs to load
 * @returns {object} - { isLoading, progress, error, startLoading }
 */
export const useAssetLoader = (assets = []) => {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const startLoading = async () => {
    if (!assets || assets.length === 0) return

    setIsLoading(true)
    setProgress(0)
    setError(null)

    try {
      await loadGameAssets(assets, (progressData) => {
        setProgress(progressData.progress)
        if (progressData.error) {
          setError(progressData.error)
        }
      })
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    progress,
    error,
    startLoading
  }
}

export default loadGameAssets
