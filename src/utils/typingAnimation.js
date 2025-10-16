/**
 * Creates a controller for a typing animation effect.
 *
 * @param {object} options - Configuration options.
 * @param {string} options.content - The text content to type out.
 * @param {number} options.durationSeconds - The total duration (in seconds) the animation should take.
 * @param {function(string): void} [options.onUpdate=(typed) => {}] - Callback function triggered with the updated typed content on each step.
 * @param {function(): void} [options.onComplete=() => {}] - Callback function triggered when the typing animation is complete.
 * @param {function(): void} [options.onTick=() => {}] - Callback function triggered periodically during typing (e.g., for sound effects). Can be adjusted by changing the modulo condition in typeCharacter.
 * @returns {object} An object with `start` and `stop` methods to control the animation.
 */
export function createTypingAnimation(options) {
  const {
    content = '',
    durationSeconds = 5, // Default duration if not provided
    onUpdate = (typed) => {},
    onComplete = () => {},
    onTick = () => {}
  } = options

  let typedContentInternal = '' // Use a different name to avoid conflicts
  let isTyping = false
  let timeoutId = null
  let tickCounter = 0 // Counter for the onTick callback

  const contentLength = content.length
  const totalDurationMs = durationSeconds * 1000
  // Ensure minimum speed (e.g., 5ms per char) and handle zero length content
  const typingSpeed =
    contentLength > 0
      ? Math.max(5, Math.floor(totalDurationMs / contentLength))
      : 0

  function typeCharacter(index) {
    if (index < contentLength) {
      typedContentInternal = content.substring(0, index + 1)
      onUpdate(typedContentInternal) // Call the update callback

      // Trigger tick callback periodically (e.g., every 3 characters)
      tickCounter++
      if (tickCounter % 3 === 0) {
        onTick()
      }

      // Schedule the next character
      timeoutId = setTimeout(() => typeCharacter(index + 1), typingSpeed)
    } else {
      // Typing complete
      isTyping = false
      onComplete() // Call the completion callback
      timeoutId = null // Clear timeout ID
    }
  }

  /**
   * Starts the typing animation.
   * If called while already typing, it stops the current animation and restarts.
   * Handles empty content gracefully.
   */
  function start() {
    stop() // Clear any existing timers and reset state

    if (contentLength === 0) {
      onUpdate('') // Ensure initial state is updated even for empty content
      onComplete() // Immediately complete if content is empty
      return
    }

    // Reset state for a new animation
    typedContentInternal = ''
    tickCounter = 0
    isTyping = true
    onUpdate('') // Call update with initial empty state

    // Start the typing loop
    typeCharacter(0)
  }

  /**
   * Stops the typing animation immediately and clears any pending timeouts.
   */
  function stop() {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    isTyping = false
    // Note: We don't reset typedContentInternal here, allowing the caller
    // to decide whether to clear the displayed text upon stopping.
  }

  // Return the control object
  return {
    start,
    stop
    // Optionally expose the typing status if needed, e.g., via a getter
    // isTyping: () => isTyping,
  }
}
