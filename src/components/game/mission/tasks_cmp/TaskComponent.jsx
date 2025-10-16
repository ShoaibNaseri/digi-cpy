import { useState, useEffect, useRef } from 'react'
import { useDeviceRotation } from '@/utils/deviceRotation'
import { FaPlay, FaArrowRight } from 'react-icons/fa'
import './tasksComponent.css'
import { useParams } from 'react-router-dom'
import { saveMissionProgressUniversal } from '@/utils/missionProgressUtils'
import ReactMarkdown from 'react-markdown'
const TaskComponent = ({
  mainBackground,
  interfaceBG,
  missionData,
  onComplete,
  onStartOver,
  currentStep
}) => {
  const [typedTitle, setTypedTitle] = useState('')
  const [allTasks, setAllTasks] = useState([])
  const [displayedTasks, setDisplayedTasks] = useState([])
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [isAllTasksDisplayed, setIsAllTasksDisplayed] = useState(false)
  const [isNarrationPlaying, setIsNarrationPlaying] = useState(false)
  const needsRotation = useDeviceRotation()
  const [isLoading, setIsLoading] = useState(true)
  // Ref to keep track of the latest task item added
  const lastTaskItemRef = useRef(null)
  const audioRef = useRef(null)
  const { missionId } = useParams()
  // Sound effects
  const playSoundEffect = (type) => {}
  const saveProgress = async () => {
    const missionDatas = {
      missionId: missionId,
      step: currentStep,
      progress: 50
    }
    await saveMissionProgressUniversal(missionDatas)
  }
  // Play voice narration
  const playVoiceNarration = () => {
    if (audioRef.current && missionData?.narration) {
      audioRef.current.src = missionData.narration
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((err) => {
        console.error('Error playing audio:', err)
      })
    }
  }

  // Stop voice narration
  const stopVoiceNarration = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  // Effect to load all tasks from props
  useEffect(() => {
    setIsLoading(true)
    setAllTasks([])
    setDisplayedTasks([])
    setCurrentTaskIndex(0)
    setIsAllTasksDisplayed(false)
    setShowControls(false)
    setIsNarrationPlaying(false)

    if (!missionData || !missionData.tasks) {
      console.warn('Mission data or tasks are missing.')
      setIsLoading(false)
      return
    }

    const validTasks = missionData.tasks
      .filter(
        (task) =>
          task &&
          typeof task.title !== 'undefined' &&
          typeof task.description !== 'undefined'
      )
      .map((task) => ({
        id: task.id ?? `task-${Math.random().toString(36).substring(2, 9)}`,
        title: String(task.title),
        description: String(task.description),
        narration: task.narration || null
      }))

    if (validTasks.length !== missionData.tasks.length) {
      console.warn('Some tasks were filtered out due to invalid structure.')
    }

    setTypedTitle(missionData.title || 'Mission Tasks')
    setAllTasks(validTasks)
    setIsLoading(false)
  }, [missionData])

  // Effect to display the first task when tasks are loaded
  useEffect(() => {
    if (allTasks.length > 0) {
      // Show only the first task initially
      const firstTask = allTasks[0]
      setDisplayedTasks([firstTask])
      playSoundEffect('newItem')

      // Play the narration for the first task
      if (firstTask.narration) {
        playTaskNarration(firstTask.narration)
      } else {
        setShowControls(true)
      }
    }
  }, [allTasks])

  // Effect to scroll the last item into view AFTER it's rendered
  useEffect(() => {
    if (lastTaskItemRef.current) {
      lastTaskItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [displayedTasks])

  // Play task narration
  const playTaskNarration = (narrationSrc) => {
    if (audioRef.current && narrationSrc) {
      setIsNarrationPlaying(true)
      setShowControls(false)

      audioRef.current.src = `/assets/${narrationSrc}`
      audioRef.current.currentTime = 0

      audioRef.current.onended = () => {
        setIsNarrationPlaying(false)
        setShowControls(true)
      }

      audioRef.current.play().catch((err) => {
        setIsNarrationPlaying(false)
        setShowControls(true)
      })
    } else {
      setShowControls(true)
    }
  }

  // Function to handle showing the next task
  const handleNextTask = () => {
    playSoundEffect('click')

    const nextIndex = currentTaskIndex + 1

    if (nextIndex < allTasks.length) {
      // Show the next task
      const nextTask = allTasks[nextIndex]
      setDisplayedTasks((prevTasks) => [...prevTasks, nextTask])
      setCurrentTaskIndex(nextIndex)
      playSoundEffect('newItem')

      // Play the narration for the next task
      if (nextTask.narration) {
        playTaskNarration(nextTask.narration)
      }

      // Check if this is the last task
      if (nextIndex === allTasks.length - 1) {
        setIsAllTasksDisplayed(true)
      }
    }
  }

  const handleFinish = () => {
    playSoundEffect('click')
    if (onComplete) {
      saveProgress()
      onComplete('complete') // Call the callback passed via props
    } else if (onStartOver) {
      onStartOver() // Call start over if provided
    } else {
      console.warn(
        'TaskComponent: Neither onComplete nor onStartOver props provided.'
      )
    }
  }

  return (
    <>
      {needsRotation && (
        <div className='rotation-overlay'>
          <span className='rotation-icon'>🔄</span>
          <p>Please rotate your device to landscape mode.</p>
        </div>
      )}
      {!needsRotation && (
        <div
          className='content-container'
          style={{
            backgroundImage: interfaceBG ? `url(${interfaceBG})` : 'none'
          }}
        >
          <div className='final-content-block'>
            <h1>{typedTitle}</h1>
            <p
              style={{
                marginTop: '-20px',
                color: 'lightblue',
                fontSize: '1rem',
                textAlign: 'center'
              }}
            >
              {missionData.important_info}
            </p>
            <div
              className='tasks-final-text-area'
              style={{
                height: '100%'
              }}
            >
              {displayedTasks.map((task, index) => (
                <div
                  key={task.id}
                  ref={
                    index === displayedTasks.length - 1 ? lastTaskItemRef : null
                  }
                  className='task-item animate-slide-in'
                >
                  <div className='task-item-icon'>
                    <span className='task-number'>{index + 1}</span>
                  </div>
                  <div className='task-description'>
                    {/* <ReactMarkdown>{task.description}</ReactMarkdown> */}
                    <div
                      style={{
                        color: 'white',
                        fontSize: '1.25rem'
                      }}
                      dangerouslySetInnerHTML={{ __html: task.description }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Controls (Next or Finish Button) - Conditionally render based on showControls */}
          {!isNarrationPlaying && (
            <div className='final-controls'>
              {!isAllTasksDisplayed ? (
                <button
                  style={{ visibility: showControls ? 'visible' : 'hidden' }}
                  className='final-button'
                  onClick={handleNextTask}
                >
                  <span className='btn-icon'>
                    <FaArrowRight size={20} />
                  </span>{' '}
                  NEXT
                </button>
              ) : (
                <button
                  style={{ visibility: showControls ? 'visible' : 'hidden' }}
                  className='final-button'
                  onClick={handleFinish}
                >
                  <span className='btn-icon'>
                    <FaPlay size={20} />
                  </span>{' '}
                  START
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hidden audio element for narration */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </>
  )
}

export default TaskComponent
