import React, { useEffect, useState } from 'react'
import './Accessibility.css'

/**
 * Enhanced Image Accessibility Hook - Only Active When Screen Reader Detected
 *
 * Enables screen reader support and visual tooltips for all images
 * ONLY when a screen reader is detected as active
 *
 * @param {String} containerId - Container element ID, if not provided applies to entire document
 * @param {Boolean} autoEnhance - Whether to automatically enhance all images (default true)
 * @param {Function} onImageClick - Optional callback for image clicks
 */
export function useImageAccessibility(containerId, autoEnhance = true, onImageClick = null) {
  // State to track if screen reader is detected
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false)

  useEffect(() => {
    // Function to detect screen reader
    const detectScreenReader = () => {
      // Method 1: Check for CSS animation events (used by some screen readers)
      let detected = false

      // Method 2: Check for specific properties set by screen readers
      if (
        document.querySelector('[aria-live]') ||
        document.documentElement.getAttribute('aria-hidden') === 'false' ||
        document.documentElement.getAttribute('aria-busy') === 'true'
      ) {
        detected = true
      }

      // Method 3: Check for keyboard navigation signals
      const keyboardNavigationListener = (e) => {
        // Tab key is often used with screen readers
        if (e.key === 'Tab') {
          detected = true
          document.removeEventListener('keydown', keyboardNavigationListener)
          setIsScreenReaderActive(true)
        }
      }
      document.addEventListener('keydown', keyboardNavigationListener)

      // Set initial detection state
      setIsScreenReaderActive(detected)

      // Return cleanup function
      return () => {
        document.removeEventListener('keydown', keyboardNavigationListener)
      }
    }

    // Run detection
    const cleanupDetection = detectScreenReader()

    // Early return if no screen reader detected and no container specified
    if (!isScreenReaderActive) {
      // Set up a periodic check for screen reader activation
      const checkInterval = setInterval(() => {
        detectScreenReader()
      }, 2000) // Check every 2 seconds

      return () => {
        clearInterval(checkInterval)
        if (cleanupDetection) cleanupDetection()
      }
    }

    // Determine the container to enhance (only if screen reader is active)
    const container = containerId
      ? document.getElementById(containerId)
      : document.body
    if (!container) return

    // Add accessibility features to all images (only if screen reader is active)
    const enhanceImages = () => {
      if (!isScreenReaderActive) return // Don't enhance if no screen reader

      // Query all images with alt text (excluding those without alt or empty alt which are decorative)
      const images = container.querySelectorAll('img[alt]:not([alt=""])')

      images.forEach((img) => {
        // Skip if already enhanced
        if (img.hasAttribute('data-a11y-enhanced')) return

        // Mark as enhanced to prevent duplicate processing
        img.setAttribute('data-a11y-enhanced', 'true')

        // Make focusable if not already
        if (!img.hasAttribute('tabindex')) {
          img.setAttribute('tabindex', '0')
        }

        // Create a unique ID for ARIA attributes if needed
        const descId =
          img.getAttribute('aria-describedby') ||
          `img-desc-${Math.random().toString(36).substring(2, 9)}`

        // Ensure alt text is available for screen readers in multiple ways
        // 1. Set both aria-label and aria-describedby for maximum compatibility
        const altText = img.getAttribute('alt')
        img.setAttribute('aria-label', altText)
        img.setAttribute('aria-describedby', descId)

        // 2. Also add role="img" to emphasize this is an image to screen readers
        img.setAttribute('role', 'img')

        // Add hover and focus event listeners for tooltip display ONLY if screen reader is active
        img.addEventListener('mouseenter', showTooltip)
        img.addEventListener('mouseleave', hideTooltip)
        img.addEventListener('focus', showTooltip)
        img.addEventListener('blur', hideTooltip)

        // Check if a description element already exists
        let descElement = document.getElementById(descId)

        // Create the description element if it doesn't exist
        if (!descElement) {
          descElement = document.createElement('span')
          descElement.id = descId
          descElement.className = 'sr-only' // Screen reader only
          descElement.textContent = altText

          // Set specific attributes for Chrome Screen Reader
          descElement.setAttribute('aria-hidden', 'false')

          // Insert after the image
          img.insertAdjacentElement('afterend', descElement)
        }

        // Add a click handler that announces the alt text
        // This helps with some screen readers that may not automatically read alt on focus
        img.addEventListener('click', (e) => {
          // Always announce alt text on click when screen reader is active
          if (isScreenReaderActive) {
            // Create and trigger a live region announcement (works well with Chrome Screen Reader)
            announceForScreenReader(altText)

            // If custom onImageClick callback provided, call it
            if (onImageClick) {
              onImageClick(e, altText, img)
            }
          }
        })
      })
    }

    // Function to announce text for screen readers
    const announceForScreenReader = (text) => {
      // Only proceed if screen reader is active
      if (!isScreenReaderActive) return
      
      // Check if we already have an announcer
      let announcer = document.getElementById('screen-reader-announcer')

      if (!announcer) {
        // Create a live region announcer
        announcer = document.createElement('div')
        announcer.id = 'screen-reader-announcer'
        announcer.setAttribute('aria-live', 'assertive')
        announcer.setAttribute('role', 'status')
        announcer.className = 'sr-only'
        document.body.appendChild(announcer)
      }

      // Clear and set content to ensure announcement
      announcer.textContent = ''
      // Use setTimeout to ensure the DOM update triggers an announcement
      setTimeout(() => {
        announcer.textContent = text
      }, 50)
    }

    // Function to show tooltip - ONLY if screen reader is active
    const showTooltip = (e) => {
      // STRICT CHECK - Only show tooltip if screen reader is active
      if (!isScreenReaderActive) return

      const img = e.target
      const altText = img.getAttribute('alt')

      if (!altText) return

      // Check if tooltip already exists
      let tooltip = document.getElementById(
        `tooltip-${img.getAttribute('aria-describedby')}`
      )

      // Create tooltip if it doesn't exist
      if (!tooltip) {
        tooltip = document.createElement('div')
        tooltip.id = `tooltip-${img.getAttribute('aria-describedby')}`
        tooltip.className = 'img-tooltip sr-active' // Added sr-active class here
        tooltip.setAttribute('role', 'tooltip') // Add ARIA role for tooltips
        tooltip.textContent = altText
        document.body.appendChild(tooltip)
      }

      // Position tooltip at the center of the image
      const rect = img.getBoundingClientRect()
      tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`
      tooltip.style.top = `${rect.top + window.scrollY + rect.height / 2}px`
      tooltip.style.display = 'block'
      tooltip.style.zIndex = '9999'

      // Announce for screen readers when tooltip shows on focus (keyboard navigation)
      if (e.type === 'focus') {
        announceForScreenReader(`图片: ${altText}`) // Adding a prefix makes it clearer in Chinese
      }
    }

    // Function to hide tooltip
    const hideTooltip = (e) => {
      // Only proceed if screen reader is active
      if (!isScreenReaderActive) return
      
      const img = e.target
      const tooltipId = `tooltip-${img.getAttribute('aria-describedby')}`
      const tooltip = document.getElementById(tooltipId)

      if (tooltip) {
        tooltip.style.display = 'none'
      }
    }

    // Initialize images only if screen reader is active
    if (autoEnhance && isScreenReaderActive) {
      enhanceImages()
    }

    // Observe DOM changes to apply to newly added images
    const observer = new MutationObserver((mutations) => {
      if (autoEnhance && isScreenReaderActive) {
        enhanceImages()
      }
    })

    observer.observe(container, { childList: true, subtree: true })

    // Cleanup function
    return () => {
      observer.disconnect()

      // Remove event listeners from all enhanced images
      const images = container.querySelectorAll(
        'img[data-a11y-enhanced="true"]'
      )
      images.forEach((img) => {
        img.removeEventListener('mouseenter', showTooltip)
        img.removeEventListener('mouseleave', hideTooltip)
        img.removeEventListener('focus', showTooltip)
        img.removeEventListener('blur', hideTooltip)
        img.removeEventListener('click', announceForScreenReader)
      })

      // Remove all tooltips
      const tooltips = document.querySelectorAll('.img-tooltip')
      tooltips.forEach((tooltip) => {
        tooltip.remove()
      })

      // Remove announcer
      const announcer = document.getElementById('screen-reader-announcer')
      if (announcer) {
        announcer.remove()
      }
    }
  }, [containerId, autoEnhance, isScreenReaderActive, onImageClick])

  return { isScreenReaderActive }
}

/**
 * AccessibleImages Component - Only Active When Screen Reader Detected
 *
 * A wrapper component that adds image accessibility features to its content
 * ONLY when a screen reader is active
 *
 * @param {Object} props
 * @param {String} props.id - Container ID
 * @param {React.ReactNode} props.children - Child elements
 * @param {Boolean} props.autoEnhance - Whether to automatically enhance all images
 * @param {String} props.className - Additional CSS class name
 * @param {Object} props.style - Inline styles
 * @param {Function} props.onImageClick - Optional callback for image clicks
 */
export function AccessibleImages({
  id,
  children,
  autoEnhance = true,
  className = '',
  style = {},
  onImageClick = null
}) {
  const { isScreenReaderActive } = useImageAccessibility(id, autoEnhance, onImageClick)

  return (
    <div
      id={id}
      className={`image-accessibility-container ${className} ${
        isScreenReaderActive ? 'sr-active' : ''
      }`}
      style={{ display: 'contents', ...style }}
      data-screen-reader-active={isScreenReaderActive ? 'true' : 'false'}
    >
      {children}
    </div>
  )
}

/**
 * Individual accessible image component - Only Active When Screen Reader Detected
 */
export function AccessibleImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  onClick,
  ...props
}) {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false)

  // Check for screen reader on mount
  useEffect(() => {
    const detectScreenReader = () => {
      // Similar detection methods as in the hook
      const detected =
        document.querySelector('[aria-live]') ||
        document.documentElement.getAttribute('aria-hidden') === 'false' ||
        document.documentElement.getAttribute('aria-busy') === 'true'

      setIsScreenReaderActive(detected)

      // Continue checking periodically
      if (!detected) {
        const interval = setInterval(() => {
          const newDetection =
            document.querySelector('[aria-live]') ||
            document.documentElement.getAttribute('aria-hidden') === 'false' ||
            document.documentElement.getAttribute('aria-busy') === 'true'

          if (newDetection) {
            setIsScreenReaderActive(true)
            clearInterval(interval)
          }
        }, 2000)

        return () => clearInterval(interval)
      }
    }

    detectScreenReader()
  }, [])

  // Handle both custom onClick and accessibility announcement
  const handleClick = (e) => {
    // Always announce alt text on click when screen reader is active
    if (isScreenReaderActive) {
      // Announce alt text for screen readers
      const announcer = document.getElementById('screen-reader-announcer')
      if (!announcer) {
        // Create announcer if it doesn't exist
        const newAnnouncer = document.createElement('div')
        newAnnouncer.id = 'screen-reader-announcer'
        newAnnouncer.setAttribute('aria-live', 'assertive')
        newAnnouncer.setAttribute('role', 'status')
        newAnnouncer.className = 'sr-only'
        document.body.appendChild(newAnnouncer)
        
        // Use the newly created announcer
        setTimeout(() => {
          newAnnouncer.textContent = `图片: ${alt}`
        }, 50)
      } else {
        // Use existing announcer
        announcer.textContent = ''
        setTimeout(() => {
          announcer.textContent = `图片: ${alt}`
        }, 50)
      }
    }

    // Call original onClick if provided
    if (onClick) {
      onClick(e)
    }
  }

  // Only add accessibility attributes if screen reader is active
  const accessibilityProps = isScreenReaderActive
    ? {
        'aria-label': alt,
        role: 'img',
        'data-a11y-enhanced': 'true',
        tabIndex: '0'
      }
    : {}

  return (
    <img
      src={src}
      alt={alt}
      className={`accessible-image ${className} ${
        isScreenReaderActive ? 'sr-active' : ''
      }`}
      loading={loading}
      onClick={handleClick}
      data-screen-reader-active={isScreenReaderActive ? 'true' : 'false'}
      {...accessibilityProps}
      {...props}
    />
  )
}

export default useImageAccessibility