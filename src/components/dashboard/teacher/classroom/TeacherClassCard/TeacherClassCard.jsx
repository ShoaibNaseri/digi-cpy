import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { icons } from '@/config/teacherDash/images'
import './TeacherClassCard.css'
import AddStudentModal from './modals/AddStudentModal'
import RemoveStudentModal from './modals/RemoveStudentModal'
import GradeReport from './modals/GradeReports'
import StudentListView from './modals/StudentListView'
import InfoModal from '@/components/common/InfoModal'
import { addStudent } from '@/services/teacherService'
import threeSquareIcon from '@/assets/icons/3square.svg'
import calculatorIcon from '@/assets/icons/calculator.svg'
import ProfileAddIcon from '@/assets/icons/profile-add.svg'
import profileRemoveIcon from '@/assets/icons/profile-remove.svg'
import eyeIcon from '@/assets/icons/eye.svg'
import activityIcon from '@/assets/icons/activity.svg'
import trashIcon from '@/assets/icons/trash.svg'
import { sendStudentEmailNotifications } from '@/utils/createClassLogic/firebaseLogic'
import {
  classCardVariants,
  buttonVariants,
  iconVariants,
  staggeredGridVariants,
  overlayVariants
} from '@/utils/animationVariants'

const {
  addPeopleIcon: IoPersonAddSharp,
  removePeopleIcon: IoPersonRemoveSharp,
  eyeIcon: IoIosEye,
  IoStatsChart: IoStatsChartSharp,
  TiDeleteIcon: TiDelete
} = icons

