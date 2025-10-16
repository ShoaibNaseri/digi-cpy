import React, { useState, useEffect } from 'react'
import './CreateClassForm.css'

// Import Icons
import { FaRegCircleCheck } from 'react-icons/fa6'
import {
  HiAcademicCap,
  HiBuildingOffice2,
  HiClock,
  HiCalendar
} from 'react-icons/hi2'
import ApproveIcon from '../../../../../assets/icons/approve.png'
import VectorIcon from '../../../../../assets/icons/vector.svg'
import MarkIcon from '../../../../../assets/icons/mark.svg'
import RefreshIcon from '../../../../../assets/icons/refresh.svg'
import SendIcon from '../../../../../assets/icons/send.png'

// Import Context
import { useAuth } from '@/context/AuthContext'

// Import React Query hooks
import { useCreateTeacherClassroom } from '@/hooks/useTeacherQueries'

// Import Utils
import formatTime from '@/utils/formatTime'

// Import Components
import ClassFormSummary from './Components/ClassFormSummary.jsx'
import ClassDaysSelector from './Components/ClassDaysSelector.jsx'
import ClassFrequencySelector from './Components/ClassFrequencySelector.jsx'
import ClassFormHeader from './Components/ClassFormHeader.jsx'
import StudentImportSection from './Components/StudentImportSection.jsx'
import CustomDropdown from '../../profile/CustomDropdown.jsx'

// Import Modals
import ExcelUploadModal from './Modals/ExcelUploadModal.jsx'
import AddStudentModal from '../TeacherClassCard/modals/AddStudentModal.jsx'
import ConfirmationModal from '@/components/common/ConfirmationModal'
import InfoModal from '@/components/common/InfoModal'

// Import Logic
import {
  missionList,
  calculateMissionSchedule,
  prepareFormDataForClassroom,
  validateClassForm,
  getFormattedClassDays,
  getFormattedFrequency
} from '@/utils/teacher/classDataLogic'

// Keep using the original imports from firebaseLogic
// This works because firebaseLogic.js now re-exports the functions from seatsManageService
import {
  saveClassToFirebase,
  saveMissionsToFirebase,
  sendStudentEmailNotifications,
  updateSchoolSeatUsage,
  updateSchoolAvailableSeats,
  checkSchoolHasEnoughSeats
} from '@/utils/createClassLogic/firebaseLogic'

// Initial form state
const initialFormState = {
  grade: '',
  className: '',
  numberOfStudents: '',
  startDate: '',
  classDays: {
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false,
    Sun: false
  },
  frequency: 'weekly',
  enableAIChatroom: false,
  students: [],
  selectedMission: 'All 10 Missions',
  scheduleTime: ''
}

