import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { db } from '@/firebase/config'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import {
  MdDragIndicator,
  MdFormatBold,
  MdFormatItalic,
  MdTitle
} from 'react-icons/md'
import ContentEditable from 'react-contenteditable'
import {
  loadNoteWithFallback,
  saveNoteDuringMission,
  saveNoteOnExit
} from '@/services/notesService'
import './GameNoteComponent.css'

const GameNoteComponent = ({
  missionId,
  isVisible,
  onToggle,
  missionTitle
}) => {
  const { currentUser } = useAuth()
  const [note, setNote] = useState('')
  const [htmlContent, setHtmlContent] = useState('<br>')
  const [backgroundColor, setBackgroundColor] = useState('#e80f25')
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [size, setSize] = useState({ width: 300, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })
  const [isLocalStorageMode, setIsLocalStorageMode] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    heading: false
  })

  const noteRef = useRef(null)
  const textareaRef = useRef(null)

  // Predefined background colors
  const backgroundColors = [
    { name: 'Yellow', value: '#fff3cd' },
    { name: 'Blue', value: '#d1ecf1' },
    { name: 'Green', value: '#d4edda' },
    { name: 'Pink', value: '#f8d7da' }
  ]

  // HTML to plain text conversion
  const htmlToText = (html) => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  // Plain text to HTML conversion
  const textToHtml = (text) => {
    if (!text || text.trim() === '') {
      return '<br>'
    }
    return text.replace(/\n/g, '<br>')
  }

  // Load note data using service with fallback
  useEffect(() => {
    const loadNote = async () => {
      console.log('Loading note for:', {
        currentUser: currentUser?.uid,
        missionId
      })

      if (!currentUser || !missionId) {
        console.log('Missing currentUser or missionId, skipping load')
        return
      }

      try {
        const result = await loadNoteWithFallback(
          currentUser.uid,
          missionId,
          missionTitle || 'Mission'
        )

        if (result.success && result.data) {
          const data = result.data
          console.log(`Note loaded from ${result.source}:`, data)

          // Prioritize HTML content if available, otherwise convert plain text to HTML
          const htmlContent = data.htmlContent || textToHtml(data.content || '')
          const plainTextContent = data.content || htmlToText(htmlContent)

          setNote(plainTextContent)
          setHtmlContent(htmlContent)
          setBackgroundColor(data.backgroundColor || '#e80f25')
          setPosition(data.position || { x: 50, y: 50 })
          setSize(data.size || { width: 300, height: 200 })
          setIsLocalStorageMode(true)
          console.log(
            `Note loaded from ${result.source} successfully with HTML content:`,
            htmlContent
          )
        } else {
          console.log('No note found in localStorage or Firebase')
        }
      } catch (error) {
        console.error('Error loading note:', error)
      }
    }

    loadNote()
  }, [currentUser, missionId, missionTitle])

  // Save note during mission play using service
  const saveNote = async (noteData) => {
    console.log('saveNote called with:', {
      user: currentUser?.uid,
      missionId,
      isLocalStorageMode,
      noteData
    })

    if (!currentUser || !missionId) {
      console.log('Missing user or missionId in saveNote:', {
        user: !!currentUser,
        missionId
      })
      return
    }

    setIsSaving(true)

    try {
      if (isLocalStorageMode) {
        // Save to localStorage during mission play using service
        console.log('Saving to localStorage via service...')
        const result = saveNoteDuringMission(
          currentUser.uid,
          missionId,
          missionTitle || 'Mission',
          noteData
        )

        if (result.success) {
          console.log('Note saved to localStorage successfully via service')
        } else {
          console.error(
            'Error saving to localStorage via service:',
            result.error
          )
        }
      } else {
        // Fallback to direct Firebase save (shouldn't happen in normal flow)
        console.log('Fallback: Saving to Firebase directly...')
        const noteDocRef = doc(
          db,
          'userNotes',
          `${currentUser.uid}_${missionId}`
        )
        await setDoc(
          noteDocRef,
          {
            ...noteData,
            userId: currentUser.uid,
            missionId,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        )
        console.log('Note saved to Firebase via fallback')
      }
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Debounced save function
  const debouncedSave = useRef(null)

  // Handle HTML content change with debouncing
  const handleHtmlChange = (e) => {
    const newHtmlContent = e.target.value
    const newNote = htmlToText(newHtmlContent)
    setHtmlContent(newHtmlContent)
    setNote(newNote)

    // Clear existing timeout
    if (debouncedSave.current) {
      clearTimeout(debouncedSave.current)
    }

    // Set new timeout for saving (save after 1 second of no typing)
    debouncedSave.current = setTimeout(() => {
      console.log('Debounced save triggered:', {
        newNote: newNote.substring(0, 50) + '...',
        isLocalStorageMode
      })
      saveNote({
        content: newNote,
        htmlContent: newHtmlContent,
        backgroundColor,
        position,
        size
      })
    }, 1000) // 1 second delay
  }

  // Handle background color change (immediate save for color changes)
  const handleColorChange = (color) => {
    setBackgroundColor(color)
    console.log('Color changed, saving immediately:', color)
    saveNote({
      content: note,
      htmlContent: htmlContent,
      backgroundColor: color,
      position,
      size
    })
  }

  // Handle note toggle click
  const handleNoteToggle = (e) => {
    e.stopPropagation()
    onToggle()
  }

  // Check current formatting state
  const checkFormattingState = () => {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const container = range.commonAncestorContainer
      const element =
        container.nodeType === Node.TEXT_NODE
          ? container.parentElement
          : container

      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        heading: element && element.tagName === 'H3'
      })
    }
  }

  // Text formatting functions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value)
    // Check formatting state after applying format
    setTimeout(() => {
      checkFormattingState()
      // Get updated HTML content and save it
      const contentEditable = document.querySelector('.note-contenteditable')
      if (contentEditable) {
        const newHtmlContent = contentEditable.innerHTML
        const newNote = htmlToText(newHtmlContent)
        setHtmlContent(newHtmlContent)
        setNote(newNote)

        // Save the formatted content
        saveNote({
          content: newNote,
          htmlContent: newHtmlContent,
          backgroundColor,
          position,
          size
        })
      }
    }, 10)
  }

  // Handle formatting button clicks
  const handleFormatClick = (format) => {
    switch (format) {
      case 'bold':
        formatText('bold')
        break
      case 'italic':
        formatText('italic')
        break
      case 'heading':
        formatText('formatBlock', 'h3')
        break
      default:
        break
    }
  }

  // Handle selection change to update active formats
  const handleSelectionChange = () => {
    checkFormattingState()
  }

  // Save current note to Firebase (called when exiting mission)
  const saveCurrentNoteToFirebase = async () => {
    console.log('saveCurrentNoteToFirebase called with:', {
      user: currentUser?.uid,
      missionId,
      missionTitle,
      note: note.substring(0, 50) + '...'
    })

    if (!currentUser || !missionId) {
      console.log('Missing user or missionId:', {
        user: !!currentUser,
        missionId
      })
      return { success: false, error: 'Missing user or missionId' }
    }

    try {
      const noteData = {
        content: note,
        htmlContent: htmlContent,
        backgroundColor,
        position,
        size
      }

      console.log('Saving note data via service:', noteData)

      const result = await saveNoteOnExit(
        currentUser.uid,
        missionId,
        missionTitle || 'Mission',
        noteData
      )

      if (result.success) {
        console.log('Note saved to Firebase on exit successfully via service')
        return { success: true }
      } else {
        console.error(
          'Failed to save note to Firebase on exit via service:',
          result.error
        )
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error saving note to Firebase on exit:', error)
      return { success: false, error: error.message }
    }
  }

  // Expose the save function to parent component
  useEffect(() => {
    window.saveCurrentNoteToFirebase = saveCurrentNoteToFirebase
  }, [
    note,
    htmlContent,
    backgroundColor,
    position,
    size,
    currentUser,
    missionId,
    missionTitle
  ])

  // Cleanup debounced save on unmount
  useEffect(() => {
    return () => {
      if (debouncedSave.current) {
        clearTimeout(debouncedSave.current)
      }
    }
  }, [])

  // Add selection change listener
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [])

  // Handle drag start
  const handleMouseDown = (e) => {
    if (e.target === textareaRef.current) return // Don't drag when clicking on textarea

    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  // Handle resize start
  const handleResizeMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    })
  }

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        e.preventDefault()
        const newPosition = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        }
        setPosition(newPosition)
        saveNote({
          content: note,
          htmlContent: htmlContent,
          backgroundColor,
          position: newPosition,
          size
        })
      } else if (isResizing) {
        e.preventDefault()
        const newWidth = Math.max(
          200,
          resizeStart.width + (e.clientX - resizeStart.x)
        )
        const newHeight = Math.max(
          150,
          resizeStart.height + (e.clientY - resizeStart.y)
        )
        const newSize = { width: newWidth, height: newHeight }
        setSize(newSize)
        saveNote({
          content: note,
          htmlContent: htmlContent,
          backgroundColor,
          position,
          size: newSize
        })
      }
    }

    const handleMouseUp = (e) => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { capture: true })
      document.addEventListener('mouseup', handleMouseUp, { capture: true })
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, {
        capture: true
      })
      document.removeEventListener('mouseup', handleMouseUp, { capture: true })
    }
  }, [
    isDragging,
    isResizing,
    dragStart,
    resizeStart,
    note,
    htmlContent,
    backgroundColor,
    position,
    size
  ])

  if (!isVisible) return null

  return createPortal(
    <div className='game-note-overlay'>
      <div
        ref={noteRef}
        className='game-note-container'
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          backgroundColor: backgroundColor
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header with color picker and close button */}
        <div className='note-header'>
          <div className='color-picker'>
            {backgroundColors.map((color) => (
              <button
                key={color.value}
                className={`color-option ${
                  backgroundColor === color.value ? 'active' : ''
                }`}
                style={{ backgroundColor: color.value }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleColorChange(color.value)
                }}
                title={color.name}
              />
            ))}
          </div>
          <div className='note-status'>
            {isSaving && <span className='saving-indicator'>Saving...</span>}
          </div>
          <div className='header-buttons'>
            <button className='drag-note' title='Drag to move'>
              <MdDragIndicator />
            </button>
            <button className='close-note' onClick={handleNoteToggle}>
              ×
            </button>
          </div>
        </div>

        {/* Formatting toolbar */}
        <div className='formatting-toolbar'>
          <button
            className={`format-btn ${activeFormats.bold ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleFormatClick('bold')
            }}
            title='Bold text'
          >
            <MdFormatBold />
          </button>
          <button
            className={`format-btn ${activeFormats.italic ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleFormatClick('italic')
            }}
            title='Italic text'
          >
            <MdFormatItalic />
          </button>
          <button
            className={`format-btn ${activeFormats.heading ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleFormatClick('heading')
            }}
            title='Add heading'
          >
            <MdTitle />
          </button>
        </div>

        {/* ContentEditable text area */}
        <ContentEditable
          className='note-contenteditable'
          html={htmlContent}
          onChange={handleHtmlChange}
          onClick={(e) => {
            e.stopPropagation()
            handleSelectionChange()
          }}
          onMouseDown={(e) => {
            // Only stop propagation if not clicking on resize handle
            if (!e.target.closest('.resize-handle')) {
              e.stopPropagation()
            }
          }}
          onKeyUp={handleSelectionChange}
          data-placeholder='Write your notes here...'
        />

        {/* Resize handle */}
        <div className='resize-handle' onMouseDown={handleResizeMouseDown} />
      </div>
    </div>,
    document.body
  )
}

export default GameNoteComponent
