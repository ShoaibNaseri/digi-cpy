import { useState, useEffect } from 'react'
import { getActionImage } from '@/utils/gameImagesRegistry'
import { useAssetLoader } from '@/utils/assetLoader'
import './ActionPreloader.css'

const ActionPreloader = ({ actionData, onComplete, onError }) => {
  const [assetsToLoad, setAssetsToLoad] = useState([])
  const { isLoading, progress, error, startLoading } =
    useAssetLoader(assetsToLoad)

  useEffect(() => {
    // Prepare assets list based on action data
    const assets = []

    // Handle both single actionData object and array of actionData objects
    const actionDataArray = Array.isArray(actionData)
      ? actionData
      : [actionData]

    actionDataArray.forEach((item) => {
      // Add image asset
      if (item?.image_url) {
        // Try to get image from registry first, fallback to original path
        const actionImage = getActionImage(item.image_url)
        const imagePath =
          actionImage ||
          (item.image_url.startsWith('/')
            ? item.image_url
            : `/src/assets/game/action_imgs/${item.image_url}`)
        assets.push(imagePath)
      }

      // Add sound asset if has_sound is true
      if (item?.has_sound && item?.sound_url) {
        const soundPath = item.sound_url.startsWith('/')
          ? item.sound_url
          : `/src/assets/game/game_sounds/${item.sound_url}`
        assets.push(soundPath)
      }
    })

    setAssetsToLoad(assets)
  }, [actionData])

  useEffect(() => {
    if (assetsToLoad.length > 0) {
      startLoading()
    }
  }, [assetsToLoad, startLoading])

  useEffect(() => {
    if (!isLoading && assetsToLoad.length > 0) {
      if (error) {
        onError?.(error)
      } else {
        onComplete?.()
      }
    }
  }, [isLoading, error, onComplete, onError, assetsToLoad.length])

  useEffect(() => {
    if (assetsToLoad.length === 0) {
      // No assets to load, complete immediately
      onComplete?.()
    }
  }, [assetsToLoad.length, onComplete])

  if (assetsToLoad.length === 0) {
    return null
  }

  return (
    <div className='action-preloader'>
      <div className='preloader-content'>
        <div className='preloader-spinner'></div>
        <div className='preloader-text'>Loading action assets...</div>
        <div className='preloader-progress'>
          <div
            className='preloader-progress-bar'
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className='preloader-percentage'>{Math.round(progress)}%</div>
      </div>
    </div>
  )
}

export default ActionPreloader
