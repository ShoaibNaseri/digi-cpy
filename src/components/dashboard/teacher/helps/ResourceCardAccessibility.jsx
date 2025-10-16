// ResourceCardAccessibility.jsx
// Add this component to TeacherHelpCenter to enhance accessibility of resource cards

import React, { useEffect } from 'react'

const ResourceCardAccessibility = () => {
  useEffect(() => {
    // Function to enhance resource cards accessibility
    const enhanceResourceCards = () => {
      const resourceCards = document.querySelectorAll(
        '.teacher-helpcenter-resource-card'
      )

      resourceCards.forEach((card) => {
        // Add essential accessibility attributes
        card.setAttribute('role', 'button')
        card.setAttribute('tabindex', '0')

        // Make SVGs not focusable
        const svg = card.querySelector('svg')
        if (svg) {
          svg.setAttribute('focusable', 'false')
          svg.setAttribute('aria-hidden', 'true')
        }

        // Ensure keyboard navigation works
        if (!card.hasAttribute('data-keyboard-enhanced')) {
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              card.click()
            }
          })
          card.setAttribute('data-keyboard-enhanced', 'true')
        }
      })
    }

    // Run immediately and also set up for dynamic content
    enhanceResourceCards()

    // Set up a MutationObserver to handle dynamically added cards
    const observer = new MutationObserver(() => {
      enhanceResourceCards()
    })

    // Start observing the document body for DOM changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [])

  return null // This is a utility component with no visible UI
}

export default ResourceCardAccessibility
