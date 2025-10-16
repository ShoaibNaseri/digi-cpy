import React, { useEffect, useRef } from 'react'
import { typingTextAnimation } from '@/utils/typingTextAnimation'

const TypingEffectComponent = ({
  text,
  duration,
  scrollContainerRef,
  startAnimation = true
}) => {
  const containerRef = useRef(null)

  useEffect(() => {
    let observer
    const targetNode = containerRef.current
    const scrollNode = scrollContainerRef?.current

    // Only start animation if startAnimation is true
    if (targetNode && text && startAnimation) {
      const animatedSpan = typingTextAnimation(text, duration)
      targetNode.innerHTML = '' // Clear previous text
      targetNode.appendChild(animatedSpan)

      // --- MutationObserver Setup ---
      if (scrollNode) {
        const config = { childList: true, subtree: true } // Observe direct children and their subtrees

        const callback = (mutationsList, obs) => {
          // We just need to scroll when any mutation happens during typing
          scrollNode.scrollTop = scrollNode.scrollHeight
        }

        observer = new MutationObserver(callback)
        observer.observe(targetNode, config)
      }
      // --- End MutationObserver Setup ---
    } else if (targetNode && !startAnimation) {
      // Clear content if animation shouldn't start
      targetNode.innerHTML = ''
    }

    // Cleanup function
    return () => {
      if (observer) {
        observer.disconnect() // Disconnect observer on cleanup
      }
      // Optional: Clear content on prop change/unmount if desired
      // if (targetNode) {
      //   targetNode.innerHTML = "";
      // }
    }
    // Dependencies: text, duration, startAnimation, and the scroll container ref's current value
  }, [text, duration, startAnimation, scrollContainerRef])

  return <div ref={containerRef}></div>
}

export default TypingEffectComponent
