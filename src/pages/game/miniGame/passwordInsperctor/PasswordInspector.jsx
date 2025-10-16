import React, { useState, useCallback } from 'react'
import './PasswordInspector.css'

const PasswordInspector = ({ onComplete }) => {
  const [gameLoaded, setGameLoaded] = useState(false)
  const [gameError, setGameError] = useState(null)

  const handleGameComplete = useCallback(() => {
    // Clean up Unity instance before navigation
    if (window.unityGameInstance) {
      try {
        window.unityGameInstance.Quit()
      } catch (error) {
        console.warn('Error quitting Unity instance on completion:', error)
      }
      window.unityGameInstance = null
    }

    // Clear the completion listeners
    window.onGameComplete = null
    window._GameFinished = null

    // Restore original console.log if it was overridden
    if (window.originalConsoleLog) {
      console.log = window.originalConsoleLog
      window.originalConsoleLog = null
    }

    // Navigate to home page
    onComplete()
  }, [onComplete])

  const handleGameLoaded = useCallback(
    (unityInstance) => {
      console.log('Game 3 loaded successfully!', unityInstance)
      setGameLoaded(true)
      setGameError(null)

      // Set up game completion listener
      if (unityInstance && typeof unityInstance.SendMessage === 'function') {
        // Set up completion functions - use navigate directly to avoid closure issues
        const redirectToHome = () => {
          // Clean up Unity instance before navigation
          if (window.unityGameInstance) {
            try {
              window.unityGameInstance.Quit()
            } catch (error) {
              console.warn(
                'Error quitting Unity instance on completion:',
                error
              )
            }
            window.unityGameInstance = null
          }

          // Clear the completion listeners
          window.onGameComplete = null
          window._GameFinished = null

          // Restore original console.log if it was overridden
          if (window.originalConsoleLog) {
            console.log = window.originalConsoleLog
            window.originalConsoleLog = null
          }

          // Navigate to home page
          console.log('Navigating to home page')
          onComplete()
        }

        // Listen for game completion from Unity - Unity calls _GameFinished
        window._GameFinished = redirectToHome

        // Also keep the old name as backup
        window.onGameComplete = redirectToHome

        // Set up console.log interception to detect Unity's completion message
        let unityGameFinishedCalled = false

        // Store original console.log to intercept Unity's logging
        const originalConsoleLog = console.log
        window.originalConsoleLog = originalConsoleLog // Store for cleanup
        console.log = function (...args) {
          originalConsoleLog.apply(console, args)

          // Check if Unity logged its completion message
          const message = args.join(' ')
          if (
            message.includes('Continue Button Pressed') &&
            !unityGameFinishedCalled
          ) {
            unityGameFinishedCalled = true
            console.log('🎯 Detected Unity game completion via console log!')
            setTimeout(() => {
              redirectToHome()
            }, 100) // Small delay to ensure Unity finishes its logging
          }
        }

        // Additional debug - make sure functions are available globally
        console.log('🎮 Game completion listeners ready!')
        console.log('📱 Available completion functions:')
        console.log(
          '✅ window._GameFinished is available:',
          typeof window._GameFinished
        )
        console.log(
          '✅ window.onGameComplete is available:',
          typeof window.onGameComplete
        )

        // Test function accessibility
        console.log('🔍 Testing function calls...')
        setTimeout(() => {
          console.log('🔍 Checking if functions still exist after 2 seconds:')
          console.log('  - window._GameFinished:', typeof window._GameFinished)
          console.log(
            '  - window.onGameComplete:',
            typeof window.onGameComplete
          )
        }, 2000)
      }
    },
    [onComplete]
  )

  const handleGameError = useCallback((error) => {
    console.error('Game 3 error:', error)
    setGameError(error?.message || error?.toString() || 'Unknown error')
    setGameLoaded(false)
  }, [])

  return (
    <div className='test-game3-container'>
      <UnityGame3
        buildUrl='/unityGames/Game_3/Build'
        gameName='Build1'
        width={window.innerWidth || document.documentElement.clientWidth}
        height={window.innerHeight || document.documentElement.clientHeight}
        onGameLoaded={handleGameLoaded}
        onGameError={handleGameError}
      />
    </div>
  )
}