const TeacherClassCard = ({
  classId,
  title,
  studentCount,
  nextClass,
  students,
  onAccessRecords,
  onDeleteClass,
  currentUser,
  setClasses,
  setClassStudents,
  classes,
  index = 0
}) => {
  // Modal visibility states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false)
  const [showGradeReport, setShowGradeReport] = useState(false)
  const [showStudentListView, setShowStudentListView] = useState(false)
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false)
  const [duplicateCount, setDuplicateCount] = useState(0)

  // Data states
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isTableVisible, setIsTableVisible] = useState(false)

  // ----- EVENT HANDLERS -----
  // Student List View Handlers
  const handleViewStudentList = () => {
    setShowStudentListView(true)
  }

  const handleCloseStudentListView = () => {
    setShowStudentListView(false)
  }

  const handleSaveStudentList = (updatedStudents) => {
    // Update students in the class object
    setClasses((prevClasses) => {
      const updatedClass = { ...prevClasses[classId] }
      updatedClass.students = updatedStudents

      return {
        ...prevClasses,
        [classId]: updatedClass
      }
    })

    // Update classStudents for backward compatibility
    setClassStudents((prevState) => ({
      ...prevState,
      [classId]: updatedStudents
    }))

    setShowStudentListView(false)
  }

  // Toggle student table visibility
  const toggleStudentTable = () => {
    setIsTableVisible(!isTableVisible)
  }

  // Student Management Handlers
  const handleAddStudentClick = () => {
    setShowAddStudentModal(true)
  }

  const handleCloseAddStudent = () => {
    setShowAddStudentModal(false)
  }

  const handleAddStudent = (studentsData) => {
    console.log('Adding new students with data:', studentsData)

    // Get existing students from the class
    const existingStudents = classes[classId]?.students || students || []
    const existingStudentIds = new Set(
      existingStudents.map((student) => student.id)
    )

    // Filter out students with duplicate IDs
    const newStudents = studentsData.filter((student) => {
      if (existingStudentIds.has(student.id)) {
        return false
      }
      existingStudentIds.add(student.id)
      return true
    })

    // Count duplicates for alert
    const duplicateCount = studentsData.length - newStudents.length
    if (duplicateCount > 0) {
      setDuplicateCount(duplicateCount)
      setShowDuplicateAlert(true)
    }

    if (newStudents.length > 0) {
      // Add new students to the class
      const updatedStudents = [...existingStudents, ...newStudents]

      // Update classes state
      setClasses((prevClasses) => {
        const updatedClass = { ...prevClasses[classId] }
        updatedClass.students = updatedStudents

        return {
          ...prevClasses,
          [classId]: updatedClass
        }
      })

      // Update classStudents for backward compatibility
      setClassStudents((prevState) => ({
        ...prevState,
        [classId]: updatedStudents
      }))

      // Call the service to add students
      sendStudentEmailNotifications(newStudents, classId, currentUser)
    }

    setShowAddStudentModal(false)
  }

  const handleRemoveStudentClick = (student = null) => {
    setSelectedStudent(student)
    setShowRemoveStudentModal(true)
  }

  const handleCloseRemoveStudent = () => {
    setShowRemoveStudentModal(false)
    setSelectedStudent(null)
  }

  const handleRemoveStudent = (removalData) => {
    const { studentIds, reason } = removalData

    // Remove students from the class
    const updatedStudents = (
      classes[classId]?.students ||
      students ||
      []
    ).filter((student) => !studentIds.includes(student.id))

    // Update classes state
    setClasses((prevClasses) => {
      const updatedClass = { ...prevClasses[classId] }
      updatedClass.students = updatedStudents

      return {
        ...prevClasses,
        [classId]: updatedClass
      }
    })

    // Update classStudents for backward compatibility
    setClassStudents((prevState) => ({
      ...prevState,
      [classId]: updatedStudents
    }))

    setShowRemoveStudentModal(false)
  }

  // Grade Reports Handlers
  const handleGradeReportClick = () => {
    setShowGradeReport(true)
  }

  const handleCloseGradeReport = () => {
    setShowGradeReport(false)
  }

  const handleCloseDuplicateAlert = () => {
    setShowDuplicateAlert(false)
  }

  return (
    <>
      <motion.div
        className='teacher-classroom__class-card'
        variants={classCardVariants}
        initial='hidden'
        animate='visible'
        whileHover='hover'
        transition={{ delay: index * 0.1 }}
      >
        {/* Header Section with Icon, Title, and Student Count */}
        <div className='teacher-classroom__class-card-header'>
          <div className='teacher-classroom__class-info'>
            <motion.div
              className='teacher-classroom__class-icon'
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={index === 1 ? calculatorIcon : threeSquareIcon}
                alt='Class'
              />
            </motion.div>
            <div className='teacher-classroom__class-details'>
              <motion.h2
                className='teacher-classroom__class-title'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {title}
              </motion.h2>
              <motion.p
                className='teacher-classroom__next-class'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                Next Mission: {nextClass}
              </motion.p>
            </div>
          </div>
          <motion.button
            className='teacher-classroom__student-count'
            onClick={handleViewStudentList}
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
          >
            {studentCount} Students
          </motion.button>
        </div>

        {/* Action Buttons Section */}
        <motion.div
          className='teacher-classroom__class-actions'
          variants={staggeredGridVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.button
            className='teacher-classroom__action-button'
            onClick={handleAddStudentClick}
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
          >
            <div className='teacher-classroom__button-icon-container'>
              <div className='teacher-classroom__profile-add-icon teacher-classroom__button-icon-container'>
                <motion.img
                  src={ProfileAddIcon}
                  alt='Add Student'
                  variants={iconVariants}
                  whileHover='hover'
                />
              </div>
            </div>
            <span>Add students</span>
          </motion.button>

          <motion.button
            className='teacher-classroom__action-button'
            onClick={() => handleRemoveStudentClick(null)}
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
          >
            <div className='teacher-classroom__button-icon-container teacher-classroom__profile-remove-icon'>
              <motion.img
                src={profileRemoveIcon}
                alt='Remove Student'
                variants={iconVariants}
                whileHover='hover'
              />
            </div>
            <span>Remove students</span>
          </motion.button>

          <motion.button
            className='teacher-classroom__action-button'
            onClick={handleViewStudentList}
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
          >
            <div className='teacher-classroom__button-icon-container teacher-classroom__profile-eye-icon'>
              <motion.img
                src={eyeIcon}
                alt='View Student List'
                variants={iconVariants}
                whileHover='hover'
              />
            </div>
            <span>View student list</span>
          </motion.button>

          <motion.button
            className='teacher-classroom__action-button'
            onClick={handleGradeReportClick}
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
          >
            <div className='teacher-classroom__button-icon-container teacher-classroom__profile-activity-icon'>
              <motion.img
                src={activityIcon}
                alt='Grade Reports'
                variants={iconVariants}
                whileHover='hover'
              />
            </div>
            <span>Grade reports</span>
          </motion.button>

          <motion.button
            className='teacher-classroom__action-button'
            onClick={() => onDeleteClass(classId)}
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
          >
            <div className='teacher-classroom__button-icon-container teacher-classroom__profile-trash-icon'>
              <motion.img
                src={trashIcon}
                alt='Delete Class'
                variants={iconVariants}
                whileHover='hover'
              />
            </div>
            <span>Delete class</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Modal Components */}
      <AnimatePresence mode='wait'>
        {showAddStudentModal && (
          <motion.div
            className='modal-overlay'
            variants={overlayVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <AddStudentModal
              onClose={handleCloseAddStudent}
              onAddStudent={handleAddStudent}
              existingStudents={classes[classId]?.students || students || []}
              currentUser={currentUser}
              classId={classId}
            />
          </motion.div>
        )}

        {showRemoveStudentModal && (
          <motion.div
            className='modal-overlay'
            variants={overlayVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <RemoveStudentModal
              onClose={handleCloseRemoveStudent}
              onRemoveStudent={handleRemoveStudent}
              studentData={selectedStudent}
              classStudents={classes[classId]?.students || []}
            />
          </motion.div>
        )}

        {showGradeReport && (
          <motion.div
            className='modal-overlay'
            variants={overlayVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <GradeReport
              onClose={handleCloseGradeReport}
              classInfo={{
                grade: title,
                studentCount: studentCount,
                classId: classId,
                students: students
              }}
            />
          </motion.div>
        )}

        {showStudentListView && (
          <motion.div
            className='modal-overlay'
            variants={overlayVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <StudentListView
              onClose={handleCloseStudentListView}
              onSave={handleSaveStudentList}
              students={students}
              classTitle={title}
              classId={classId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <InfoModal
        open={showDuplicateAlert}
        title='Duplicate Students Found'
        description={`${duplicateCount} student(s) were skipped because they already exist in this class.`}
        onConfirm={handleCloseDuplicateAlert}
      />
    </>
  )
}

export default TeacherClassCard
