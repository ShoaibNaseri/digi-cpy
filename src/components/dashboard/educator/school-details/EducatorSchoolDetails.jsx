import './EducatorSchoolDetails.css'
import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  getSchoolInfo,
  updateSchoolContacts,
  saveSchoolDetails
} from '@/services/adminService'
import { toast } from 'sonner'
import { usStates } from '@/utils/usStatesData'
import { canadaRegions } from '@/utils/canadaRegionsData'
import { updateUser } from '@/services/adminService'
import SchoolDetailsForm from '@/components/onboarding/school/school-portal-setup/school-details/SchoolDetailsForm'
import PrimaryContactsForm from '@/components/onboarding/school/school-portal-setup/school-details/PrimaryContactsForm'
import PageHeader from '../../../common/dashboard-header/common/PageHeader'
import useEducatorMenuItems from '@/hooks/useEducatorMenuItems.jsx'
import { BiSolidSchool } from 'react-icons/bi'
import { FaSchool } from 'react-icons/fa6'
import { TiPhone } from 'react-icons/ti'
import { CiGlobe } from 'react-icons/ci'
import { PiGlobeHemisphereWestFill } from 'react-icons/pi'
import { FaMapLocationDot } from 'react-icons/fa6'
import {
  FaUser,
  FaUserPlus,
  FaDesktop,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaGraduationCap
} from 'react-icons/fa'