// Unity Game 3 Component
const UnityGame3 = ({
  buildUrl = '/unityGames/Game_3/Build',
  gameName = 'Build1',
  width = 960,
  height = 600,
  onGameLoaded,
  onGameError
}) => {
  const canvasRef = React.useRef(null)
  const containerRef = React.useRef(null)
  const loadingBarRef = React.useRef(null)
  const progressBarRef = React.useRef(null)
  const warningBannerRef = React.useRef(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [progress, setProgress] = React.useState(0)
  const [error, setError] = React.useState(null)
  const [elementsReady, setElementsReady] = React.useState(false)
  const [retryCount, setRetryCount] = React.useState(0)
  const maxRetries = 10

  // Check if all elements are ready with retry logic
  React.useEffect(() => {
    console.log('PasswordInspector: Checking elements ready...')
    const checkElements = () => {
      if (
        canvasRef.current &&
        containerRef.current &&
        loadingBarRef.current &&
        progressBarRef.current &&
        warningBannerRef.current
      ) {
        console.log('PasswordInspector: All elements ready!')
        setElementsReady(true)
      } else if (retryCount < maxRetries) {
        console.log(
          `PasswordInspector: Elements not ready yet - retry ${
            retryCount + 1
          }/${maxRetries}`
        )
        setRetryCount((prev) => prev + 1)
        setTimeout(checkElements, 200) // Retry every 200ms
      } else {
        console.warn(
          'PasswordInspector: Elements failed to load after maximum retries'
        )
        setError('Failed to initialize game elements')
      }
    }

    if (!elementsReady) {
      checkElements()
    }
  }, [elementsReady, retryCount, maxRetries])

  // Main Unity loading effect
  React.useEffect(() => {
    console.log(
      'PasswordInspector: Unity loading effect triggered, elementsReady:',
      elementsReady
    )
    if (!elementsReady) {
      console.log('PasswordInspector: Waiting for elements to be ready...')
      return
    }

    const canvas = canvasRef.current
    const container = containerRef.current
    const loadingBar = loadingBarRef.current
    const progressBarFull = progressBarRef.current
    const warningBanner = warningBannerRef.current

    if (
      !canvas ||
      !container ||
      !loadingBar ||
      !progressBarFull ||
      !warningBanner
    ) {
      console.warn('Unity game elements not ready yet')
      return
    }

    // Unity banner function
    const unityShowBanner = (msg, type) => {
      const updateBannerVisibility = () => {
        warningBanner.style.display = warningBanner.children.length
          ? 'block'
          : 'none'
      }

      const div = document.createElement('div')
      div.innerHTML = msg
      warningBanner.appendChild(div)

      if (type === 'error') {
        div.style = 'background: red; padding: 10px; color: white;'
        setError(msg)
      } else if (type === 'warning') {
        div.style = 'background: orange; padding: 10px; color: black;'
        setTimeout(() => {
          if (warningBanner.contains(div)) {
            warningBanner.removeChild(div)
            updateBannerVisibility()
          }
        }, 5000)
      }
      updateBannerVisibility()
    }

    // Unity configuration - try uncompressed first, fallback to compressed
    const config = {
      arguments: [],
      dataUrl: `${buildUrl}/${gameName}.data`, // Try uncompressed first
      frameworkUrl: `${buildUrl}/${gameName}.framework.js`, // Try uncompressed first
      codeUrl: `${buildUrl}/${gameName}.wasm`, // Try uncompressed first
      streamingAssetsUrl: 'StreamingAssets',
      companyName: 'DefaultCompany',
      productName: 'Game 3',
      productVersion: '0.1.0',
      showBanner: unityShowBanner
    }

    // Mobile device detection
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      const meta = document.createElement('meta')
      meta.name = 'viewport'
      meta.content =
        'width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=yes'
      document.getElementsByTagName('head')[0].appendChild(meta)
      container.className = 'unity-mobile'
      canvas.className = 'unity-mobile'
    } else {
      // Desktop style
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
    }

    // Show loading bar
    loadingBar.style.display = 'block'
    setIsLoading(true)

    // Load Unity
    const script = document.createElement('script')
    script.src = `${buildUrl}/${gameName}.loader.js`

    script.onload = () => {
      if (window.createUnityInstance) {
        window
          .createUnityInstance(canvas, config, (progress) => {
            const progressPercent = 100 * progress
            progressBarFull.style.width = progressPercent + '%'
            setProgress(progressPercent)
          })
          .then((unityInstance) => {
            loadingBar.style.display = 'none'
            setIsLoading(false)
            setProgress(100)

            // Store Unity instance globally for cleanup and communication
            window.unityGameInstance = unityInstance

            // Set up communication bridge between Unity and React
            window.Unity = {
              call: function (method, ...args) {
                if (
                  unityInstance &&
                  typeof unityInstance.SendMessage === 'function'
                ) {
                  unityInstance.SendMessage(
                    'GameManager',
                    method,
                    args.join(',')
                  )
                }
              }
            }

            if (onGameLoaded) onGameLoaded(unityInstance)
          })
          .catch((message) => {
            console.log(
              'Unity failed to load with uncompressed files, trying compressed versions...',
              message
            )

            // Fallback to compressed versions
            const compressedConfig = {
              ...config,
              dataUrl: `${buildUrl}/${gameName}.data.br`,
              frameworkUrl: `${buildUrl}/${gameName}.framework.js.br`,
              codeUrl: `${buildUrl}/${gameName}.wasm.br`
            }

            window
              .createUnityInstance(canvas, compressedConfig, (progress) => {
                const progressPercent = 100 * progress
                progressBarFull.style.width = progressPercent + '%'
                setProgress(progressPercent)
              })
              .then((unityInstance) => {
                loadingBar.style.display = 'none'
                setIsLoading(false)
                setProgress(100)

                // Store Unity instance globally for cleanup and communication
                window.unityGameInstance = unityInstance

                // Set up communication bridge between Unity and React
                window.Unity = {
                  call: function (method, ...args) {
                    if (
                      unityInstance &&
                      typeof unityInstance.SendMessage === 'function'
                    ) {
                      unityInstance.SendMessage(
                        'GameManager',
                        method,
                        args.join(',')
                      )
                    }
                  }
                }

                if (onGameLoaded) onGameLoaded(unityInstance)
              })
              .catch((fallbackMessage) => {
                setError(fallbackMessage)
                setIsLoading(false)
                if (onGameError) onGameError(fallbackMessage)
              })
          })
      } else {
        setError('Unity loader failed to load')
        setIsLoading(false)
      }
    }

    script.onerror = () => {
      setError('Failed to load Unity loader script')
      setIsLoading(false)
    }

    document.body.appendChild(script)

    // Cleanup
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }

      // Clean up Unity instance and global listeners
      if (window.unityGameInstance) {
        try {
          window.unityGameInstance.Quit()
        } catch (error) {
          console.warn('Error quitting Unity instance on cleanup:', error)
        }
        window.unityGameInstance = null
      }

      // Clear global listeners
      window.onGameComplete = null
      window._GameFinished = null
      window.Unity = null

      // Restore original console.log if it was overridden
      if (window.originalConsoleLog) {
        console.log = window.originalConsoleLog
        window.originalConsoleLog = null
      }
    }
  }, [
    buildUrl,
    gameName,
    onGameLoaded,
    onGameError,
    elementsReady,
    width,
    height
  ])

  return (
    <div className='unity-game3-container'>
      <div ref={containerRef} id='unity-container' className='unity-desktop'>
        <canvas
          ref={canvasRef}
          id='unity-canvas'
          width={width}
          height={height}
          tabIndex='-1'
        />

        {isLoading && (
          <div ref={loadingBarRef} id='unity-loading-bar'>
            <div id='unity-logo'></div>
            <div id='unity-progress-bar-empty'>
              <div
                ref={progressBarRef}
                id='unity-progress-bar-full'
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className='loading-text'>
              Loading Game 3... {Math.round(progress)}%
            </div>
          </div>
        )}

        <div ref={warningBannerRef} id='unity-warning'></div>
      </div>

      {error && (
        <div className='error-message'>
          Error:{' '}
          {typeof error === 'string'
            ? error
            : error?.message || 'Unknown error'}
        </div>
      )}
    </div>
  )
}

export default PasswordInspector