const CreateClassForm = ({ onCancel, onCreateClass }) => {
  const { currentUser } = useAuth()

  // React Query mutation for creating classroom
  const createClassroomMutation = useCreateTeacherClassroom()

  // Form data state
  const [formData, setFormData] = useState(initialFormState)
  const [formattedStartDate, setFormattedStartDate] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  // Wizard step state
  const [currentStep, setCurrentStep] = useState(1) // 1: Class Details, 2: Lesson Frequency, 3: Student Import, 4: Summary, 5: Complete
  const [error, setError] = useState(null)
  const [createdClassId, setCreatedClassId] = useState(null)

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false)
  const [duplicateCount, setDuplicateCount] = useState(0)
  const [activeTab, setActiveTab] = useState('upload') // 'upload' or 'manual'

  // Initialize time with current time
  useEffect(() => {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`

    setFormData((prevData) => ({
      ...prevData,
      scheduleTime: currentTime
    }))
  }, [])

  // Form validation and summary visibility
  useEffect(() => {
    validateForm()
    updateSummaryVisibility()

    // Initialize formatted date if startDate already exists
    if (formData.startDate) {
      formatStartDate(formData.startDate)
    }
  }, [formData])

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'numberOfStudents') {
      // Allow only numeric input
      const numericValue = value.replace(/\D/g, '')
      setFormData({
        ...formData,
        [name]: numericValue
      })
    } else if (name === 'startDate') {
      // Store the raw date value in the form data
      setFormData({
        ...formData,
        [name]: value
      })

      // Format the date for display
      formatStartDate(value)
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  // Format start date for display
  const formatStartDate = (dateValue) => {
    if (dateValue) {
      const date = new Date(dateValue)
      // Set hours to noon to avoid timezone issues
      date.setHours(12, 0, 0, 0)
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      setFormattedStartDate(formatted)
    } else {
      setFormattedStartDate('')
    }
  }

  // Handle checkbox changes for class days
  const handleCheckboxChange = (day) => {
    setFormData({
      ...formData,
      classDays: {
        ...formData.classDays,
        [day]: !formData.classDays[day]
      }
    })
  }

  // Function to check if summary should be shown
  const updateSummaryVisibility = () => {
    const hasClassName = formData.className.trim() !== ''
    const hasGrade = formData.grade.trim() !== ''
    const hasStartDate = formData.startDate.trim() !== ''
    const hasSelectedDay = Object.values(formData.classDays).some(
      (selected) => selected
    )

    // Show summary if any of the main fields has input
    setShowSummary(hasClassName || hasGrade || hasStartDate || hasSelectedDay)
  }

  // Handle frequency change
  const handleFrequencyChange = (frequency) => {
    setFormData({
      ...formData,
      frequency
    })
  }

  // Validate the form
  const validateForm = () => {
    const { isValid, hasSelectedDay } = validateClassForm(formData)
    setIsFormValid(isValid)
    return { isValid, hasSelectedDay }
  }

  // Check if form is ready for submission (step 5)
  const isFormReadyForSubmission = () => {
    if (currentStep !== 5) return false

    const { isValid, hasSelectedDay } = validateClassForm(formData)
    return isValid && hasSelectedDay
  }

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Validate current step
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1: // Class Details
        return (
          formData.className.trim() !== '' &&
          formData.grade.trim() !== '' &&
          formData.scheduleTime.trim() !== '' &&
          formData.startDate.trim() !== ''
        )
      case 2: // Lesson Frequency
        return Object.values(formData.classDays).some((selected) => selected)
      case 3: // Student Import
        return true // Student import is optional
      case 4: // Summary
        return true // Summary is always valid
      case 5: // Complete
        return true // Complete is always valid
      default:
        return false
    }
  }

  // Check if we can proceed to the next step
  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: // Class Details
        return (
          formData.className.trim() !== '' &&
          formData.grade.trim() !== '' &&
          formData.scheduleTime.trim() !== '' &&
          formData.startDate.trim() !== ''
        )
      case 2: // Lesson Frequency
        return Object.values(formData.classDays).some((selected) => selected)
      case 3: // Student Import
        return true // Can always proceed from student import
      case 4: // Summary
        return true // Can always proceed from summary
      default:
        return false
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if form is valid, specifically for class days
    const { hasSelectedDay, isValid } = validateForm()

    if (!hasSelectedDay) {
      setError('Please select at least one day of the week')
      return
    }

    // Check if form is valid
    if (!isValid) {
      setError('Please complete all required fields to create a class')
      return
    }

    setError(null)

    try {
      // Ensure currentUser has a valid schoolId, which is important for logService
      const enhancedUser = { ...currentUser }

      // If there's no schoolId or the schoolId is not a valid ID in Firebase, set it to a valid value
      if (!enhancedUser.schoolId) {
        console.warn('Warning: currentUser missing schoolId')
        enhancedUser.schoolId = '' // Use the value you see in Firebase
      }

      // Prepare data for the mutation
      const classData = {
        ...formData,
        currentUser: enhancedUser,
        schoolId: enhancedUser.schoolId
      }

      // Use React Query mutation
      const result = await createClassroomMutation.mutateAsync(classData)
      setCreatedClassId(result.classId)

      // Store the enhanced data for later
      window.pendingClassData = result.enhancedFormData

      // Move to success screen
      setCurrentStep(5)
    } catch (error) {
      console.error('Error creating class:', error)
      setError(error.message || 'Failed to create class. Please try again.')
    }
  }

  // Handle Excel upload completion
  const handleUploadComplete = (classData) => {
    // Process class data - integrate with current form data
    if (classData && classData.length > 0 && classData[0].students) {
      // Extract students from uploaded data
      const uploadedStudents = classData[0].students || []

      // Get existing students from the form
      const existingStudents = formData.students || []
      const existingStudentIds = new Set(
        existingStudents.map((student) => student.id)
      )

      // Filter out students with duplicate IDs
      const newStudents = uploadedStudents.filter((student) => {
        if (existingStudentIds.has(student.id)) {
          console.warn(
            `Student with ID ${student.id} already exists in class. Skipping.`
          )
          return false
        }
        return true
      })

      // Show alert if some students were skipped due to duplicates
      const skippedCount = uploadedStudents.length - newStudents.length
      if (skippedCount > 0) {
        setDuplicateCount(skippedCount)
        setShowDuplicateAlert(true)
        return
      }

      // Update form data with students
      setFormData((prevData) => ({
        ...prevData,
        students: [...(prevData.students || []), ...newStudents],
        // Update number of students field
        numberOfStudents: String(
          parseInt(prevData.numberOfStudents || '0', 10) + newStudents.length
        )
      }))
    }
  }

  // Toggle upload modal
  const toggleUploadModal = () => {
    setShowUploadModal(!showUploadModal)
  }

  // Toggle add student modal
  const toggleAddStudentModal = () => {
    setShowAddStudentModal(!showAddStudentModal)
  }

  // Handle CSV file upload directly
  const handleCSVUpload = (file) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csvText = event.target.result
        const lines = csvText.split('\n')
        const headers = lines[0]
          .split(',')
          .map((header) => header.trim().toLowerCase())

        // Find the column indices for required fields
        const firstNameIndex = headers.findIndex(
          (header) =>
            header.includes('first') ||
            header.includes('firstname') ||
            header.includes('first name')
        )
        const lastNameIndex = headers.findIndex(
          (header) =>
            header.includes('last') ||
            header.includes('lastname') ||
            header.includes('last name')
        )
        const studentIdIndex = headers.findIndex(
          (header) =>
            header.includes('id') ||
            header.includes('studentid') ||
            header.includes('student id')
        )

        if (firstNameIndex === -1 || lastNameIndex === -1) {
          alert('CSV must contain columns for first name and last name')
          return
        }

        // Parse CSV data
        const students = []
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map((value) => value.trim())
            const student = {
              id:
                studentIdIndex !== -1 ? values[studentIdIndex] : `student_${i}`,
              firstName: values[firstNameIndex],
              lastName: values[lastNameIndex],
              email: `${values[firstNameIndex].toLowerCase()}.${values[
                lastNameIndex
              ].toLowerCase()}@example.com`
            }
            students.push(student)
          }
        }

        // Add students to form
        handleAddStudent(students)
      } catch (error) {
        console.error('Error parsing CSV:', error)
        alert('Error reading CSV file. Please check the format and try again.')
      }
    }

    reader.onerror = () => {
      alert('Error reading file')
    }

    reader.readAsText(file)
  }

  // Handle adding students manually
  const handleAddStudent = (studentsData) => {
    // Get existing students from the form
    const existingStudents = formData.students || []
    const existingStudentIds = new Set(
      existingStudents.map((student) => student.id)
    )

    // Filter out students with duplicate IDs
    const newStudents = studentsData.filter((student) => {
      if (existingStudentIds.has(student.id)) {
        console.warn(
          `Student with ID ${student.id} already exists in class. Skipping.`
        )
        return false
      }
      return true
    })

    // Show alert if some students were skipped due to duplicates
    const skippedCount = studentsData.length - newStudents.length
    if (skippedCount > 0) {
      setDuplicateCount(skippedCount)
      setShowDuplicateAlert(true)
      return
    }

    // Update the form data with the added students
    setFormData((prevData) => ({
      ...prevData,
      students: [...(prevData.students || []), ...newStudents],
      // Update number of students field
      numberOfStudents: String(
        parseInt(prevData.numberOfStudents || '0', 10) + newStudents.length
      )
    }))

    // Close the modal
    setShowAddStudentModal(false)
  }

  // Handler for the "Close" button on the setup complete screen
  const handleCloseSetupComplete = () => {
    // Notify the parent that classes were created
    onCreateClass({ success: true })

    // Clean up the temporary data
    delete window.pendingClassData
  }

  // Handler for closing duplicate alert
  const handleCloseDuplicateAlert = () => {
    setShowDuplicateAlert(false)
  }

  // Get formatted date for summary
  const getFormattedDate = () => {
    if (!formData.startDate) {
      return 'Not set'
    }
    return formattedStartDate
  }

  // If we're showing the completion screen, just render that
  if (currentStep === 5) {
    return (
      <div className='class-setup-success-overlay'>
        <div className='class-setup-success-container'>
          {/* Success Icon */}
          <div className='class-setup-success-icon'>
            <img src={ApproveIcon} alt='Success' width='32' height='32' />
          </div>

          {/* Title and Description */}
          <h2 className='class-setup-success-title'>Class Setup Complete!</h2>
          <p className='class-setup-success-description'>
            Your classroom is ready for students to join.
          </p>

          {/* Instructions Box */}
          <div className='class-setup-instructions-box'>
            <div className='class-setup-instructions-header'>
              <h3 className='class-setup-instructions-title'>
                When you're ready to launch Digipalz:
              </h3>
              <div className='class-setup-info-icon'>
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M12 16v-4'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                  />
                  <path
                    d='M12 8h.01'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                  />
                </svg>
              </div>
            </div>

            <div className='class-setup-instructions-list'>
              <div className='class-setup-instruction-item'>
                <div className='class-setup-instruction-icon'>
                  <img
                    src={VectorIcon}
                    alt='Access Code'
                    width='20'
                    height='20'
                  />
                </div>
                <span>Go to the Access Code tab in your dashboard.</span>
              </div>

              <div className='class-setup-instruction-item'>
                <div className='class-setup-instruction-icon'>
                  <img
                    src={RefreshIcon}
                    alt='Generate Code'
                    width='20'
                    height='20'
                  />
                </div>
                <span>
                  Click Generate Access Code to create your class code.
                </span>
              </div>

              <div className='class-setup-instruction-item'>
                <div className='class-setup-instruction-icon'>
                  <img src={SendIcon} alt='Share Code' width='20' height='20' />
                </div>
                <span>Share this code with your students.</span>
              </div>
            </div>
          </div>

          {/* Website Section */}
          <div className='class-setup-website-section'>
            <div className='class-setup-website-icon'>
              <img src={MarkIcon} alt='Digipalz' width='24' height='24' />
            </div>
            <div className='class-setup-website-text'>
              Students Visit:{' '}
              <span className='class-setup-website-url'>
                www.digipalz.io/access-code
              </span>{' '}
              and enter the code where it says{' '}
              <span className='class-setup-website-black-url'>
                "Join Class with Access Code"
              </span>
              .
            </div>
          </div>

          {/* Action Button */}
          <div className='class-setup-success-actions'>
            <button
              className='class-setup-generate-button'
              onClick={handleCloseSetupComplete}
            >
              <div className='class-setup-button-icon'>
                <img src={VectorIcon} alt='Generate' width='20' height='20' />
              </div>
              Generate Access Code
            </button>
          </div>

          {/* Close Button */}
          <button
            className='class-setup-close-button'
            onClick={handleCloseSetupComplete}
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  // Render the wizard form
  return (
    <div className='tcr-class-form-container'>
      {/* Form Header */}
      <ClassFormHeader onCancel={onCancel} />

      {/* Form content in an integrated card */}
      <div className='tcr-class-form-content-container'>
        <div className='tcr-class-form-card'>
          {/* Step 1: Class Details */}
          {currentStep === 1 && (
            <div className='wizard-step-content'>
              {/* Progress Bar for Step 1 */}
              <div className='wizard-progress-container'>
                <div className='wizard-progress-bar'>
                  <div
                    className='wizard-progress-fill'
                    style={{ width: `${(currentStep / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className='wizard-step-header'>
                <h2 className='wizard-step-title'>Create New Class</h2>
                <p className='wizard-step-subtitle'>
                  Let's create your class and schedule missions.
                </p>
              </div>

              <div className='tcr-form-section'>
                <div className='tcr-form-field-group'>
                  <label htmlFor='className' className='tcr-required-field'>
                    Class Name
                  </label>
                  <div className='tcr-input-with-icon'>
                    <div className='tcr-input-icon'>
                      <HiBuildingOffice2 size={24} color='#4B5563' />
                    </div>
                    <input
                      type='text'
                      id='className'
                      name='className'
                      className='tcr-form-control tcr-input-with-icon-control'
                      placeholder='Name Your Class'
                      value={formData.className}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className='tcr-form-field-group'>
                  <label htmlFor='grade' className='tcr-required-field'>
                    Grade Level
                  </label>
                  <div className='tcr-input-with-icon'>
                    <div className='tcr-input-icon'>
                      <HiAcademicCap size={24} color='#4B5563' />
                    </div>
                    <CustomDropdown
                      value={formData.grade}
                      onChange={(value) =>
                        handleInputChange({
                          target: { name: 'grade', value }
                        })
                      }
                      options={[
                        { value: '1', label: 'Grade 1' },
                        { value: '2', label: 'Grade 2' },
                        { value: '3', label: 'Grade 3' },
                        { value: '4', label: 'Grade 4' },
                        { value: '5', label: 'Grade 5' },
                        { value: '6', label: 'Grade 6' }
                      ]}
                      placeholder='Select Grade'
                    />
                  </div>
                </div>

                <div className='tcr-form-field-group'>
                  <label htmlFor='scheduleTime' className='tcr-required-field'>
                    Class Time
                  </label>
                  <div className='tcr-input-with-icon'>
                    <div
                      className='tcr-input-icon tcr-clickable-icon'
                      onClick={() => {
                        const timeInput =
                          document.getElementById('scheduleTime')
                        if (timeInput.showPicker) {
                          timeInput.showPicker()
                        } else {
                          timeInput.focus()
                          timeInput.click()
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          const timeInput =
                            document.getElementById('scheduleTime')
                          if (timeInput.showPicker) {
                            timeInput.showPicker()
                          } else {
                            timeInput.focus()
                            timeInput.click()
                          }
                        }
                      }}
                      tabIndex='0'
                      role='button'
                      aria-label='Open time picker'
                      title='Click to open time picker'
                    >
                      <HiClock size={24} color='#4B5563' />
                    </div>
                    <input
                      type='time'
                      id='scheduleTime'
                      name='scheduleTime'
                      className='tcr-form-control tcr-input-with-icon-control'
                      value={formData.scheduleTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Mission Start Date - Moved from Step 2 */}
                <div className='tcr-form-field-group'>
                  <label htmlFor='startDate' className='tcr-required-field'>
                    Mission Start Date
                  </label>
                  <div className='tcr-input-with-icon'>
                    <div
                      className='tcr-input-icon tcr-clickable-icon'
                      onClick={() => {
                        const dateInput = document.getElementById('startDate')
                        if (dateInput.showPicker) {
                          dateInput.showPicker()
                        } else {
                          dateInput.focus()
                          dateInput.click()
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          const dateInput = document.getElementById('startDate')
                          if (dateInput.showPicker) {
                            dateInput.showPicker()
                          } else {
                            dateInput.focus()
                            dateInput.click()
                          }
                        }
                      }}
                      tabIndex='0'
                      role='button'
                      aria-label='Open date picker'
                      title='Click to open date picker'
                    >
                      <HiCalendar size={24} color='#4B5563' />
                    </div>
                    <input
                      type='date'
                      id='startDate'
                      name='startDate'
                      className='tcr-form-control tcr-input-with-icon-control'
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Lesson Frequency */}
          {currentStep === 2 && (
            <div className='wizard-step-content'>
              {/* Progress Bar for Step 2 */}
              <div className='wizard-progress-container'>
                <div className='wizard-progress-bar'>
                  <div
                    className='wizard-progress-fill'
                    style={{ width: `${(currentStep / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className='wizard-step-header'>
                <h2 className='wizard-step-title'>Set Lesson Frequency</h2>
              </div>

              {/* Class Frequency */}
              <ClassFrequencySelector
                frequency={formData.frequency}
                onFrequencyChange={handleFrequencyChange}
              />

              {/* Class Days */}
              <ClassDaysSelector
                classDays={formData.classDays}
                onCheckboxChange={handleCheckboxChange}
              />
            </div>
          )}

          {/* Step 3: Student Import */}
          {currentStep === 3 && (
            <div className='wizard-step-content'>
              {/* Progress Bar for Step 3 */}
              <div className='wizard-progress-container'>
                <div className='wizard-progress-bar'>
                  <div
                    className='wizard-progress-fill'
                    style={{ width: `${(currentStep / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className='wizard-step-header'>
                <h2 className='wizard-step-title'>Import Students</h2>
                <p className='wizard-step-subtitle'>
                  Import students from a CSV file or add them manually.
                </p>
              </div>

              {/* Student Import Section */}
              <StudentImportSection
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onFileUpload={handleCSVUpload}
                toggleAddStudentModal={toggleAddStudentModal}
              />
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 4 && (
            <div className='wizard-step-content'>
              {/* Progress Bar for Step 4 */}
              <div className='wizard-progress-container'>
                <div className='wizard-progress-bar'>
                  <div
                    className='wizard-progress-fill'
                    style={{ width: `${(currentStep / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className='wizard-step-header'>
                <h2 className='wizard-step-title'>Review and Confirm</h2>
                <p className='wizard-step-subtitle'>
                  Review your class details before final confirmation.
                </p>
              </div>

              {/* Summary Section */}
              <ClassFormSummary
                formData={formData}
                formattedStartDate={formattedStartDate}
                getFormattedClassDays={() =>
                  getFormattedClassDays(formData.classDays)
                }
                getFormattedFrequency={() =>
                  getFormattedFrequency(formData.frequency)
                }
                getFormattedDate={getFormattedDate}
                formatTime={formatTime}
              />
            </div>
          )}

          {/* Step 5: Final Confirmation */}
          {currentStep === 5 && (
            <div className='wizard-step-content'>
              {/* Progress Bar for Step 5 */}
              <div className='wizard-progress-container'>
                <div className='wizard-progress-bar'>
                  <div
                    className='wizard-progress-fill'
                    style={{ width: `${(currentStep / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className='wizard-step-header'>
                <h2 className='wizard-step-title'>
                  Ready to Create Your Class
                </h2>
                <p className='wizard-step-subtitle'>
                  Review your class details one final time before creating.
                </p>
              </div>

              {/* Final Summary */}
              <ClassFormSummary
                formData={formData}
                formattedStartDate={formattedStartDate}
                getFormattedClassDays={() =>
                  getFormattedClassDays(formData.classDays)
                }
                getFormattedFrequency={() =>
                  getFormattedFrequency(formData.frequency)
                }
                getFormattedDate={getFormattedDate}
                formatTime={formatTime}
              />

              {/* Additional confirmation text */}
              <div className='tcr-form-section'>
                <div className='tcr-form-field-group'>
                  <p
                    style={{
                      textAlign: 'center',
                      color: '#6b7280',
                      fontSize: '14px',
                      marginTop: '20px'
                    }}
                  >
                    Click "Create Class" below to set up your classroom and
                    schedule missions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Navigation Buttons */}
          <div className='wizard-navigation'>
            {currentStep === 1 ? (
              <button
                type='button'
                className='wizard-cancel-button'
                onClick={onCancel}
              >
                Cancel
              </button>
            ) : (
              <button
                type='button'
                className='wizard-cancel-button'
                onClick={prevStep}
              >
                Back
              </button>
            )}

            <div className='wizard-step-buttons'>
              {currentStep < 4 ? (
                <button
                  type='button'
                  className='wizard-next-button'
                  onClick={nextStep}
                  disabled={!canProceedToNext()}
                >
                  Next
                </button>
              ) : currentStep === 4 ? (
                <button
                  type='button'
                  className='wizard-confirm-button'
                  onClick={handleSubmit}
                  disabled={
                    createClassroomMutation.isPending ||
                    isFormReadyForSubmission()
                  }
                >
                  {createClassroomMutation.isPending
                    ? 'Creating...'
                    : 'Create Class'}
                </button>
              ) : null}
            </div>
          </div>

          {error && <div className='tcr-error-message'>{error}</div>}
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <ExcelUploadModal
          onClose={toggleUploadModal}
          onUploadComplete={handleUploadComplete}
          isModal={true}
        />
      )}

      {showAddStudentModal && (
        <AddStudentModal
          onClose={toggleAddStudentModal}
          onAddStudent={handleAddStudent}
          existingStudents={formData.students || []}
          currentUser={currentUser}
          classId={null}
        />
      )}

      <InfoModal
        open={showDuplicateAlert}
        title='Duplicate Students Found'
        description={`${duplicateCount} student(s) were skipped because they already exist in this class.`}
        onConfirm={handleCloseDuplicateAlert}
      />
    </div>
  )
}

export default CreateClassForm