const EducatorSchoolDetails = () => {
  const [schoolInfo, setSchoolInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditingSchoolDetails, setIsEditingSchoolDetails] = useState(false)
  const [isEditingContacts, setIsEditingContacts] = useState(false)
  const [editableContacts, setEditableContacts] = useState({})
  const [editableSchoolDetails, setEditableSchoolDetails] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [formTouched, setFormTouched] = useState({})
  const menuItems = useEducatorMenuItems()
  const [contactFormErrors, setContactFormErrors] = useState({})
  const [contactFormTouched, setContactFormTouched] = useState({})
  const { currentUser } = useAuth()

  const regionList = useMemo(
    () =>
      editableSchoolDetails.country === 'Canada' ? canadaRegions : usStates,
    [editableSchoolDetails.country]
  )
  const regionLabel =
    editableSchoolDetails.country === 'Canada' ? 'Province/Territory' : 'State'

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      try {
        if (currentUser?.schoolId) {
          const info = await getSchoolInfo(currentUser.schoolId)
          setSchoolInfo(info)
          // Initialize editable contacts with current data
          setEditableContacts({
            principalName: info.principalName || '',
            principalEmail: info.principalEmail || '',
            vicePrincipalName: info.vicePrincipalName || '',
            vicePrincipalEmail: info.vicePrincipalEmail || '',
            itAdminName: info.itAdminName || '',
            itAdminEmail: info.itAdminEmail || '',
            educDepartmentName: info.educDepartmentName || '',
            educDepartmentEmail: info.educDepartmentEmail || ''
          })
          // Initialize editable school details with current data
          setEditableSchoolDetails({
            schoolName: info.schoolName || '',
            schoolPhone: info.schoolPhone || '',
            schoolAddress: info.schoolAddress || '',
            country: info.country || 'United States',
            region: info.region || '',
            schoolWebsite: info.schoolWebsite || '',
            schoolDistrict: info.schoolDistrict || ''
          })
        }
      } catch (err) {
        setError('Failed to load school details')
        console.error('Error fetching school details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSchoolDetails()
  }, [currentUser])

  const handleSchoolDetailsEditToggle = () => {
    if (isEditingSchoolDetails) {
      // Reset to original values when canceling
      setEditableSchoolDetails({
        schoolName: schoolInfo.schoolName || '',
        schoolPhone: schoolInfo.schoolPhone || '',
        schoolAddress: schoolInfo.schoolAddress || '',
        country: schoolInfo.country || 'United States',
        region: schoolInfo.region || '',
        schoolWebsite: schoolInfo.schoolWebsite || '',
        schoolDistrict: schoolInfo.schoolDistrict || ''
      })
      setFormErrors({})
      setFormTouched({})
    }
    setIsEditingSchoolDetails(!isEditingSchoolDetails)
  }

  const handleContactsEditToggle = () => {
    if (isEditingContacts) {
      // Reset to original values when canceling
      setEditableContacts({
        principalName: schoolInfo.principalName || '',
        principalEmail: schoolInfo.principalEmail || '',
        vicePrincipalName: schoolInfo.vicePrincipalName || '',
        vicePrincipalEmail: schoolInfo.vicePrincipalEmail || '',
        itAdminName: schoolInfo.itAdminName || '',
        itAdminEmail: schoolInfo.itAdminEmail || '',
        educDepartmentName: schoolInfo.educDepartmentName || '',
        educDepartmentEmail: schoolInfo.educDepartmentEmail || ''
      })
      setContactFormErrors({})
      setContactFormTouched({})
    }
    setIsEditingContacts(!isEditingContacts)
  }

  const handleContactChange = (e) => {
    const { name, value } = e.target
    setEditableContacts((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleContactBlur = (e) => {
    const { name } = e.target
    setContactFormTouched((prev) => ({
      ...prev,
      [name]: true
    }))
  }

  const validateContactForm = () => {
    const errors = {}

    // Only validate email format if email is provided
    if (
      editableContacts.principalEmail?.trim() &&
      !isValidEmail(editableContacts.principalEmail)
    ) {
      errors.principalEmail = 'Please enter a valid email address'
    }

    if (
      editableContacts.vicePrincipalEmail?.trim() &&
      !isValidEmail(editableContacts.vicePrincipalEmail)
    ) {
      errors.vicePrincipalEmail = 'Please enter a valid email address'
    }

    if (
      editableContacts.itAdminEmail?.trim() &&
      !isValidEmail(editableContacts.itAdminEmail)
    ) {
      errors.itAdminEmail = 'Please enter a valid email address'
    }

    if (
      editableContacts.educDepartmentEmail?.trim() &&
      !isValidEmail(editableContacts.educDepartmentEmail)
    ) {
      errors.educDepartmentEmail = 'Please enter a valid email address'
    }

    setContactFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSchoolDetailsChange = (e) => {
    const { name, value } = e.target
    setEditableSchoolDetails((prev) => {
      const updated = {
        ...prev,
        [name]: value
      }

      // Reset region when country changes
      if (name === 'country') {
        const newRegionList = value === 'Canada' ? canadaRegions : usStates
        if (!newRegionList.includes(prev.region)) {
          updated.region = ''
        }
      }

      return updated
    })
  }

  const handleSchoolDetailsBlur = (e) => {
    const { name } = e.target
    setFormTouched((prev) => ({
      ...prev,
      [name]: true
    }))
  }

  const validateForm = () => {
    const errors = {}

    if (!editableSchoolDetails.schoolName?.trim()) {
      errors.schoolName = 'School name is required'
    }

    if (!editableSchoolDetails.schoolPhone?.trim()) {
      errors.schoolPhone = 'School phone is required'
    }

    if (!editableSchoolDetails.schoolAddress?.trim()) {
      errors.schoolAddress = 'School address is required'
    }

    if (!editableSchoolDetails.country) {
      errors.country = 'Country is required'
    }

    if (!editableSchoolDetails.region?.trim()) {
      errors.region = 'State/Province is required'
    }

    if (
      editableSchoolDetails.schoolWebsite &&
      !isValidUrl(editableSchoolDetails.schoolWebsite)
    ) {
      errors.schoolWebsite = 'Please enter a valid website URL'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSchoolDetailsSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before saving')
      return
    }

    setIsSaving(true)
    try {
      const schoolDetailsToUpdate = {
        ...editableSchoolDetails,
        schoolId: currentUser.schoolId
      }

      await saveSchoolDetails(schoolDetailsToUpdate, {})

      await updateUser(currentUser.uid, {
        country: schoolDetailsToUpdate.country,
        region: schoolDetailsToUpdate.region
      })

      setSchoolInfo((prev) => ({
        ...prev,
        ...editableSchoolDetails
      }))

      toast.success('School details updated successfully')

      setIsEditingSchoolDetails(false)
      setFormErrors({})
      setFormTouched({})
    } catch (error) {
      toast.error('Error saving school details')
    } finally {
      setIsSaving(false)
    }
  }

  const handleContactsSave = async () => {
    if (!validateContactForm()) {
      toast.error('Please fix the form errors before saving')
      return
    }

    setIsSaving(true)
    try {
      await updateSchoolContacts(currentUser.schoolId, editableContacts)

      setSchoolInfo((prev) => ({
        ...prev,
        ...editableContacts
      }))

      toast.success('Contacts updated successfully')

      setIsEditingContacts(false)
      setContactFormErrors({})
      setContactFormTouched({})
    } catch (error) {
      toast.error('Error saving contacts')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='educator-sdp-school-details'>
        <div className='educator-sdp-school-details__loading'>
          Loading school details...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='educator-sdp-school-details'>
        <div className='educator-sdp-school-details__error'>{error}</div>
      </div>
    )
  }

  if (!schoolInfo) {
    return (
      <div className='educator-sdp-school-details'>
        <div className='educator-sdp-school-details__no-data'>
          No school information available.
        </div>
      </div>
    )
  }

  return (
    <div className='educator-sdp-school-details'>
      <PageHeader
        title='School & Primary Contacts Information'
        subtitle='Manage your school details and contact information'
        menuItems={menuItems}
      />

      <div className='educator-sdp-school-details__section'>
        <div className='educator-sdp-school-details__section-header'>
          <h2 className='educator-sdp-school-details__section-title'>
            School Details
          </h2>
          {!isEditingSchoolDetails && (
            <button
              className='educator-sdp-school-details__edit-btn'
              onClick={handleSchoolDetailsEditToggle}
              disabled={isSaving}
            >
              Edit Details
            </button>
          )}
        </div>

        {isEditingSchoolDetails ? (
          <div className='educator-sdp-school-details__edit-form'>
            <SchoolDetailsForm
              values={editableSchoolDetails}
              errors={formErrors}
              touched={formTouched}
              handleChange={handleSchoolDetailsChange}
              handleBlur={handleSchoolDetailsBlur}
              setValues={setEditableSchoolDetails}
              isEditMode={true}
            />
            <div className='educator-sdp-school-details__edit-actions'>
              <button
                className='educator-sdp-school-details__cancel-btn'
                onClick={handleSchoolDetailsEditToggle}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className='educator-sdp-school-details__save-btn'
                onClick={handleSchoolDetailsSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className='educator-sdp-school-details__grid educator-sdp-school-details__grid--view'>
            <div className='educator-sdp-school-details__field'>
              <div className='educator-sdp-school-details__field-icon'>
                <FaSchool size={20} />
              </div>
              <div className='educator-sdp-school-details__field-content'>
                <span className='educator-sdp-school-details__label'>
                  School Name
                </span>
                <div className='educator-sdp-school-details__value'>
                  {schoolInfo.schoolName}
                </div>
              </div>
            </div>
            <div className='educator-sdp-school-details__field'>
              <div className='educator-sdp-school-details__field-icon'>
                <TiPhone size={20} />
              </div>
              <div className='educator-sdp-school-details__field-content'>
                <span className='educator-sdp-school-details__label'>
                  Phone Number
                </span>
                <div className='educator-sdp-school-details__value'>
                  {schoolInfo.schoolPhone}
                </div>
              </div>
            </div>
            <div className='educator-sdp-school-details__field'>
              <div className='educator-sdp-school-details__field-icon'>
                <CiGlobe size={20} />
              </div>
              <div className='educator-sdp-school-details__field-content'>
                <span className='educator-sdp-school-details__label'>
                  Website
                </span>
                <div className='educator-sdp-school-details__value'>
                  <a
                    href={schoolInfo.schoolWebsite}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {schoolInfo.schoolWebsite}
                  </a>
                </div>
              </div>
            </div>
            <div className='educator-sdp-school-details__field'>
              <div className='educator-sdp-school-details__field-icon'>
                <BiSolidSchool size={20} />
              </div>
              <div className='educator-sdp-school-details__field-content'>
                <span className='educator-sdp-school-details__label'>
                  District/Board
                </span>
                <div className='educator-sdp-school-details__value'>
                  {schoolInfo.schoolDistrict}
                </div>
              </div>
            </div>
            <div className='educator-sdp-school-details__field'>
              <div className='educator-sdp-school-details__field-icon'>
                <PiGlobeHemisphereWestFill size={20} />
              </div>
              <div className='educator-sdp-school-details__field-content'>
                <span className='educator-sdp-school-details__label'>
                  Country
                </span>
                <div className='educator-sdp-school-details__value'>
                  {schoolInfo.country}
                </div>
              </div>
            </div>
            <div className='educator-sdp-school-details__field'>
              <div className='educator-sdp-school-details__field-icon'>
                <FaMapLocationDot size={20} />
              </div>
              <div className='educator-sdp-school-details__field-content'>
                <span className='educator-sdp-school-details__label'>
                  {schoolInfo.country === 'Canada'
                    ? 'Province/Territory'
                    : 'State'}
                </span>
                <div className='educator-sdp-school-details__value'>
                  {schoolInfo.region}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='educator-sdp-school-details__section'>
        <div className='educator-sdp-school-details__section-header'>
          <h2 className='educator-sdp-school-details__section-title'>
            Primary Contacts
          </h2>
          {!isEditingContacts && (
            <button
              className='educator-sdp-school-details__edit-btn'
              onClick={handleContactsEditToggle}
              disabled={isSaving}
            >
              Edit Contacts
            </button>
          )}
        </div>

        {isEditingContacts ? (
          <div className='educator-sdp-school-details__edit-form'>
            <PrimaryContactsForm
              values={editableContacts}
              errors={contactFormErrors}
              touched={contactFormTouched}
              handleChange={handleContactChange}
              handleBlur={handleContactBlur}
              isEditMode={true}
            />
            <div className='educator-sdp-school-details__edit-actions'>
              <button
                className='educator-sdp-school-details__cancel-btn'
                onClick={handleContactsEditToggle}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className='educator-sdp-school-details__save-btn'
                onClick={handleContactsSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className='educator-sdp-school-details__contacts educator-sdp-school-details__contacts--view'>
            {/* Principal Contact */}
            <div className='educator-sdp-school-details__contact-card principal'>
              <div className='educator-sdp-school-details__contact-header'>
                <div className='educator-sdp-school-details__contact-icon'>
                  <FaUser size={18} />
                </div>
                <h3 className='educator-sdp-school-details__contact-title'>
                  Principal
                </h3>
              </div>
              <div className='educator-sdp-school-details__contact-content'>
                <div className='educator-sdp-school-details__contact-info'>
                  <span className='educator-sdp-school-details__contact-label'>
                    Name:
                  </span>
                  <span className='educator-sdp-school-details__contact-value'>
                    {schoolInfo.principalName}
                  </span>
                </div>
                <div className='educator-sdp-school-details__contact-info'>
                  <span className='educator-sdp-school-details__contact-label'>
                    Email:
                  </span>
                  <span className='educator-sdp-school-details__contact-value'>
                    {schoolInfo.principalEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Vice Principal Contact */}
            <div className='educator-sdp-school-details__contact-card vice-principal'>
              <div className='educator-sdp-school-details__contact-header'>
                <div className='educator-sdp-school-details__contact-icon'>
                  <FaUserPlus size={18} />
                </div>
                <h3 className='educator-sdp-school-details__contact-title'>
                  Vice Principal
                </h3>
              </div>
              <div className='educator-sdp-school-details__contact-content'>
                <div className='educator-sdp-school-details__contact-info'>
                  <span className='educator-sdp-school-details__contact-label'>
                    Name:
                  </span>
                  {isEditingContacts ? (
                    <input
                      type='text'
                      className='educator-sdp-school-details__contact-input'
                      value={editableContacts.vicePrincipalName}
                      onChange={(e) =>
                        handleContactChange('vicePrincipalName', e.target.value)
                      }
                      placeholder='Vice Principal Name'
                    />
                  ) : (
                    <span className='educator-sdp-school-details__contact-value'>
                      {schoolInfo.vicePrincipalName}
                    </span>
                  )}
                </div>
                <div className='educator-sdp-school-details__contact-info'>
                  <span className='educator-sdp-school-details__contact-label'>
                    Email:
                  </span>
                  {isEditingContacts ? (
                    <input
                      type='email'
                      className='educator-sdp-school-details__contact-input'
                      value={editableContacts.vicePrincipalEmail}
                      onChange={(e) =>
                        handleContactChange(
                          'vicePrincipalEmail',
                          e.target.value
                        )
                      }
                      placeholder='Vice Principal Email'
                    />
                  ) : (
                    <span className='educator-sdp-school-details__contact-value'>
                      {schoolInfo.vicePrincipalEmail}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* IT Admin Contact */}
            <div className='educator-sdp-school-details__contact-card it-admin'>
              <div className='educator-sdp-school-details__contact-header'>
                <div className='educator-sdp-school-details__contact-icon'>
                  <FaDesktop size={18} />
                </div>
                <h3 className='educator-sdp-school-details__contact-title'>
                  IT Administrator
                </h3>
              </div>
              <div className='educator-sdp-school-details__contact-content'>
                <div className='educator-sdp-school-details__contact-info'>
                  <span className='educator-sdp-school-details__contact-label'>
                    Name:
                  </span>
                  {isEditingContacts ? (
                    <input
                      type='text'
                      className='educator-sdp-school-details__contact-input'
                      value={editableContacts.itAdminName}
                      onChange={(e) =>
                        handleContactChange('itAdminName', e.target.value)
                      }
                      placeholder='IT Administrator Name'
                    />
                  ) : (
                    <span className='educator-sdp-school-details__contact-value'>
                      {schoolInfo.itAdminName}
                    </span>
                  )}
                </div>
                <div className='educator-sdp-school-details__contact-info'>
                  <span className='educator-sdp-school-details__contact-label'>
                    Email:
                  </span>
                  {isEditingContacts ? (
                    <input
                      type='email'
                      className='educator-sdp-school-details__contact-input'
                      value={editableContacts.itAdminEmail}
                      onChange={(e) =>
                        handleContactChange('itAdminEmail', e.target.value)
                      }
                      placeholder='IT Administrator Email'
                    />
                  ) : (
                    <span className='educator-sdp-school-details__contact-value'>
                      {schoolInfo.itAdminEmail}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Education Department Contact */}
            <div className='educator-sdp-school-details__contact-card education-dept'>
              <div className='educator-sdp-school-details__contact-header'>
                <div className='educator-sdp-school-details__contact-icon'>
                  <FaGraduationCap size={18} />
                </div>
                <h3 className='educator-sdp-school-details__contact-title'>
                  Education Department
                </h3>
              </div>
              <div className='educator-sdp-school-details__contact-content'>
                <div className='educator-sdp-school-details__contact-info'>
                  <span className='educator-sdp-school-details__contact-label'>
                    Name:
                  </span>
                  {isEditingContacts ? (
                    <input
                      type='text'
                      className='educator-sdp-school-details__contact-input'
                      value={editableContacts.educDepartmentName}
                      onChange={(e) =>
                        handleContactChange(
                          'educDepartmentName',
                          e.target.value
                        )
                      }
                      placeholder='Education Department Name'
                    />
                  ) : (
                    <span className='educator-sdp-school-details__contact-value'>
                      {schoolInfo.educDepartmentName}
                    </span>
                  )}
                </div>
                <div className='educator-sdp-school-details__contact-info'>
                  <span className='educator-sdp-school-details__contact-label'>
                    Email:
                  </span>
                  {isEditingContacts ? (
                    <input
                      type='email'
                      className='educator-sdp-school-details__contact-input'
                      value={editableContacts.educDepartmentEmail}
                      onChange={(e) =>
                        handleContactChange(
                          'educDepartmentEmail',
                          e.target.value
                        )
                      }
                      placeholder='Education Department Email'
                    />
                  ) : (
                    <span className='educator-sdp-school-details__contact-value'>
                      {schoolInfo.educDepartmentEmail}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EducatorSchoolDetails
