import './SchoolDetails.css'
import SchoolDetailsForm from './SchoolDetailsForm'
import PrimaryContactsForm from './PrimaryContactsForm'
import SubscriptionInfoForm from './SubscriptionInfoForm'
import PrevStepButton from '../buttons/PrevStepButton'
import NextStepButton from '../buttons/NextStepButton'
import { useAuth } from '@/context/AuthContext'
import { useSchoolPortal } from '@/context/SchoolPortalContext'
import {
  saveSchoolDetails,
  getSchoolInfo,
  updateUser
} from '@/services/adminService'
import { useState, useEffect } from 'react'
import useFormValidation from '@/hooks/useFormValidation'
import { schoolDetailsValidationRules } from '@/validation/schoolDetailsValidation'
import {
  primaryContactsValidationRules,
  validatePrincipalOrVicePrincipal
} from '@/validation/primaryContactsValidation'
import { toast } from 'react-toastify'
import { useSearchParams } from 'react-router-dom'
import {
  getCheckoutSession,
  getLatestPaymentRecord
} from '@/services/paymentService'

const SchoolDetails = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { schoolDetails, primaryContacts, setPrimaryContacts } =
    useSchoolPortal()
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [isBackButtonPressed, setIsBackButtonPressed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const { currentUser, setCurrentUser } = useAuth()

  const sessionId = searchParams.get('sessionId')

  const form = useFormValidation(schoolDetails, schoolDetailsValidationRules)
  const { validateForm, setValues, values } = form

  const primaryForm = useFormValidation(
    primaryContacts,
    primaryContactsValidationRules
  )
  const {
    validateForm: validatePrimary,
    setValues: setPrimaryValues,
    values: primaryValues,
    errors: primaryErrors,
    touched: primaryTouched,
    handleChange: handlePrimaryChange,
    handleBlur: handlePrimaryBlur
  } = primaryForm

  useEffect(() => {
    if (currentUser.schoolId) {
      const fetchSchoolDetails = async () => {
        const schoolInfo = await getSchoolInfo(currentUser.schoolId)
        setValues(schoolInfo)
        setPrimaryContacts(schoolInfo)

        if (schoolInfo.paymentId && !sessionId) {
          setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev)
            newParams.set('sessionId', schoolInfo.paymentId)
            return newParams
          })
        }
      }
      fetchSchoolDetails()
    }
  }, [currentUser, isBackButtonPressed])

  useEffect(() => {
    if (currentUser) {
      const fetchPaymentInfo = async () => {
        const paymentRecord = await getLatestPaymentRecord(currentUser.uid)

        if (paymentRecord.error) {
          setError(paymentRecord.error)
          return
        }

        setPaymentInfo(paymentRecord)
      }
      fetchPaymentInfo()
    }
  }, [sessionId, currentUser, isBackButtonPressed])

  useEffect(() => {
    setPrimaryValues(primaryContacts)
  }, [primaryContacts])

  const handleSaveProgress = async () => {
    setIsBackButtonPressed(false)
    const isValid = validateForm()
    const isPrimaryValid = validatePrimary()
    const principalOrViceError = validatePrincipalOrVicePrincipal(primaryValues)

    if (principalOrViceError) {
      toast.error(principalOrViceError)
      return false
    }

    if (!isValid || !isPrimaryValid || principalOrViceError) {
      toast.error('Please fill in all required fields correctly')
      return false
    }

    setIsSaving(true)

    try {
      const saveData = {
        ...primaryValues,
        paymentId: sessionId,
        availableSeats: paymentInfo?.numOfSeats || 0,
        usedSeats: 0,
        planType: paymentInfo?.planType || 'N/A',
        userId: currentUser.uid
      }

      const response = await saveSchoolDetails(values, saveData)

      const updateResult = await updateUser(currentUser.uid, {
        schoolId: response.id,
        planType: paymentInfo?.planType || 'N/A'
      })

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update user')
      }

      setCurrentUser((prev) => ({
        ...prev,
        schoolId: response.id
      }))
      toast.success('School details saved successfully')
      return true
    } catch (error) {
      console.error('Error saving school details:', error)
      toast.error('Failed to save school details. Please try again.')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  if (error) {
    return (
      <div className='success-payment'>
        <div className='success-payment__container'>
          <div className='success-payment__icon-error'></div>
          <h1 className='success-payment__title'>Error</h1>
          <p className='success-payment__error-message'>
            {error}
            <br />
            Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='school-details'>
      <div className='school-details__sections'>
        <SchoolDetailsForm {...form} />
        <PrimaryContactsForm
          values={primaryValues}
          errors={primaryErrors}
          touched={primaryTouched}
          handleChange={handlePrimaryChange}
          handleBlur={handlePrimaryBlur}
        />
        <SubscriptionInfoForm schoolInfo={paymentInfo} />
      </div>
      <div className='school-details-footer'>
        <PrevStepButton
          stepNum={0}
          onClick={() => setIsBackButtonPressed(false)}
        />
        <NextStepButton
          stepNum={1}
          onClick={handleSaveProgress}
          isLoading={isSaving}
        />
      </div>
    </div>
  )
}

export default SchoolDetails
