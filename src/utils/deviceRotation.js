import { useState, useEffect } from 'react'

/**
 * Checks if the device is considered mobile/tablet based on touch support
 * and max touch points. This is a common heuristic.
 * @returns {boolean} True if likely mobile/tablet, false otherwise.
 */
function isMobileDevice() {
  // Basic check for touch support and orientation API presence
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  // Check for orientation API, common on mobile devices
  const hasOrientation = 'orientation' in window || !!window.screen.orientation

  // Consider it mobile if it has touch AND orientation capabilities.
  // Adjust this logic if needed for more specific device targeting.
  return hasTouch && hasOrientation
}

/**
 * Custom hook to detect if a mobile device is in portrait orientation.
 * @returns {boolean} `true` if the device is mobile and in portrait mode, `false` otherwise.
 */
export function useDeviceRotation() {
  const [needsRotation, setNeedsRotation] = useState(false)

  useEffect(() => {
    // Only run checks if we determine it's likely a mobile device
    if (!isMobileDevice()) {
      setNeedsRotation(false) // Not a mobile device, no rotation needed
      return
    }

    const checkOrientation = () => {
      // Use screen.orientation for modern browsers
      if (window.screen.orientation) {
        // Check if type includes 'portrait'
        setNeedsRotation(window.screen.orientation.type.includes('portrait'))
      }
      // Fallback for older browsers using window.orientation
      else if (typeof window.orientation !== 'undefined') {
        // 0 and 180 degrees are portrait modes
        setNeedsRotation(window.orientation === 0 || window.orientation === 180)
      }
      // If neither is available, assume landscape or cannot determine
      else {
        setNeedsRotation(false)
      }
    }

    // Initial check
    checkOrientation()

    // Listen for orientation changes
    const handleOrientationChange = () => checkOrientation()

    // Modern API listener
    if (window.screen.orientation) {
      window.screen.orientation.addEventListener(
        'change',
        handleOrientationChange
      )
    }
    // Legacy API listener
    else {
      window.addEventListener('orientationchange', handleOrientationChange)
    }

    // Cleanup listeners on component unmount
    return () => {
      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener(
          'change',
          handleOrientationChange
        )
      } else {
        window.removeEventListener('orientationchange', handleOrientationChange)
      }
    }
  }, []) // Empty dependency array ensures this runs only once on mount

  return needsRotation
}

export default useDeviceRotation
