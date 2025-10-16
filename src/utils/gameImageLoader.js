import {
  characterImages,
  backgroundImages,
  articleImages
} from './gameImagesRegistry'

/**
 * Preloads a set of images and reports progress
 *
 * @param {Array} imageUrls - Image URLs to preload
 * @param {Function} onProgress - Progress callback (0-100)
 * @param {Function} onComplete - Called when all images are loaded
 * @param {Function} onError - Called on error with error message
 */
export const preloadImages = (imageUrls, onProgress, onComplete, onError) => {
  const totalImages = imageUrls.length
  let loadedImages = 0

  // If no images to load, complete immediately
  if (totalImages === 0) {
    onProgress(100)
    onComplete()
    return
  }

  console.log(`Starting to preload ${totalImages} images`)

  imageUrls.forEach((imageUrl) => {
    const img = new Image()

    img.onload = () => {
      loadedImages++
      const progress = Math.floor((loadedImages / totalImages) * 100)
      onProgress(progress)
      console.log(
        `Loaded image ${loadedImages}/${totalImages}: ${progress}% complete`
      )

      if (loadedImages === totalImages) {
        console.log('All images loaded successfully')
        onComplete()
      }
    }

    img.onerror = (error) => {
      console.error(`Failed to load image: ${imageUrl}`, error)

      // Call onError but continue with other images
      if (onError) {
        onError(`Failed to load image: ${imageUrl}`)
      }

      // Still count this image as "loaded" for progress calculation
      loadedImages++
      const progress = Math.floor((loadedImages / totalImages) * 100)
      onProgress(progress)
      console.log(
        `Failed to load image ${loadedImages}/${totalImages}: ${progress}% complete`
      )

      if (loadedImages === totalImages) {
        console.log('All images processed (with some failures)')
        onComplete()
      }
    }

    img.src = imageUrl
  })
}

/**
 * Preloads all images needed for a specific mission
 *
 * @param {Object} missionData - The mission data containing characters and backgrounds
 * @param {Function} onProgress - Progress callback (0-100)
 * @param {Function} onComplete - Called when all images are loaded
 * @param {Function} onError - Called on error with error message
 */
export const preloadMissionImages = (
  missionData,
  onProgress,
  onComplete,
  onError
) => {
  // Extract background and character images from mission data
  const imagesToLoad = []
  const uniqueImageCheck = new Set()

  // Log the registry for debugging
  console.log('Background images registry:', Object.keys(backgroundImages))
  console.log('Character images registry:', Object.keys(characterImages))
  console.log('Article images registry:', Object.keys(articleImages))

  // Add common backgrounds
  Object.values(backgroundImages).forEach((img) => {
    // Skip if it's not a string (some might be objects)
    if (typeof img === 'string' || img instanceof String) {
      if (!uniqueImageCheck.has(img)) {
        imagesToLoad.push(img)
        uniqueImageCheck.add(img)
      }
    }
  })

  // Add article images
  Object.values(articleImages).forEach((img) => {
    if (typeof img === 'string' || img instanceof String) {
      if (!uniqueImageCheck.has(img)) {
        imagesToLoad.push(img)
        uniqueImageCheck.add(img)
      }
    }
  })

  // Add article profile image from mission data if exists
  if (missionData?.article?.profile_image) {
    const profileImg = articleImages[missionData.article.profile_image]
    if (profileImg && !uniqueImageCheck.has(profileImg)) {
      console.log(
        `Adding article profile image: ${missionData.article.profile_image}`
      )
      imagesToLoad.push(profileImg)
      uniqueImageCheck.add(profileImg)
    }
  }

  // Process mission scenes to extract character images and backgrounds
  if (missionData?.scenes) {
    console.log(`Processing ${missionData.scenes.length} scenes for images`)

    missionData.scenes.forEach((scene, index) => {
      console.log(
        `Scene ${index + 1} (ID: ${scene.id}) - Background: ${scene.background}`
      )

      // Add scene background
      if (scene.background) {
        const bgImage = backgroundImages[scene.background]
        if (bgImage) {
          console.log(`Found background image for ${scene.background}`)
          if (!uniqueImageCheck.has(bgImage)) {
            imagesToLoad.push(bgImage)
            uniqueImageCheck.add(bgImage)
          }
        } else {
          console.warn(`Background not found for: ${scene.background}`)
        }
      }

      // Add character images
      if (scene.characters) {
        console.log(
          `Processing ${Object.keys(scene.characters).length} characters`
        )

        Object.values(scene.characters).forEach((character) => {
          if (character.image) {
            console.log(`Looking for character image: ${character.image}`)
            const charImg = characterImages[character.image]
            if (charImg) {
              console.log(`Found character image for ${character.image}`)
              if (!uniqueImageCheck.has(charImg)) {
                imagesToLoad.push(charImg)
                uniqueImageCheck.add(charImg)
              }
            } else {
              console.warn(`Character image not found for: ${character.image}`)
            }
          }
        })
      }
    })
  }

  // Convert image objects to URLs where needed and filter out any nulls
  const imageUrls = imagesToLoad.filter((img) => img != null)
  console.log(`Prepared ${imageUrls.length} images for preloading`)

  // Preload all these images
  preloadImages(imageUrls, onProgress, onComplete, onError)
}
