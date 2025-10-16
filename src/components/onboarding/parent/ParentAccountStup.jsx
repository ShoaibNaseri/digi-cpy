import './ParentAccountSetup.css'
import { usStates } from '@/utils/usStatesData'
import { canadaRegions } from '@/utils/canadaRegionsData'
import { useMemo, useState, useRef, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { useProfile } from '@/context/ProfileContext'
import { motion } from 'framer-motion'
import {
  FaUser,
  FaCalendarAlt,
  FaGlobeAmericas,
  FaMapMarkerAlt,
  FaUserShield,
  FaChevronDown,
  FaCheck,
  FaSearch
} from 'react-icons/fa'
import ReactCountryFlag from 'react-country-flag'
import digipalzLogo from '@/assets/digipalz_b.png'

// Countries data
const countries = ['United States', 'Canada']

const ParentAccountSetup = ({ handleNextStep, currentStep }) => {
  const { currentUser } = useAuth()
  const { updateUserProfile } = useProfile()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isCountryOpen, setIsCountryOpen] = useState(false)
  const [isRegionOpen, setIsRegionOpen] = useState(false)
  const [regionSearchTerm, setRegionSearchTerm] = useState('')
  const countryRef = useRef(null)
  const regionRef = useRef(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    country: 'United States',
    region: ''
  })

  const regionList = useMemo(() => {
    const regions = formData.country === 'Canada' ? canadaRegions : usStates
    return regions.map((region) => ({ value: region, label: region }))
  }, [formData.country])

  const regionLabel =
    formData.country === 'Canada' ? 'Province/Territory' : 'State'

  // Get filtered regions based on search term
  const getFilteredRegions = () => {
    let filteredRegions = regionList.map((region) => region.value || region)

    // Filter by search term if there is one
    if (regionSearchTerm.trim()) {
      filteredRegions = filteredRegions.filter((region) =>
        region.toLowerCase().includes(regionSearchTerm.toLowerCase())
      )
    }

    // If there's a selected region and no search term, move it to the top
    if (formData.region && !regionSearchTerm.trim()) {
      const selectedRegion = filteredRegions.find(
        (region) => region === formData.region
      )
      if (selectedRegion) {
        const otherRegions = filteredRegions.filter(
          (region) => region !== formData.region
        )
        return [selectedRegion, ...otherRegions]
      }
    }

    return filteredRegions
  }

  // Get flag icon for country
  const getCountryFlagIcon = (country) => {
    if (country === 'United States') {
      return (
        <ReactCountryFlag
          countryCode='US'
          svg
          style={{ width: '1.5rem', height: '1.5rem' }}
        />
      )
    } else if (country === 'Canada') {
      return (
        <ReactCountryFlag
          countryCode='CA'
          svg
          style={{ width: '1.5rem', height: '1.5rem' }}
        />
      )
    }
    return (
      <FaGlobeAmericas
        style={{ width: '1.5rem', height: '1.5rem', color: '#8F9AA4' }}
      />
    )
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setIsCountryOpen(false)
      }
      if (regionRef.current && !regionRef.current.contains(event.target)) {
        setIsRegionOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Clear errors when user starts typing
    if (errors[name] || errors.auth) {
      const newErrors = { ...errors }
      delete newErrors[name]
      delete newErrors.auth
      setErrors(newErrors)
    }

    // Prevent future date for dateOfBirth
    if (name === 'dateOfBirth') {
      const today = new Date().toISOString().split('T')[0]
      if (value > today) {
        toast.error('Date of birth cannot be in the future')
        return
      }
    }
    // Reset region if country changes
    if (name === 'country') {
      setFormData((prev) => ({
        ...prev,
        country: value,
        region: ''
      }))
      return
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCountrySelect = (country) => {
    setFormData((prev) => ({
      ...prev,
      country: country,
      region: '' // Reset region when country changes
    }))
    setIsCountryOpen(false)
  }

  const handleRegionSelect = (region) => {
    setFormData((prev) => ({
      ...prev,
      region: region
    }))
    setRegionSearchTerm('') // Clear search when region is selected
    setIsRegionOpen(false)
  }

  const handleCountryClick = () => {
    setIsCountryOpen(!isCountryOpen)
  }

  const handleRegionClick = () => {
    setIsRegionOpen(!isRegionOpen)
    if (!isRegionOpen) {
      setRegionSearchTerm('') // Clear search when opening
    }
  }

  const handleRegionSearchChange = (e) => {
    setRegionSearchTerm(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Clear previous errors
    setErrors({})

    // Validate form
    const newErrors = {}
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.region) {
      newErrors.region = `Please select a ${regionLabel}`
    }

    // Validate date of birth is not in the future
    if (formData.dateOfBirth) {
      const today = new Date().toISOString().split('T')[0]
      if (formData.dateOfBirth > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const updatedData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        country: formData.country,
        region: formData.region,
        updatedAt: new Date()
      }
      await updateUserProfile(currentUser.uid, updatedData)
      toast.success('Profile updated successfully')
      handleNextStep()
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrors({
        auth: 'Something went wrong on our end. Please try again in a moment! 😊'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const explanationVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  return (
    <motion.div
      className='parent-account-page'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      <div className='parent-account-container'>
        {/* Left Side - Account Setup Form */}
        <motion.div
          className='parent-account-form-section'
          variants={cardVariants}
        >
          <div className='parent-account-form-card'>
            <motion.div
              className='parent-account-form-header'
              variants={formVariants}
            >
              <motion.img
                src={digipalzLogo}
                alt='Digipalz Logo'
                className='parent-account-brand-logo'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
              <h2 className='parent-account-welcome-title'>
                Parent Account Setup
              </h2>
              <p className='parent-account-welcome-subtitle'>
                Let's get your profile set up to protect your child
              </p>
            </motion.div>

            {/* Beautiful Error Message */}
            {errors.auth && (
              <motion.div
                className='parent-account-error-banner'
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className='parent-account-error-content'>
                  <div className='parent-account-error-icon'>⚠️</div>
                  <div className='parent-account-error-text'>{errors.auth}</div>
                </div>
              </motion.div>
            )}

            <motion.form
              className='parent-account-form'
              onSubmit={handleSubmit}
              variants={formVariants}
            >
              {/* First Row: First Name and Last Name */}
              <div className='parent-account-form-row'>
                {/* First Name Field */}
                <div className='parent-account-form-group'>
                  <label className='parent-account-form-label'>
                    First Name
                  </label>
                  <div
                    className={`parent-account-input-wrapper ${
                      errors.firstName ? 'parent-account-has-error' : ''
                    }`}
                  >
                    <div className='parent-account-input-icon'>
                      <FaUser />
                    </div>
                    <input
                      type='text'
                      name='firstName'
                      className='parent-account-form-input'
                      placeholder='Enter your first name'
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.firstName && (
                    <div className='parent-account-error-message'>
                      {errors.firstName}
                    </div>
                  )}
                </div>

                {/* Last Name Field */}
                <div className='parent-account-form-group'>
                  <label className='parent-account-form-label'>Last Name</label>
                  <div
                    className={`parent-account-input-wrapper ${
                      errors.lastName ? 'parent-account-has-error' : ''
                    }`}
                  >
                    <div className='parent-account-input-icon'>
                      <FaUser />
                    </div>
                    <input
                      type='text'
                      name='lastName'
                      className='parent-account-form-input'
                      placeholder='Enter your last name'
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.lastName && (
                    <div className='parent-account-error-message'>
                      {errors.lastName}
                    </div>
                  )}
                </div>
              </div>

              {/* Second Row: Date of Birth and Country */}
              <div className='parent-account-form-row'>
                {/* Date of Birth Field */}
                <div className='parent-account-form-group'>
                  <label className='parent-account-form-label'>
                    Date of Birth (Optional)
                  </label>
                  <div
                    className={`parent-account-input-wrapper ${
                      errors.dateOfBirth ? 'parent-account-has-error' : ''
                    }`}
                  >
                    <div className='parent-account-input-icon'>
                      <FaCalendarAlt />
                    </div>
                    <input
                      type='date'
                      name='dateOfBirth'
                      className='parent-account-form-input'
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <div className='parent-account-error-message'>
                      {errors.dateOfBirth}
                    </div>
                  )}
                </div>

                {/* Country Field */}
                <div className='parent-account-form-group'>
                  <label className='parent-account-form-label'>Country</label>
                  <div
                    className='parent-account-input-wrapper'
                    ref={countryRef}
                  >
                    <div className='parent-account-input-icon'>
                      {getCountryFlagIcon(formData.country || 'United States')}
                    </div>
                    <div
                      className={`parent-account-dropdown-select ${
                        errors.country ? 'parent-account-has-error' : ''
                      }`}
                      onClick={handleCountryClick}
                    >
                      <span className='parent-account-dropdown-value'>
                        {formData.country || 'United States'}
                      </span>
                      <FaChevronDown
                        className={`parent-account-dropdown-chevron ${
                          isCountryOpen ? 'open' : ''
                        }`}
                        color='#8F9AA4'
                      />
                    </div>
                    {isCountryOpen && (
                      <div className='parent-account-dropdown-menu'>
                        {countries.map((country) => (
                          <div
                            key={country}
                            className={`parent-account-dropdown-item ${
                              formData.country === country ? 'selected' : ''
                            }`}
                            onClick={() => handleCountrySelect(country)}
                          >
                            <span className='parent-account-dropdown-item-text'>
                              {country}
                            </span>
                            {formData.country === country && (
                              <FaCheck className='parent-account-dropdown-item-check' />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.country && (
                    <div className='parent-account-error-message'>
                      {errors.country}
                    </div>
                  )}
                </div>
              </div>

              {/* Third Row: Region (Full Width) */}
              <div className='parent-account-form-row'>
                <div className='parent-account-form-group full-width'>
                  <label className='parent-account-form-label'>
                    {regionLabel}
                  </label>
                  <div
                    className={`parent-account-input-wrapper ${
                      errors.region ? 'parent-account-has-error' : ''
                    }`}
                    ref={regionRef}
                  >
                    <div className='parent-account-input-icon'>
                      <FaMapMarkerAlt />
                    </div>
                    <div
                      className={`parent-account-dropdown-select ${
                        errors.region ? 'parent-account-has-error' : ''
                      }`}
                      onClick={handleRegionClick}
                    >
                      <span className='parent-account-dropdown-value'>
                        {formData.region || `Select a ${regionLabel}`}
                      </span>
                      <FaChevronDown
                        className={`parent-account-dropdown-chevron ${
                          isRegionOpen ? 'open' : ''
                        }`}
                        color='#8F9AA4'
                      />
                    </div>
                    {isRegionOpen && (
                      <div className='parent-account-dropdown-menu'>
                        {/* Search input */}
                        <div className='parent-account-region-search-container'>
                          <div className='parent-account-region-search-input-wrapper'>
                            <FaSearch className='parent-account-region-search-icon' />
                            <input
                              type='text'
                              placeholder={`Search ${regionLabel.toLowerCase()}...`}
                              value={regionSearchTerm}
                              onChange={handleRegionSearchChange}
                              className='parent-account-region-search-input'
                              autoFocus
                            />
                          </div>
                        </div>
                        {/* Region list */}
                        <div className='parent-account-region-list-container'>
                          {getFilteredRegions().map((region, index) => {
                            const isSelected = formData.region === region
                            const isFirstAndSelected =
                              index === 0 &&
                              isSelected &&
                              !regionSearchTerm.trim()

                            return (
                              <div
                                key={region}
                                className={`parent-account-dropdown-item ${
                                  isSelected ? 'selected' : ''
                                } ${
                                  isFirstAndSelected ? 'current-selection' : ''
                                }`}
                                onClick={() => handleRegionSelect(region)}
                              >
                                <span className='parent-account-dropdown-item-text'>
                                  {region}
                                </span>
                                {isSelected && (
                                  <FaCheck className='parent-account-dropdown-item-check' />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.region && (
                    <div className='parent-account-error-message'>
                      {errors.region}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type='submit'
                className='parent-account-submit-btn'
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className='parent-account-loading-spinner'></div>
                ) : (
                  'Save & Continue'
                )}
              </motion.button>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ParentAccountSetup
