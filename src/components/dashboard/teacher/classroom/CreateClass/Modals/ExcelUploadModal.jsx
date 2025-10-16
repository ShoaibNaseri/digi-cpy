import React, { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import './ExcelUploadModal.css'
import { FaCloudUploadAlt } from 'react-icons/fa'
import {
  processStudentData,
  validateStudentData
} from '@/utils/teacher/studentDataProcessor'
// Import AI helper utilities
import {
  mapCsvHeadersWithAI,
  transformCsvDataWithMapping
} from '@/utils/teacher/aiCsvHelper'
import {
  processWordDocument,
  extractWordStudentDataWithAI
} from '@/utils/teacher/aiWordHelper'
// PDF utilities are imported but commented out
// import { processPdfDocument, extractPdfStudentDataWithAI } from '@/utils/teacher/aiPdfHelper'

const ExcelUploadModal = ({
  onClose,
  onUploadComplete,
  onRawData,
  isModal = true
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const fileInputRef = useRef(null)

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setErrorMessage('')
    setValidationErrors([])
    setShowValidationErrors(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    setErrorMessage('')
    setValidationErrors([])
    setShowValidationErrors(false)
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  // Process uploaded file
  const handleFileUpload = async (file) => {
    setFileName(file.name)
    setUploadStatus('Processing...')
    setIsProcessing(true)

    try {
      // Determine file type based on extension
      const fileType = getFileType(file)
      let processedData = null
      let jsonData = null

      if (fileType === 'excel' || fileType === 'csv') {
        // Process Excel/CSV files with existing logic
        const result = await processExcelOrCsvFile(file)
        jsonData = result.jsonData
        processedData = result.processedData
      } else if (fileType === 'word') {
        // Process Word documents
        setUploadStatus('Processing Word document...')
        jsonData = await processWordDocument(file)
        console.log('jsonData', jsonData)
        // Try standard processing first
        processedData = processStudentData(jsonData)

        // If standard processing fails, use AI
        if (!isDataValid(processedData)) {
          setUploadStatus('Using AI to analyze Word document...')
          const textContent =
            typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData)
          processedData = await extractWordStudentDataWithAI(textContent)
        }
      } else {
        /* PDF processing is commented out per client request
      else if (fileType === 'pdf') {
        // Process PDF files
        setUploadStatus('Processing PDF document...');
        
        try {
          // Try to extract PDF text
          const pdfContent = await processPdfDocument(file);
          
          // Directly use AI to process PDF content, without attempting standard processing
          setUploadStatus('Using AI to analyze PDF document...');
          processedData = await extractPdfStudentDataWithAI(pdfContent);
          
          // For consistency, also set jsonData
          jsonData = { pdfContent };
        } catch (pdfError) {
          console.error('PDF processing error:', pdfError);
          throw new Error(`PDF processing failed: ${pdfError.message}`);
        }
      } 
      */
        throw new Error('Unsupported file type')
      }

      // Ensure processedData is not null
      if (!processedData) {
        processedData = [{ title: 'Imported Class', students: [] }]
      }

      // Validate the uploaded data
      const validationErrors = validateUploadedData(processedData)
      setValidationErrors(validationErrors)

      if (validationErrors.length > 0) {
        // Show validation errors
        setShowValidationErrors(true)
        setUploadStatus('Upload completed with validation errors')
        setErrorMessage(
          `Found ${validationErrors.length} validation error(s). Please review and fix the issues.`
        )

        // Still pass the data to parent, but filtered to only valid students
        const filteredData = filterValidStudents(processedData)

        if (onRawData && jsonData) {
          onRawData(jsonData)
        }

        if (onUploadComplete) {
          onUploadComplete(filteredData)
        }

        setIsProcessing(false)
        return
      }

      // Clear any previous validation errors
      setValidationErrors([])
      setShowValidationErrors(false)
      setErrorMessage('')

      // Handle results
      if (onRawData && jsonData) {
        onRawData(jsonData)
      }

      if (onUploadComplete) {
        onUploadComplete(processedData)
      }

      // Check if student data was successfully extracted
      const studentsCount = processedData[0]?.students?.length || 0
      if (studentsCount > 0) {
        setUploadStatus(
          `Upload successful! Extracted ${studentsCount} student records.`
        )
      } else {
        setUploadStatus(
          'Upload successful, but no student records could be extracted.'
        )
      }

      setIsProcessing(false)

      // Auto close modal after a delay
      setTimeout(() => {
        setUploadStatus('')
        setFileName(null)
        if (isModal && onClose) {
          onClose()
        }
      }, 3000)
    } catch (error) {
      console.error(`Error processing file:`, error)
      setErrorMessage(`Error reading file: ${error.message}`)
      setUploadStatus('Upload failed')
      setIsProcessing(false)
    }
  }

  // Process Excel or CSV files
  const processExcelOrCsvFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const data = e.target.result
          // Read the file using SheetJS
          const workbook = XLSX.read(data, {
            type: 'binary',
            cellDates: true,
            cellNF: true,
            cellStyles: true
          })

          // Read first worksheet
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false })

          // Validate data
          if (jsonData.length === 0) {
            throw new Error('File has no data or incorrect format.')
          }

          // Get headers (column names)
          const headers = Object.keys(jsonData[0])

          // Try processing with standard logic first
          let processedData = processStudentData(jsonData)

          // If standard processing fails to extract required fields, use AI to help
          if (!isDataValid(processedData)) {
            setUploadStatus('Using AI to analyze file format...')

            // Use OpenAI to map headers
            const headerMapping = await mapCsvHeadersWithAI(headers, jsonData)

            if (headerMapping) {
              // Transform data using AI-generated mapping
              const transformedData = transformCsvDataWithMapping(
                jsonData,
                headerMapping
              )
              // Try processing again with transformed data
              processedData = processStudentData(transformedData)

              if (isDataValid(processedData)) {
                setUploadStatus('AI successfully interpreted your file')
              } else {
                setUploadStatus(
                  'Upload successful, but some data may be incomplete'
                )
              }
            }
          }

          resolve({ jsonData, processedData })
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error('Error reading file.'))
      }

      reader.readAsBinaryString(file)
    })
  }

  // Determine file type based on extension
  const getFileType = (file) => {
    const extension = file.name.split('.').pop().toLowerCase()

    if (['xlsx', 'xls'].includes(extension)) {
      return 'excel'
    } else if (extension === 'csv') {
      return 'csv'
    } else if (['doc', 'docx'].includes(extension)) {
      return 'word'
    } else {
      /* PDF detection is commented out
    else if (extension === 'pdf') {
      return 'pdf';
    } 
    */
      return 'unknown'
    }
  }

  // Check if processed data has the required fields based on the studentDataProcessor format
  const isDataValid = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) return false

    // Check if we have class data with students
    if (
      !data[0] ||
      !data[0].students ||
      !Array.isArray(data[0].students) ||
      data[0].students.length === 0
    )
      return false

    // Check if at least one student has firstName/lastName and studentId
    return data[0].students.some(
      (student) =>
        ((student.firstName && student.firstName.trim() !== '') ||
          (student.lastName && student.lastName.trim() !== '')) &&
        student.studentId &&
        student.studentId.trim() !== ''
    )
  }

  // Validate uploaded student data with detailed error reporting
  const validateUploadedData = (processedData) => {
    const errors = []

    if (
      !processedData ||
      !Array.isArray(processedData) ||
      processedData.length === 0
    ) {
      errors.push('No data found in the uploaded file')
      return errors
    }

    const classData = processedData[0]
    if (
      !classData ||
      !classData.students ||
      !Array.isArray(classData.students)
    ) {
      errors.push('No student data found in the uploaded file')
      return errors
    }

    const students = classData.students
    if (students.length === 0) {
      errors.push('No student records found in the uploaded file')
      return errors
    }

    // Track duplicates
    const studentIds = new Set()
    const emails = new Set()

    students.forEach((student, index) => {
      const rowNumber = index + 1
      const studentValidation = validateStudentData(student)

      if (!studentValidation.isValid) {
        Object.entries(studentValidation.errors).forEach(([field, error]) => {
          errors.push(`Row ${rowNumber}: ${field} - ${error}`)
        })
      }

      // Check for duplicate student IDs
      if (student.studentId && studentIds.has(student.studentId)) {
        errors.push(
          `Row ${rowNumber}: Duplicate student ID "${student.studentId}"`
        )
      } else if (student.studentId) {
        studentIds.add(student.studentId)
      }

      // Check for duplicate emails
      if (student.email && emails.has(student.email)) {
        errors.push(`Row ${rowNumber}: Duplicate email "${student.email}"`)
      } else if (student.email) {
        emails.add(student.email)
      }
    })

    return errors
  }

  // Filter out invalid students and return only valid ones
  const filterValidStudents = (processedData) => {
    if (
      !processedData ||
      !Array.isArray(processedData) ||
      processedData.length === 0
    ) {
      return [{ title: 'Imported Class', students: [] }]
    }

    const classData = processedData[0]
    if (
      !classData ||
      !classData.students ||
      !Array.isArray(classData.students)
    ) {
      return [{ title: 'Imported Class', students: [] }]
    }

    const validStudents = classData.students.filter((student) => {
      const validation = validateStudentData(student)
      return validation.isValid
    })

    return [
      {
        title: classData.title || 'Imported Class',
        students: validStudents
      }
    ]
  }

  // Handle keyboard events for the browse label
  const handleBrowseLabelKeyDown = (e) => {
    // Trigger file browser when Enter or Space is pressed
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    }
  }

  // Set up keyboard accessibility for the browse label
  useEffect(() => {
    const browseLabel = document.querySelector('.excel-uploader-label')
    if (browseLabel) {
      // Add keyboard support
      browseLabel.setAttribute('tabindex', '0')
      browseLabel.setAttribute('role', 'button')
      browseLabel.addEventListener('keydown', handleBrowseLabelKeyDown)

      // Remove event listener on cleanup
      return () => {
        browseLabel.removeEventListener('keydown', handleBrowseLabelKeyDown)
      }
    }
  }, [])

  // Uploader component content
  const uploaderContent = (
    <div className='excel-uploader-container'>
      <h2 className='excel-uploader-title'>Upload Student List</h2>

      <div
        className={`excel-uploader-dropzone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className='excel-uploader-content'>
          <FaCloudUploadAlt size={60} />
          <p className='excel-uploader-text'>
            Drag and drop file here, or
            <label
              className='excel-uploader-label'
              tabIndex='0'
              role='button'
              onKeyDown={handleBrowseLabelKeyDown}
            >
              browse
              <input
                ref={fileInputRef}
                type='file'
                accept='.csv,.xlsx,.xls,.doc,.docx'
                className='excel-uploader-input'
                onChange={handleFileChange}
                tabIndex='-1'
              />
            </label>
          </p>
          <p className='excel-uploader-help-text'>
            Supported formats: .csv, .xlsx, .xls, .doc, .docx
          </p>
        </div>
      </div>

      {fileName && (
        <div className='excel-uploader-file-info'>
          <span className='excel-uploader-file-name'>{fileName}</span>
          <span className='excel-uploader-status'>{uploadStatus}</span>
          {isProcessing && <div className='excel-uploader-loader'></div>}
        </div>
      )}

      {errorMessage && (
        <div className='excel-uploader-error'>{errorMessage}</div>
      )}

      {showValidationErrors && validationErrors.length > 0 && (
        <div className='excel-uploader-validation-errors'>
          <h4>Validation Errors:</h4>
          <div className='excel-uploader-error-list'>
            {validationErrors.slice(0, 10).map((error, index) => (
              <div key={index} className='excel-uploader-error-item'>
                {error}
              </div>
            ))}
            {validationErrors.length > 10 && (
              <div className='excel-uploader-error-item'>
                ... and {validationErrors.length - 10} more errors
              </div>
            )}
          </div>
          <p className='excel-uploader-validation-note'>
            Only valid student records will be imported. Please fix the errors
            and upload again for complete data.
          </p>
        </div>
      )}

      <div className='excel-uploader-template'>
        <h3>Supported File Formats</h3>
        <ul>
          <li>
            <strong>Spreadsheets</strong> (.csv, .xlsx, .xls): Please ensure
            your file contains columns for student names, IDs, and emails.
          </li>
          <li>
            <strong>Word Documents</strong> (.doc, .docx): Should contain a
            table or structured text with student information.
          </li>
          {/* PDF section removed
          <li>
            <strong>PDF Files</strong> (.pdf): Should contain structured student information.
          </li>
          */}
        </ul>
        <p className='excel-uploader-ai-note'>
          <strong>Note:</strong> AI assistance is available to help interpret
          non-standard file formats.
        </p>
      </div>
    </div>
  )

  // If not in modal mode, just return the uploader content
  if (!isModal) {
    return uploaderContent
  }

  // If in modal mode, wrap with modal container
  return (
    <div className='tcr-modal-overlay'>
      <div className='tcr-modal-backdrop' onClick={onClose}></div>
      <div className='tcr-modal-content'>
        <div className='tcr-modal-header'>
          <h2>Upload Student List</h2>
          <button className='tcr-modal-close-button' onClick={onClose}>
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M18 6L6 18'
                stroke='white'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M6 6L18 18'
                stroke='white'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>
        <div className='tcr-modal-body'>{uploaderContent}</div>
      </div>
    </div>
  )
}

export default ExcelUploadModal
