import React, { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './TeacherAssignments.css'
import { icons, images } from '../../../../config/teacherDash/images.js'
import { IoIosClose } from 'react-icons/io'
import AssignmentCard from './AssignmentCard'
import CustomDropdown from '../profile/CustomDropdown'
import {
  containerVariants,
  itemVariants,
  formVariants,
  cardVariants,
  buttonVariants,
  headerTextVariants,
  subtitleVariants,
  sectionTitleVariants,
  rightSectionTitleVariants,
  emptyStateVariants
} from '../../../../utils/animationVariants.js'

//icon
const IoIosAdd = icons.addIcon

// Import icons from assets
import CalendarIcon from '../../../../assets/icons/calendar.svg'
import PercentageIcon from '../../../../assets/icons/percentage.png'
import AttachIcon from '../../../../assets/icons/attach.png'
import AssignmentIcon from '../../../../assets/icons/assignment.svg'
import BuildingIcon from '../../../../assets/icons/buliding.svg'

const TeacherAssignments = () => {
  const [showCreateAssignmentForm, setShowCreateAssignmentForm] =
    useState(false)
  const [selectedFilter, setSelectedFilter] = useState('All Assignments')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  
  // Dropdown options for filtering assignments
  const filterOptions = [
    'All Assignments',
    'SEL Learning',
    'Curriculum Learning'
  ]
  
  // Dropdown options for status filtering
  const statusOptions = [
    'All Status',
    'In Progress',
    'Completed',
    'Overdue'
  ]
  
  const [assignments] = useState([
    {
      title: 'Cyberbullying',
      category: 'SEL Learning',
      dueDate: 'March 15 2025',
      status: 'In Progress',
      studentsCompleted: 80,
      averageScore: 50,
      studentSubmissions: '45/70',
      backgroundColor: 'purple'
    },
    {
      title: 'My Digital Footprint',
      category: 'SEL Learning',
      dueDate: 'April 15 2025',
      status: 'In Progress',
      studentsCompleted: 60,
      averageScore: 70,
      studentSubmissions: '45/70',
      backgroundColor: 'dark-blue'
    },
    {
      title: 'Password Hero',
      category: 'Curriculum Learning',
      dueDate: 'March 15 2025',
      status: 'In Progress',
      studentsCompleted: 50,
      averageScore: 50,
      studentSubmissions: '45/70',
      backgroundColor: 'light-pink'
    },
    {
      title: 'My Social Media Safety Plan',
      category: 'Curriculum Learning',
      dueDate: 'April 15 2025',
      status: 'In Progress',
      studentsCompleted: 50,
      averageScore: 50,
      studentSubmissions: '45/70',
      backgroundColor: 'bright-pink'
    },
    {
      title: 'Programming Project',
      category: 'SEL Learning',
      dueDate: 'March 15 2025',
      status: 'In Progress',
      studentsCompleted: 80,
      averageScore: 50,
      studentSubmissions: '45/70',
      backgroundColor: 'cyan'
    },
    {
      title: 'Portrait Drawing',
      category: 'SEL Learning',
      dueDate: 'April 15 2025',
      status: 'Completed',
      isCompleted: true,
      backgroundColor: 'green'
    }
  ])

  // Filtered assignments based on selected filters
  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      // Filter by assignment type (SEL Learning, Curriculum Learning, etc.)
      const matchesFilter = selectedFilter === 'All Assignments' || 
                           assignment.category === selectedFilter
      
      // Filter by status
      const matchesStatus = selectedStatus === 'All Status' ||
                           assignment.status === selectedStatus ||
                           (selectedStatus === 'Completed' && assignment.isCompleted) ||
                           (selectedStatus === 'In Progress' && !assignment.isCompleted)
      
      return matchesFilter && matchesStatus
    })
  }, [assignments, selectedFilter, selectedStatus])

  const [selectedFiles, setSelectedFiles] = useState([])
  const fileInputRef = useRef(null)

  const toggleCreateAssignmentForm = () => {
    setShowCreateAssignmentForm(!showCreateAssignmentForm)
  }

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files)
      setSelectedFiles(fileArray)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files)
      setSelectedFiles(fileArray)
    }
  }

  // Event handlers for AssignmentCard
  const handleViewDetails = (assignment) => {
    console.log('View details for:', assignment.title)
    // Add your logic here - navigate to assignment details, open modal, etc.
  }

  const handleDownloadPDF = (assignment) => {
    console.log('Download PDF for:', assignment.title)
    // Add your logic here - trigger PDF download
  }

  const handleViewClassResults = (assignment) => {
    console.log('View class results for:', assignment.title)
    // Add your logic here - navigate to results page, open modal, etc.
  }

  const handleSetLearning = (assignment) => {
    console.log('Set learning for:', assignment.title)
    // Add your logic here - open learning settings modal, etc.
  }

  const handleFilterChange = (value) => {
    setSelectedFilter(value)
    console.log('Filter changed to:', value)
  }

  const handleStatusChange = (value) => {
    setSelectedStatus(value)
    console.log('Status changed to:', value)
  }

  return (
    <motion.div
      className='teacher-assignment-container'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      <div className='teacher-assignment-content'>
        {/* Header */}
        <motion.div
          className='teacher-assignment-header'
          variants={itemVariants}
        >
          <div className='teacher-assignment-header-left'>
            <motion.h1
              className='teacher-assignment-title'
              variants={headerTextVariants}
            >
              Assignments
            </motion.h1>
            <motion.p
              className='teacher-assignment-subtitle'
              variants={subtitleVariants}
            >
              Create and manage assignments for your students
            </motion.p>
          </div>
          <motion.button
            className='teacher-assignment-create-btn'
            onClick={toggleCreateAssignmentForm}
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
          >
            {showCreateAssignmentForm ? (
              ''
            ) : (
              <IoIosAdd className='teacher-assignment-btn-icon' size={20} />
            )}
            {showCreateAssignmentForm ? 'Cancel' : 'Create Assignment'}
          </motion.button>
        </motion.div>

        {/* Create Assignment Form */}
        <AnimatePresence mode='wait'>
          {showCreateAssignmentForm ? (
            <motion.div
              className='teacher-assignment-form'
              variants={formVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
            >
              <motion.h2
                className='teacher-assignment-form-title'
                variants={itemVariants}
              >
                Create New Assignment
              </motion.h2>

              <motion.div
                className='teacher-assignment-form-group'
                variants={itemVariants}
              >
                <label className='teacher-assignment-form-label'>
                  Assignment Title
                </label>
                <div className='teacher-assignment-input-wrapper'>
                  <img
                    src={AssignmentIcon}
                    alt='assignment'
                    className='teacher-assignment-input-icon'
                  />
                  <input
                    type='text'
                    placeholder='Enter Assignment Title'
                    className='teacher-assignment-form-input'
                  />
                </div>
              </motion.div>

              <motion.div
                className='teacher-assignment-form-group'
                variants={itemVariants}
              >
                <label className='teacher-assignment-form-label'>
                  Description
                </label>
                <textarea
                  placeholder='Enter the Description...'
                  className='teacher-assignment-form-textarea'
                />
              </motion.div>

              <motion.div
                className='teacher-assignment-form-row'
                variants={itemVariants}
              >
                <div className='teacher-assignment-form-column'>
                  <label className='teacher-assignment-form-label'>Class</label>
                  <div className='teacher-assignment-input-wrapper'>
                    <img
                      src={BuildingIcon}
                      alt='building'
                      className='teacher-assignment-input-icon'
                    />
                    <select className='teacher-assignment-form-select'>
                      <option>Select Class</option>
                    </select>
                  </div>
                </div>
                <div className='teacher-assignment-form-column'>
                  <label className='teacher-assignment-form-label'>
                    Due Date
                  </label>
                  <div className='teacher-assignment-input-wrapper'>
                    <img
                      src={CalendarIcon}
                      alt='calendar'
                      className='teacher-assignment-input-icon'
                    />
                    <input
                      type='text'
                      placeholder='mm/dd/yyyy'
                      className='teacher-assignment-form-input'
                    />
                  </div>
                </div>
                <div className='teacher-assignment-form-column'>
                  <label className='teacher-assignment-form-label'>
                    Passing Grade
                  </label>
                  <div className='teacher-assignment-input-wrapper'>
                    <img
                      src={PercentageIcon}
                      alt='percentage'
                      className='teacher-assignment-input-icon'
                    />
                    <input
                      type='text'
                      placeholder='Enter Passing Grade'
                      className='teacher-assignment-form-input'
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className='teacher-assignment-form-group'
                variants={itemVariants}
              >
                <label className='teacher-assignment-form-label'>
                  Attachment
                </label>
                <motion.div
                  className='teacher-assignment-attachment-area'
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className='teacher-assignment-file-input'
                  />
                  <img
                    src={AttachIcon}
                    alt='attach'
                    className='teacher-assignment-upload-icon'
                  />
                  <p className='teacher-assignment-attachment-text'>
                    {selectedFiles.length > 0
                      ? `Selected ${
                          selectedFiles.length
                        } file(s): ${selectedFiles
                          .map((f) => f.name)
                          .join(', ')}`
                      : 'Drag and drop files here or click to upload'}
                  </p>
                </motion.div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className='teacher-assignment-form-actions'
                variants={itemVariants}
              >
                <motion.button
                  className='teacher-assignment-preview-btn'
                  variants={buttonVariants}
                  whileHover='hover'
                  whileTap='tap'
                >
                  Preview Assignment
                </motion.button>
                <motion.button
                  type='reset'
                  className='teacher-assignment-cancel-btn'
                  onClick={toggleCreateAssignmentForm}
                  variants={buttonVariants}
                  whileHover='hover'
                  whileTap='tap'
                >
                  Reset
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              className='teacher-assignment-list-row'
              variants={containerVariants}
              initial='hidden'
              animate='visible'
            >
              <motion.div
                className='teacher-assignment-list-column'
                variants={itemVariants}
              >
                <motion.div
                  className='teacher-assignment-section-title'
                  variants={sectionTitleVariants}
                >
                  <div className='teacher-assignment-dropdowns'>
                    <CustomDropdown
                      value={selectedFilter}
                      onChange={handleFilterChange}
                      options={filterOptions}
                      placeholder="Select filter"
                    />
                    <CustomDropdown
                      value={selectedStatus}
                      onChange={handleStatusChange}
                      options={statusOptions}
                      placeholder="Select status"
                    />
                  </div>
                </motion.div>

                <div className='teacher-assignment-grid'>
                  {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment, index) => (
                      <AssignmentCard
                        key={index}
                        assignment={assignment}
                        index={index}
                        onViewDetails={handleViewDetails}
                        onDownloadPDF={handleDownloadPDF}
                        onViewClassResults={handleViewClassResults}
                        onSetLearning={handleSetLearning}
                      />
                    ))
                  ) : (
                    <div className='teacher-assignment-empty-state'>
                      <p>No assignments found matching the selected filters.</p>
                      <p>Try adjusting your filter criteria.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default TeacherAssignments
