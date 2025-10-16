// tabNavigation.jsx
import React, { useEffect } from 'react'
import './tabNavigation.css'

/**
 * Enhanced Tab Navigation Hook - Application-wide version
 *
 * Enables tab navigation for elements within the entire application or a specified container,
 * with visual indicators for focus states
 *
 * @param {String} containerId - Container element ID, if not provided applies to entire document
 * @param {Boolean} autoEnhance - Whether to automatically enhance all interactive elements (default true)
 */
export function useTabNavigation(containerId, autoEnhance = true) {
  useEffect(() => {
    // Determine the container to enhance
    const container = containerId
      ? document.getElementById(containerId)
      : document.body
    if (!container) return

    // Ensure the resource cards are accessible first (immediately before observer setup)
    const enhanceResourceCards = () => {
      const resourceCards = document.querySelectorAll(
        '.teacher-helpcenter-resource-card'
      )
      resourceCards.forEach((card) => {
        card.setAttribute('role', 'button')
        card.setAttribute('tabindex', '0')

        // Ensure SVGs inside are not focusable
        const svg = card.querySelector('svg')
        if (svg) {
          svg.setAttribute('focusable', 'false')
          svg.setAttribute('aria-hidden', 'true')
        }

        // Add keyboard event listener directly
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

    // Add tabindex to interactive elements
    const makeElementsTabbable = () => {
      // Query selectors for tabbable elements
      const selectors = [
        'button:not([tabindex]):not([disabled])',
        'div[role="button"]:not([tabindex]):not([aria-disabled="true"]):not(.disabled)',
        'a:not([tabindex]):not([aria-disabled="true"]):not(.disabled)',
        'input:not([tabindex]):not([disabled])',
        'select:not([tabindex]):not([disabled])',
        '.teacher-planner__mission-tag:not([tabindex])',
        '.dropdown-item:not([tabindex]):not([aria-disabled="true"]):not(.disabled)',
        '.menu-item:not([tabindex]):not([aria-disabled="true"]):not(.disabled)', // Menu items
        '.sidebar-menu-item:not([tabindex]):not([aria-disabled="true"]):not(.disabled)', // Added sidebar menu items
        '[data-make-tabbable]:not([tabindex]):not([aria-disabled="true"]):not(.disabled)',
        '.mission:not([tabindex]):not([aria-disabled="true"]):not(.disabled)', // Added mission cards
        '.mission__container:not([tabindex]):not([aria-disabled="true"]):not(.disabled)', // Added mission container
        '.quiz-card:not([tabindex]):not([aria-disabled="true"]):not(.disabled):not(.quiz-card--expired)', // Added quiz cards
        '.conversation-sidebar__item:not([tabindex]):not([aria-disabled="true"]):not(.disabled)', // Added conversation items
        '.faq__button:not([tabindex]):not([disabled])', // Added FAQ buttons
        '.teacher-helpcenter-resource-card', // Added resource cards (without filters for tabindex to ensure selection)
        '.teacher-helpcenter-faq-question:not([tabindex]):not([aria-disabled="true"]):not(.disabled)', // Added FAQ questions
        '.register__role-option:not([tabindex]):not([aria-disabled="true"]):not(.disabled)' // Added role option selectors
      ]

      // Find all elements within the container
      const elements = container.querySelectorAll(selectors.join(', '))

      // Add tabindex to elements
      elements.forEach((el) => {
        el.setAttribute('tabindex', '0')

        // Fix cursor style for menu and sidebar items
        if (
          el.classList.contains('menu-item') ||
          el.classList.contains('sidebar-menu-item')
        ) {
          el.style.cursor = 'pointer'
        }

        // If it's a button-like element without keydown event, add keyboard event handling
        if (
          autoEnhance &&
          (el.tagName === 'BUTTON' ||
            el.getAttribute('role') === 'button' ||
            el.classList.contains('teacher-planner__mission-tag') ||
            el.classList.contains('dropdown-item') ||
            el.classList.contains('menu-item') ||
            el.classList.contains('sidebar-menu-item') ||
            el.classList.contains('mission') ||
            el.classList.contains('mission__container') ||
            el.classList.contains('quiz-card') ||
            el.classList.contains('conversation-sidebar__item') ||
            el.classList.contains('faq__button') ||
            el.classList.contains('teacher-helpcenter-resource-card') ||
            el.classList.contains('teacher-helpcenter-faq-question') ||
            el.hasAttribute('data-make-tabbable'))
        ) {
          // Check if element already has keyboard handling
          if (!el.hasAttribute('data-keyboard-enhanced')) {
            el.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                el.click()
              }
            })
            el.setAttribute('data-keyboard-enhanced', 'true')
          }
        }
      })

      // Special handling for button groups, such as Seat Type selector
      const buttonGroups = container.querySelectorAll(
        '.tcr-seat-type-buttons, .tcr-frequency-button-group'
      )
      buttonGroups.forEach((group) => {
        const buttons = group.querySelectorAll('button')
        buttons.forEach((button) => {
          // Ensure all buttons have correct ARIA attributes
          if (button.classList.contains('active')) {
            button.setAttribute('aria-pressed', 'true')
          } else {
            button.setAttribute('aria-pressed', 'false')
          }
        })
      })

      // Special handling for menu items with no explicit role
      const menuItems = container.querySelectorAll(
        '.menu-item:not([aria-disabled="true"]):not(.disabled), .sidebar-menu-item:not([aria-disabled="true"]):not(.disabled)'
      )
      menuItems.forEach((item) => {
        // Add role button if no role exists
        if (!item.getAttribute('role')) {
          item.setAttribute('role', 'button')
        }

        // Fix any menu items with default cursor
        if (window.getComputedStyle(item).cursor === 'default') {
          item.style.cursor = 'pointer'
        }
      })

      // Special handling for mission cards
      const missionCards = container.querySelectorAll(
        '.mission:not([aria-disabled="true"]):not(.disabled)'
      )
      missionCards.forEach((card) => {
        // Add role button if no role exists
        if (!card.getAttribute('role')) {
          card.setAttribute('role', 'button')
        }

        // Add selected state
        if (card.classList.contains('mission--selected')) {
          card.setAttribute('aria-pressed', 'true')
        } else {
          card.setAttribute('aria-pressed', 'false')
        }

        // Fix cursor if needed
        if (window.getComputedStyle(card).cursor === 'default') {
          card.style.cursor = 'pointer'
        }
      })

      // Special handling for quiz cards
      const quizCards = container.querySelectorAll(
        '.quiz-card:not(.quiz-card--expired)'
      )
      quizCards.forEach((card) => {
        // Add role button if no role exists
        if (!card.getAttribute('role')) {
          card.setAttribute('role', 'button')
        }

        // Fix cursor if needed
        if (window.getComputedStyle(card).cursor === 'default') {
          card.style.cursor = 'pointer'
        }
      })

      // Special handling for conversation sidebar items
      const conversationItems = container.querySelectorAll(
        '.conversation-sidebar__item:not([aria-disabled="true"]):not(.disabled)'
      )
      conversationItems.forEach((item) => {
        // Add role button if no role exists
        if (!item.getAttribute('role')) {
          item.setAttribute('role', 'button')
        }

        // Add active state
        if (item.classList.contains('active')) {
          item.setAttribute('aria-pressed', 'true')
        } else {
          item.setAttribute('aria-pressed', 'false')
        }

        // Fix cursor if needed
        if (window.getComputedStyle(item).cursor === 'default') {
          item.style.cursor = 'pointer'
        }
      })

      // Special handling for FAQ buttons
      const faqButtons = container.querySelectorAll('.faq__button')
      faqButtons.forEach((button) => {
        // Add role button if no role exists
        if (!button.getAttribute('role')) {
          button.setAttribute('role', 'button')
        }

        // Fix cursor if needed
        if (window.getComputedStyle(button).cursor === 'default') {
          button.style.cursor = 'pointer'
        }
      })

      // Special handling for Teacher Help Center resource cards
      const resourceCards = container.querySelectorAll(
        '.teacher-helpcenter-resource-card'
      )
      resourceCards.forEach((card) => {
        // Add role button if no role exists
        if (!card.getAttribute('role')) {
          card.setAttribute('role', 'button')
        }

        // Force tabindex and keyboard enhancement
        card.setAttribute('tabindex', '0')

        // Ensure SVG inside is not focusable
        const svg = card.querySelector('svg')
        if (svg) {
          svg.setAttribute('focusable', 'false')
          svg.setAttribute('aria-hidden', 'true')
        }

        // Add keyboard event listener directly
        if (!card.hasAttribute('data-keyboard-enhanced')) {
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              card.click()
            }
          })
          card.setAttribute('data-keyboard-enhanced', 'true')
        }

        // Fix cursor if needed
        if (window.getComputedStyle(card).cursor === 'default') {
          card.style.cursor = 'pointer'
        }
      })

      // Special handling for Teacher Help Center FAQ questions
      const faqQuestions = container.querySelectorAll(
        '.teacher-helpcenter-faq-question'
      )
      faqQuestions.forEach((question) => {
        // Add role button if no role exists
        if (!question.getAttribute('role')) {
          question.setAttribute('role', 'button')
        }
      })

      // Handle disabled menu items
      const disabledMenuItems = container.querySelectorAll(
        '.menu-item.disabled, .menu-item[aria-disabled="true"], .sidebar-menu-item.disabled, .sidebar-menu-item[aria-disabled="true"]'
      )
      disabledMenuItems.forEach((item) => {
        // Remove tabindex and keyboard handlers from disabled items
        item.removeAttribute('tabindex')
        item.removeEventListener('keydown', null)
        item.removeAttribute('data-keyboard-enhanced')
        // Ensure it has the proper aria attribute
        item.setAttribute('aria-disabled', 'true')
      })

      // Handle locked mission cards
      const lockedMissions = container.querySelectorAll(
        '.mission.mission--locked'
      )
      lockedMissions.forEach((mission) => {
        mission.setAttribute('aria-disabled', 'true')
        if (mission.getAttribute('tabindex') === '0') {
          mission.setAttribute('tabindex', '-1')
        }
      })

      // Handle expired quiz cards
      const expiredQuizCards = container.querySelectorAll(
        '.quiz-card.quiz-card--expired'
      )
      expiredQuizCards.forEach((card) => {
        card.setAttribute('aria-disabled', 'true')
        if (card.getAttribute('tabindex') === '0') {
          card.setAttribute('tabindex', '-1')
        }
        // Remove keyboard handlers
        card.removeEventListener('keydown', null)
        card.removeAttribute('data-keyboard-enhanced')
      })
    }

    // Handle focus events
    const handleFocus = (e) => {
      // Ensure target element is in our container
      if (container.contains(e.target)) {
        // Remove focus style from all elements
        const focused = document.querySelectorAll(
          '.tab-focus, .tab-focus-positioned'
        )
        focused.forEach((el) => {
          el.classList.remove('tab-focus')
          el.classList.remove('tab-focus-positioned')
        })

        // Add style to current focus element
        e.target.classList.add('tab-focus')

        // Add positioning class only to elements that need it
        const safeForPositioning = [
          '.mission',
          '.mission__container',
          '.sidebar-menu-item',
          '.quiz-card',
          '.conversation-sidebar__item',
          '.teacher-helpcenter-resource-card'
        ]

        const shouldPosition = safeForPositioning.some(
          (selector) => e.target.matches(selector) || e.target.closest(selector)
        )

        if (shouldPosition) {
          e.target.classList.add('tab-focus-positioned')
        }
      }
    }

    const handleBlur = (e) => {
      // If the new focus element is not in the container, remove all focus styles
      setTimeout(() => {
        const activeElement = document.activeElement
        if (!container.contains(activeElement)) {
          const focused = container.querySelectorAll('.tab-focus')
          focused.forEach((el) => el.classList.remove('tab-focus'))
        }
      }, 0)
    }

    // Enhanced keyboard handling, especially for button groups and menu items
    const handleKeyDown = (e) => {
      // ESC key closes modal dialogs
      if (e.key === 'Escape') {
        // Find all modal dialogs
        const modals = container.querySelectorAll(
          '.modal-overlay, [role="dialog"][aria-modal="true"]'
        )
        if (modals.length > 0) {
          // Find the close button in the modal dialog and simulate a click
          modals.forEach((modal) => {
            const closeButton = modal.querySelector(
              'button[aria-label*="close" i], button[aria-label*="cancel" i], .teacher-planner__close-modal-btn'
            )
            if (closeButton) {
              closeButton.click()
            }
          })
        }
      }

      // Enhanced menu navigation with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const target = e.target
        if (
          target.classList.contains('menu-item') ||
          target.classList.contains('sidebar-menu-item')
        ) {
          // Find all menu items in the same menu container
          const parentMenu =
            target.closest('.accessible-menu') || findMenuContainer(target)
          if (!parentMenu) return

          const menuItems = Array.from(
            parentMenu.querySelectorAll(
              '.menu-item[tabindex="0"]:not(.disabled):not([aria-disabled="true"]), .sidebar-menu-item[tabindex="0"]:not(.disabled):not([aria-disabled="true"])'
            )
          )
          const currentIndex = menuItems.indexOf(target)
          let nextIndex

          // Determine menu orientation
          const isVertical =
            parentMenu.getAttribute('data-orientation') === 'vertical' ||
            window.getComputedStyle(parentMenu).flexDirection === 'column'

          // Set appropriate keys based on orientation
          const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
          const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'

          if (e.key === nextKey) {
            nextIndex = (currentIndex + 1) % menuItems.length
          } else if (e.key === prevKey) {
            nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length
          } else {
            return // Not navigating in the right direction for this menu
          }

          if (menuItems[nextIndex]) {
            e.preventDefault()
            menuItems[nextIndex].focus()
          }
        }

        // Mission card grid navigation
        if (target.classList.contains('mission')) {
          const missionGrid = findMissionGrid(target)
          if (!missionGrid) return

          const missions = Array.from(
            missionGrid.querySelectorAll(
              '.mission[tabindex="0"]:not(.mission--locked)'
            )
          )
          const currentIndex = missions.indexOf(target)

          // Determine grid layout
          const gridColumns = getComputedGridColumns(missionGrid)
          let nextIndex = currentIndex

          if (e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % missions.length
          } else if (e.key === 'ArrowLeft') {
            nextIndex = (currentIndex - 1 + missions.length) % missions.length
          } else if (e.key === 'ArrowDown') {
            nextIndex = Math.min(
              missions.length - 1,
              currentIndex + gridColumns
            )
          } else if (e.key === 'ArrowUp') {
            nextIndex = Math.max(0, currentIndex - gridColumns)
          }

          if (nextIndex !== currentIndex && missions[nextIndex]) {
            e.preventDefault()
            missions[nextIndex].focus()
          }
        }

        // Quiz card grid navigation
        if (target.classList.contains('quiz-card')) {
          const quizGrid = findQuizGrid(target)
          if (!quizGrid) return

          const quizCards = Array.from(
            quizGrid.querySelectorAll(
              '.quiz-card[tabindex="0"]:not(.quiz-card--expired)'
            )
          )
          const currentIndex = quizCards.indexOf(target)

          // Determine grid layout
          const gridColumns = getComputedGridColumns(quizGrid)
          let nextIndex = currentIndex

          if (e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % quizCards.length
          } else if (e.key === 'ArrowLeft') {
            nextIndex = (currentIndex - 1 + quizCards.length) % quizCards.length
          } else if (e.key === 'ArrowDown') {
            nextIndex = Math.min(
              quizCards.length - 1,
              currentIndex + gridColumns
            )
          } else if (e.key === 'ArrowUp') {
            nextIndex = Math.max(0, currentIndex - gridColumns)
          }

          if (nextIndex !== currentIndex && quizCards[nextIndex]) {
            e.preventDefault()
            quizCards[nextIndex].focus()
          }
        }

        // Conversation sidebar item navigation
        if (target.classList.contains('conversation-sidebar__item')) {
          const sidebarList = target.closest('.conversation-sidebar__list')
          if (!sidebarList) return

          const conversationItems = Array.from(
            sidebarList.querySelectorAll(
              '.conversation-sidebar__item[tabindex="0"]:not([aria-disabled="true"])'
            )
          )
          const currentIndex = conversationItems.indexOf(target)
          let nextIndex = currentIndex

          if (e.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % conversationItems.length
          } else if (e.key === 'ArrowUp') {
            nextIndex =
              (currentIndex - 1 + conversationItems.length) %
              conversationItems.length
          }

          if (nextIndex !== currentIndex && conversationItems[nextIndex]) {
            e.preventDefault()
            conversationItems[nextIndex].focus()
          }
        }

        // FAQ button navigation
        if (target.classList.contains('faq__button')) {
          const faqList = target.closest('.faq__list')
          if (!faqList) return

          const faqButtons = Array.from(
            faqList.querySelectorAll(
              '.faq__button[tabindex="0"]:not([disabled])'
            )
          )
          const currentIndex = faqButtons.indexOf(target)
          let nextIndex = currentIndex

          if (e.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % faqButtons.length
          } else if (e.key === 'ArrowUp') {
            nextIndex =
              (currentIndex - 1 + faqButtons.length) % faqButtons.length
          }

          if (nextIndex !== currentIndex && faqButtons[nextIndex]) {
            e.preventDefault()
            faqButtons[nextIndex].focus()
          }
        }

        // Teacher Help Center resource cards navigation
        if (target.classList.contains('teacher-helpcenter-resource-card')) {
          const resourcesContainer = target.closest(
            '.teacher-helpcenter-resources'
          )
          if (!resourcesContainer) return

          const resourceCards = Array.from(
            resourcesContainer.querySelectorAll(
              '.teacher-helpcenter-resource-card[tabindex="0"]'
            )
          )
          const currentIndex = resourceCards.indexOf(target)
          let nextIndex = currentIndex

          // Determine if the resources are in row or column layout
          const isHorizontal = window.innerWidth > 768 // Based on the media query in CSS

          if (
            (isHorizontal && e.key === 'ArrowRight') ||
            (!isHorizontal && e.key === 'ArrowDown')
          ) {
            nextIndex = (currentIndex + 1) % resourceCards.length
          } else if (
            (isHorizontal && e.key === 'ArrowLeft') ||
            (!isHorizontal && e.key === 'ArrowUp')
          ) {
            nextIndex =
              (currentIndex - 1 + resourceCards.length) % resourceCards.length
          }

          if (nextIndex !== currentIndex && resourceCards[nextIndex]) {
            e.preventDefault()
            resourceCards[nextIndex].focus()
          }
        }

        // Teacher Help Center FAQ questions navigation
        if (target.classList.contains('teacher-helpcenter-faq-question')) {
          const faqContainer = target.closest('.teacher-helpcenter-faq-list')
          if (!faqContainer) return

          const faqQuestions = Array.from(
            faqContainer.querySelectorAll(
              '.teacher-helpcenter-faq-question[tabindex="0"]'
            )
          )
          const currentIndex = faqQuestions.indexOf(target)
          let nextIndex = currentIndex

          if (e.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % faqQuestions.length
          } else if (e.key === 'ArrowUp') {
            nextIndex =
              (currentIndex - 1 + faqQuestions.length) % faqQuestions.length
          }

          if (nextIndex !== currentIndex && faqQuestions[nextIndex]) {
            e.preventDefault()
            faqQuestions[nextIndex].focus()
          }
        }
      }
    }

    // Helper function to find a menu container for an item
    function findMenuContainer(element) {
      // Check if element is in a sidebar
      const sidebar = element.closest('.sidebar, .side-menu, .nav-menu')
      if (sidebar) return sidebar

      // Check if parent has multiple menu items
      let parent = element.parentElement
      while (parent && parent !== container) {
        const menuItems = parent.querySelectorAll(
          '.menu-item, .sidebar-menu-item'
        )
        if (menuItems.length > 1) return parent
        parent = parent.parentElement
      }

      return null
    }

    // Helper function to find a mission grid container
    function findMissionGrid(element) {
      let parent = element.parentElement
      while (parent && parent !== container) {
        // Check if the parent has multiple mission cards
        const missions = parent.querySelectorAll('.mission')
        if (missions.length > 1) return parent
        parent = parent.parentElement
      }
      return null
    }

    // Helper function to find a quiz grid container
    function findQuizGrid(element) {
      let parent = element.parentElement
      while (parent && parent !== container) {
        // Check if the parent has multiple quiz cards
        const quizCards = parent.querySelectorAll('.quiz-card')
        if (quizCards.length > 1) return parent
        parent = parent.parentElement
      }
      return null
    }

    // Helper function to calculate grid columns
    function getComputedGridColumns(gridElement) {
      const style = window.getComputedStyle(gridElement)
      if (style.display === 'grid') {
        const columns = style.gridTemplateColumns.split(' ').length
        return columns || 3 // Default to 3 if can't determine
      }
      return 3 // Default fallback
    }

    // Initialize elements
    makeElementsTabbable()
    enhanceResourceCards() // Directly apply to resource cards specifically

    // Observe DOM changes to apply to newly added elements
    const observer = new MutationObserver((mutations) => {
      makeElementsTabbable()
      enhanceResourceCards() // Ensure resource cards are always enhanced after DOM changes
    })
    observer.observe(container, { childList: true, subtree: true })

    // Add event listeners
    document.addEventListener('focus', handleFocus, true)
    document.addEventListener('blur', handleBlur, true)
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup function
    return () => {
      document.removeEventListener('focus', handleFocus, true)
      document.removeEventListener('blur', handleBlur, true)
      document.removeEventListener('keydown', handleKeyDown)
      observer.disconnect()
    }
  }, [containerId, autoEnhance])

  return null
}

