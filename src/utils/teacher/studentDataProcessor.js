// utils/teacher/studentDataProcessor.js

// Import the name capitalization utility
import {
  capitalizeName,
  capitalizeStudentNames,
  splitCompoundName
} from './nameUtils'

// Process student data from Excel/CSV uploads
export const processStudentData = (data) => {
  try {
    // Extract only name, student ID, and email data
    const extractedStudents = data
      .map((row) => {
        // First check if the row contains specific first/last name fields
        let firstName =
          row.firstName ||
          row.FirstName ||
          row['First Name'] ||
          row['first name'] ||
          ''

        let lastName =
          row.lastName ||
          row.LastName ||
          row['Last Name'] ||
          row['last name'] ||
          ''

        // If specific name fields don't exist or are incomplete, try to extract from full name
        if ((!firstName || !lastName) && !(firstName && lastName)) {
          // Look for student name in various possible column names
          const fullName =
            row.name ||
            row.studentName ||
            row.Name ||
            row.StudentName ||
            row['Student Name'] ||
            row['student name'] ||
            row['Full Name'] ||
            row['full name'] ||
            ''

          // Split full name into first and last name with improved handling
          if (fullName) {
            const nameParts = splitCompoundName(fullName)

            // Only override if the fields are empty or if both new values are provided
            if (!firstName) firstName = nameParts.firstName
            if (!lastName) lastName = nameParts.lastName
          }
        }

        // Look for student ID in various possible column names
        const studentId =
          row.id ||
          row.studentId ||
          row.ID ||
          row.StudentId ||
          row.student_id ||
          row['Student ID'] ||
          row['student id'] ||
          ''

        // Look for email in various possible column names
        const email =
          row.email ||
          row.Email ||
          row.studentEmail ||
          row.StudentEmail ||
          row.student_email ||
          row['Student Email'] ||
          row['student email'] ||
          ''

        // Create student object with properly capitalized names
        return {
          firstName: capitalizeName(firstName),
          lastName: capitalizeName(lastName),
          studentId,
          email
        }
      })
      .filter(
        (student) =>
          (student.firstName || student.lastName) && student.studentId
      ) // Only keep rows with at least name and ID

    // Format the data for class creation
    const classData = [
      {
        title: 'Imported Class',
        students: extractedStudents
      }
    ]

    return classData
  } catch (error) {
    console.error('Error processing student data:', error)
    return []
  }
}

// Validate student data for manual entry
export const validateStudentData = (student) => {
  const errors = {}
  let isValid = true

  // Validate first name
  if (!student.firstName || student.firstName.trim() === '') {
    errors.firstName = 'First name is required'
    isValid = false
  }

  // Validate last name
  if (!student.lastName || student.lastName.trim() === '') {
    errors.lastName = 'Last name is required'
    isValid = false
  }

  // Validate email - now required to match the UI
  if (!student.email || student.email.trim() === '') {
    errors.email = 'Email is required'
    isValid = false
  } else {
    // Also validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(student.email)) {
      errors.email = 'Please enter a valid email address'
      isValid = false
    }
  }

  // Validate student ID
  if (!student.studentId || student.studentId.trim() === '') {
    errors.studentId = 'Student ID is required'
    isValid = false
  }

  return {
    isValid,
    errors
  }
}
