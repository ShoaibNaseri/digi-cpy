// src/hooks/useClassFormSubmission.js
import { useState } from 'react'
import {
  saveClassToFirebase,
  saveMissionsToFirebase,
  sendStudentEmailNotifications
} from '@/utils/createClassLogic/firebaseLogic'

import {
  calculateMissionSchedule,
  prepareFormDataForClassroom
} from '@/utils/teacher/classDataLogic'

export const useClassFormSubmission = (currentUser) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [createdClassId, setCreatedClassId] = useState(null)
  const [currentStep, setCurrentStep] = useState('form')

  const submitClassForm = async (formData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Calculate mission schedule
      const scheduledMissions = calculateMissionSchedule(formData)

      if (scheduledMissions.length === 0) {
        throw new Error('Failed to generate mission schedule')
      }

      // Process form data for Firestore
      const enhancedFormData = prepareFormDataForClassroom(
        formData,
        scheduledMissions
      )

      // Save to Firebase
      const classId = await saveClassToFirebase(enhancedFormData, currentUser)
      setCreatedClassId(classId)

      // Store the enhanced data for later
      window.pendingClassData = enhancedFormData

      // Create and attach all missions
      await saveMissionsToFirebase(
        classId,
        scheduledMissions,
        currentUser,
        formData
      )

      // Send email notifications if students exist
      if (formData.students && formData.students.length > 0) {
        await sendStudentEmailNotifications(
          formData.students,
          classId,
          currentUser
        )
      }

      // Move to success screen
      setCurrentStep('setup-complete')
      return { success: true, classId }
    } catch (error) {
      console.error('Error creating class:', error)
      setError('Failed to create class. Please try again.')
      return { success: false, error }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    error,
    createdClassId,
    currentStep,
    submitClassForm,
    setCurrentStep
  }
}
