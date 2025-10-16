import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { icons } from '@/config/teacherDash/images'
import { useAuth } from '@/context/AuthContext'
import { TiWarning } from 'react-icons/ti'
import {
  useTeacherData,
  useDeleteTeacherClassroom
} from '@/hooks/useTeacherQueries'
import {
  containerVariants,
  itemVariants,
  headerTextVariants,
  subtitleVariants,
  buttonVariants,
  sectionTitleVariants,
  loadingVariants,
  emptyStateVariants,
  staggeredGridVariants,
  overlayVariants
} from '@/utils/animationVariants'

// Import separated components
import CreateClassForm from './CreateClass/CreateClassForm'
import MissionItem from './Missions/MissionItem'
import TeacherStats from './TeacherStatCard/TeacherStats'
import TeacherClassCard from './TeacherClassCard/TeacherClassCard'
import ConfirmationModal from '@/components/common/ConfirmationModal'
import TeacherTips from './Tips/TeacherTips'
import './TeacherClassroom.css'
import { toast } from 'react-toastify'

// ----- ICONS -----
const { addIcon: AddIcon, notificationIcon: NotificationIcon } = icons

/**
 * TeacherClassroom Component
 * Main dashboard for teachers to manage classes and students
 */
const TeacherClassroom = () => {
  const { currentUser } = useAuth()
  const { classes, loading, stats, error } = useTeacherData(currentUser)

  // Mutation for deleting classrooms
  const deleteClassroomMutation = useDeleteTeacherClassroom()

  // ----- STATE DEFINITIONS -----
  // Modal visibility states
  const [showCreateClassForm, setShowCreateClassForm] = useState(false)

  // Modal for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [pendingDeleteClassId, setPendingDeleteClassId] = useState(null)

  // Tips visibility state
  const [showTips, setShowTips] = useState(true)

  // ----- TIPS MANAGEMENT -----
  /**
   * Check local storage for tips preference on component mount
   */
  useEffect(() => {
    const dontShowAgain = localStorage.getItem('teacher-tips-dont-show')
    if (dontShowAgain === 'true') {
      setShowTips(false)
    }
  }, [])

  /**
   * Handles hiding the tips section
   */
  const handleHideTips = () => {
    setShowTips(false)
  }

  // ----- CLASS MANAGEMENT -----
  /**
   * Deletes a class from Firebase and handles associated missions
   * @param {string} classId - ID of the class to delete
   */
  const handleDeleteClass = async (classId) => {
    setPendingDeleteClassId(classId)
    setDeleteModalOpen(true)
  }

  const handleConfirmDeleteClass = async () => {
    if (!pendingDeleteClassId) return

    try {
      await deleteClassroomMutation.mutateAsync(pendingDeleteClassId)
      toast.success(
        'Class, associated missions, and access codes deleted successfully'
      )
    } catch (error) {
      console.error('Error deleting class:', error)
      toast.error('Failed to delete class. Please try again.')
    } finally {
      setDeleteModalOpen(false)
      setPendingDeleteClassId(null)
    }
  }

  const handleCancelDeleteClass = () => {
    setDeleteModalOpen(false)
    setPendingDeleteClassId(null)
  }

  // Class Creation Handlers
  const handleNewClassClick = () => {
    setShowCreateClassForm(true)
    // Prevent body scrolling when modal is open
    document.documentElement.classList.add('modal-open')
    document.body.classList.add('modal-open')
    // Also add to main container
    const container = document.querySelector('.teacher-classroom-container')
    if (container) {
      container.classList.add('modal-open')
    }
    const mainContent = document.querySelector('.teacher-classroom')
    if (mainContent) {
      mainContent.classList.add('modal-open')
    }
  }

  const handleCancelCreateClass = () => {
    setShowCreateClassForm(false)
    // Re-enable body scrolling when modal is closed
    document.documentElement.classList.remove('modal-open')
    document.body.classList.remove('modal-open')
    // Also remove from main container
    const container = document.querySelector('.teacher-classroom-container')
    if (container) {
      container.classList.remove('modal-open')
    }
    const mainContent = document.querySelector('.teacher-classroom')
    if (mainContent) {
      mainContent.classList.remove('modal-open')
    }
  }

  const handleCreateClass = (formData) => {
    setShowCreateClassForm(false)
    // Re-enable body scrolling when modal is closed
    document.documentElement.classList.remove('modal-open')
    document.body.classList.remove('modal-open')
    // Also remove from main container
    const container = document.querySelector('.teacher-classroom-container')
    if (container) {
      container.classList.remove('modal-open')
    }
    const mainContent = document.querySelector('.teacher-classroom')
    if (mainContent) {
      mainContent.classList.remove('modal-open')
    }
    // Class will be added directly to Firebase by CreateClassForm
    // The real-time listener in fetchClasses will update the UI
  }

  // Cleanup effect to remove modal-open class when component unmounts
  useEffect(() => {
    return () => {
      // Remove modal-open class when component unmounts
      document.documentElement.classList.remove('modal-open')
      document.body.classList.remove('modal-open')
      // Also remove from main container
      const container = document.querySelector('.teacher-classroom-container')
      if (container) {
        container.classList.remove('modal-open')
      }
      const mainContent = document.querySelector('.teacher-classroom')
      if (mainContent) {
        mainContent.classList.remove('modal-open')
      }
    }
  }, [])

  // Format class title as "Class Subject - Grade X"
  const formatClassTitle = (classData) => {
    const subject = classData.className || classData.title || 'Unnamed Class'
    const grade = classData.grade ? `Grade ${classData.grade}` : ''

    if (grade) {
      return `${subject} - ${grade}`
    }
    return subject
  }

  // ----- MAIN DASHBOARD RENDER -----
  return (
    <motion.div
      className='teacher-classroom-container'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      {/* Main Dashboard */}
      <div className='teacher-classroom'>
        {/* Header Section */}
        <motion.div
          className='teacher-classroom__header'
          variants={itemVariants}
        >
          <div className='teacher-classroom__header-left'>
            <motion.h1
              className='teacher-classroom__title'
              variants={headerTextVariants}
            >
              My Classroom
            </motion.h1>
            <motion.p
              className='teacher-classroom__description'
              variants={subtitleVariants}
            >
              Manage your classes and student activities
            </motion.p>
          </div>

          <div className='teacher-classroom__header-buttons'>
            <motion.button
              className='teacher-classroom__button'
              onClick={handleNewClassClick}
              variants={buttonVariants}
              whileHover='hover'
              whileTap='tap'
            >
              <AddIcon className='' size={30} />
              New Class
            </motion.button>

            {/* Notification Icon */}
            <motion.button
              className='teacher-classroom__notification-btn'
              variants={buttonVariants}
              whileHover='hover'
              whileTap='tap'
            >
              <NotificationIcon size={24} />
            </motion.button>

            {/* Profile Section */}
            <div className='teacher-classroom__profile-section'>
              <div className='teacher-classroom__profile-info'>
                <div className='teacher-classroom__profile-name'>
                  {currentUser?.firstName ||
                    currentUser?.email?.split('@')[0] ||
                    'User'}
                </div>
                <div className='teacher-classroom__profile-role'>Teacher</div>
              </div>
              <div className='teacher-classroom__profile-avatar'>
                {(currentUser?.displayName || currentUser?.email || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Section - Now using the TeacherStats component */}
        <motion.div variants={itemVariants}>
          <TeacherStats stats={stats} icons={icons} />
        </motion.div>

        <motion.h2
          className='teacher-classroom__section-title'
          variants={sectionTitleVariants}
        >
          Today's Schedule
        </motion.h2>

        {/* Today's Schedule Section - Using integrated MissionItem component */}
        <motion.div
          className='teacher-classroom__schedule'
          variants={itemVariants}
        >
          <MissionItem.Container />
        </motion.div>

        {/* Class Cards Section */}
        <motion.div
          className='teacher-classroom__cards'
          variants={staggeredGridVariants}
        >
          {loading ? (
            <motion.div
              className='teacher-classroom__loading'
              variants={loadingVariants}
            >
              Loading classes...
            </motion.div>
          ) : classes && Object.keys(classes).length > 0 ? (
            Object.entries(classes).map(([classId, classData], index) => {
              return (
                <TeacherClassCard
                  key={classId}
                  classId={classId}
                  title={formatClassTitle(classData)}
                  studentCount={classData.students?.length || 0}
                  nextClass={classData.nextClass}
                  students={classData.students || []}
                  onDeleteClass={handleDeleteClass}
                  currentUser={currentUser}
                  classes={classes}
                  index={index}
                />
              )
            })
          ) : (
            <motion.div
              className='teacher-classroom__empty'
              variants={emptyStateVariants}
            >
              No classes found. Click "New Class" to create your first class.
            </motion.div>
          )}
        </motion.div>

        {/* Teacher Tips Section */}
        {showTips && <TeacherTips icons={icons} onHideTips={handleHideTips} />}
      </div>

      {/* Create Class Form Modal */}
      <AnimatePresence mode='wait'>
        {showCreateClassForm && (
          <motion.div
            className='modal-overlay'
            variants={overlayVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <CreateClassForm
              onCancel={handleCancelCreateClass}
              onCreateClass={handleCreateClass}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal - This already works as an overlay */}
      <ConfirmationModal
        type='delete'
        open={deleteModalOpen}
        onCancel={handleCancelDeleteClass}
        onConfirm={handleConfirmDeleteClass}
        title='Delete Class'
        description={
          deleteClassroomMutation.isPending
            ? 'Deleting class...'
            : 'Are you sure you want to delete this class? All associated missions and active access codes will also be deleted.'
        }
        disabled={deleteClassroomMutation.isPending}
        icon={<TiWarning />}
      />
    </motion.div>
  )
}

export default TeacherClassroom