/**
 * TabNav Component - Application-wide version
 *
 * A wrapper component that adds tab navigation functionality to its content
 *
 * @param {Object} props
 * @param {String} props.id - Container ID
 * @param {React.ReactNode} props.children - Child elements
 * @param {Boolean} props.addSkipLink - Whether to add a skip navigation link
 * @param {Boolean} props.autoEnhance - Whether to automatically enhance all interactive elements
 * @param {String} props.className - Additional CSS class name
 * @param {Object} props.style - Inline styles
 */
export function TabNav({
  id,
  children,
  addSkipLink = true,
  autoEnhance = true,
  className = '',
  style = {}
}) {
  useTabNavigation(id, autoEnhance)

  return (
    <div
      id={id}
      className={className}
      style={{ display: 'contents', ...style }}
    >
      {addSkipLink && (
        <a href='#main-content' className='skip-to-content' tabIndex='0'>
          Skip to main content
        </a>
      )}
      {children}
    </div>
  )
}

// Add additional component for easy menu navigation
export function AccessibleMenu({
  id,
  children,
  className = '',
  orientation = 'vertical',
  style = {}
}) {
  useEffect(() => {
    const menu = document.getElementById(id)
    if (!menu) return

    // Add proper ARIA attributes
    menu.setAttribute('role', 'menu')
    menu.setAttribute('data-orientation', orientation)

    // Setup menu items (excluding disabled items)
    const items = menu.querySelectorAll(
      '.menu-item:not([aria-disabled="true"]):not(.disabled), .sidebar-menu-item:not([aria-disabled="true"]):not(.disabled)'
    )
    items.forEach((item) => {
      item.setAttribute('role', 'menuitem')
      item.setAttribute('tabindex', '0')

      // Ensure proper cursor
      if (window.getComputedStyle(item).cursor === 'default') {
        item.style.cursor = 'pointer'
      }

      // Add keyboard support
      if (!item.hasAttribute('data-keyboard-enhanced')) {
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            item.click()
          }
        })
        item.setAttribute('data-keyboard-enhanced', 'true')
      }
    })

    // Set first item to be tabbable
    if (items.length > 0) {
      items[0].setAttribute('tabindex', '0')
      items.forEach((item, index) => {
        if (index > 0) item.setAttribute('tabindex', '-1')
      })
    }

    // Handle disabled menu items
    const disabledItems = menu.querySelectorAll(
      '.menu-item.disabled, .menu-item[aria-disabled="true"], .sidebar-menu-item.disabled, .sidebar-menu-item[aria-disabled="true"]'
    )
    disabledItems.forEach((item) => {
      item.setAttribute('role', 'menuitem')
      item.setAttribute('aria-disabled', 'true')
      // Remove tabindex completely
      item.removeAttribute('tabindex')
    })

    // Handle keyboard navigation
    const handleKeyNav = (e) => {
      if (
        ![
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Home',
          'End'
        ].includes(e.key)
      )
        return

      const items = Array.from(
        menu.querySelectorAll(
          '.menu-item:not(.disabled):not([aria-disabled="true"]), .sidebar-menu-item:not(.disabled):not([aria-disabled="true"])'
        )
      )
      const currentIndex = items.indexOf(e.target)
      let nextIndex = currentIndex

      // Handle orientation-appropriate navigation
      const isVertical = orientation === 'vertical'
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'

      if (e.key === nextKey) {
        nextIndex = (currentIndex + 1) % items.length
      } else if (e.key === prevKey) {
        nextIndex = (currentIndex - 1 + items.length) % items.length
      } else if (e.key === 'Home') {
        nextIndex = 0
      } else if (e.key === 'End') {
        nextIndex = items.length - 1
      }

      if (nextIndex !== currentIndex) {
        e.preventDefault()
        items[nextIndex].focus()
      }
    }

    menu.addEventListener('keydown', handleKeyNav)

    return () => {
      menu.removeEventListener('keydown', handleKeyNav)
    }
  }, [id, orientation])

  return (
    <div
      id={id}
      className={`accessible-menu ${className}`}
      style={{
        ...style,
        display: orientation === 'vertical' ? 'flex' : 'inline-flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row'
      }}
    >
      {children}
    </div>
  )
}

export default useTabNavigation
