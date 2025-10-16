import './SchoolDetailsForm.css'
import { HiBuildingOffice2 } from 'react-icons/hi2'
import { FiPhone } from 'react-icons/fi'
import { HiLocationMarker } from 'react-icons/hi'
import { HiGlobeAlt } from 'react-icons/hi'
import { FaChevronDown, FaGlobe, FaCheck, FaSearch } from 'react-icons/fa'
import ReactCountryFlag from 'react-country-flag'
import { usStates } from '@/utils/usStatesData'
import { canadaRegions } from '@/utils/canadaRegionsData'
import { useState, useRef, useEffect, useMemo } from 'react'

// Countries data
const countries = ['United States', 'Canada']

const SchoolDetailsForm = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setValues,
  isEditMode
}) => {
  const [isCountryOpen, setIsCountryOpen] = useState(false)
  const [isRegionOpen, setIsRegionOpen] = useState(false)
  const [regionSearchTerm, setRegionSearchTerm] = useState('')
  const countryRef = useRef(null)
  const regionRef = useRef(null)

  const regionList = useMemo(
    () => (values.country === 'Canada' ? canadaRegions : usStates),
    [values.country]
  )
  const regionLabel =
    values.country === 'Canada' ? 'Province/Territory' : 'State'

  // Get filtered regions based on search term
  const getFilteredRegions = () => {
    let filteredRegions = regionList

    // Filter by search term if there is one
    if (regionSearchTerm.trim()) {
      filteredRegions = regionList.filter((region) =>
        region.toLowerCase().includes(regionSearchTerm.toLowerCase())
      )
    }

    // If there's a selected region and no search term, move it to the top
    if (values.region && !regionSearchTerm.trim()) {
      const selectedRegion = filteredRegions.find(
        (region) => region === values.region
      )
      if (selectedRegion) {
        const otherRegions = filteredRegions.filter(
          (region) => region !== values.region
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
      <FaGlobe
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

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '')
    const limitedDigits = digits.slice(0, 10)
    if (limitedDigits.length <= 3) {
      return limitedDigits
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`
    } else {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(
        3,
        6
      )}-${limitedDigits.slice(6, 10)}`
    }
  }

  const handleFieldChange = (e) => {
    console.log('CHANGING1')
    const { id, value } = e.target
    let processedValue = value
    if (id === 'schoolPhone') {
      processedValue = formatPhoneNumber(value)
    }
    console.log('CHANGING')
    handleChange({
      target: {
        name: id,
        value: processedValue
      }
    })
  }

  const handleCountrySelect = (country) => {
    handleChange({
      target: {
        name: 'country',
        value: country
      }
    })
    // Reset region when country changes
    handleChange({
      target: {
        name: 'region',
        value: ''
      }
    })
    setIsCountryOpen(false)
  }

  const handleRegionSelect = (region) => {
    handleChange({
      target: {
        name: 'region',
        value: region
      }
    })
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

  return (
    <div className='details'>
      {!isEditMode && <h1>School Details</h1>}
      <div className='details__form'>
        <div className='details__form-group'>
          <label htmlFor='schoolName'>School Name</label>
          <div className='input-wrapper'>
            <HiBuildingOffice2 className='input-icon' size={20} />
            <input
              type='text'
              id='schoolName'
              name='schoolName'
              value={values.schoolName || ''}
              onChange={handleFieldChange}
              onBlur={handleBlur}
              placeholder='Enter your school name'
              required
              className={touched.schoolName && errors.schoolName ? 'error' : ''}
            />
          </div>
          {touched.schoolName && errors.schoolName && (
            <div className='error-message'>{errors.schoolName}</div>
          )}
        </div>
        <div className='details__form-group'>
          <label htmlFor='schoolPhone'>School Phone</label>
          <div className='input-wrapper'>
            <FiPhone className='input-icon' size={20} />
            <input
              type='tel'
              id='schoolPhone'
              name='schoolPhone'
              value={values.schoolPhone || ''}
              onChange={handleFieldChange}
              onBlur={handleBlur}
              placeholder='Enter your school phone number'
              className={
                touched.schoolPhone && errors.schoolPhone ? 'error' : ''
              }
              required
            />
          </div>
          {touched.schoolPhone && errors.schoolPhone && (
            <div className='error-message'>{errors.schoolPhone}</div>
          )}
        </div>
        <div className='details__form-group'>
          <label htmlFor='schoolAddress'>School Address</label>
          <div className='input-wrapper'>
            <HiLocationMarker className='input-icon' size={20} />
            <input
              type='text'
              id='schoolAddress'
              name='schoolAddress'
              value={values.schoolAddress || ''}
              onChange={handleFieldChange}
              onBlur={handleBlur}
              placeholder='Enter your school address'
              required
              className={
                touched.schoolAddress && errors.schoolAddress ? 'error' : ''
              }
            />
          </div>
          {touched.schoolAddress && errors.schoolAddress && (
            <div className='error-message'>{errors.schoolAddress}</div>
          )}
        </div>
        <div className='details__form-group'>
          <label htmlFor='country'>Country</label>
          <div className='input-wrapper' ref={countryRef}>
            <span className='input-icon'>
              {getCountryFlagIcon(values.country || 'United States')}
            </span>
            <div
              className={`school-dropdown-select ${
                touched.country && errors.country ? 'error' : ''
              }`}
              onClick={handleCountryClick}
            >
              <span className='school-dropdown-value'>
                {values.country || 'United States'}
              </span>
              <FaChevronDown
                className={`school-dropdown-chevron ${
                  isCountryOpen ? 'open' : ''
                }`}
                color='#8F9AA4'
              />
            </div>
            {isCountryOpen && (
              <div className='school-dropdown-menu'>
                {countries.map((country) => (
                  <div
                    key={country}
                    className={`school-dropdown-item ${
                      values.country === country ? 'selected' : ''
                    }`}
                    onClick={() => handleCountrySelect(country)}
                  >
                    <span className='school-dropdown-item-text'>{country}</span>
                    {values.country === country && (
                      <FaCheck className='school-dropdown-item-check' />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {touched.country && errors.country && (
            <div className='error-message'>{errors.country}</div>
          )}
        </div>

        <div className='details__form-group'>
          <label htmlFor='region'>{regionLabel}</label>
          <div className='input-wrapper' ref={regionRef}>
            <span className='input-icon'>
              <HiLocationMarker size={20} />
            </span>
            <div
              className={`school-dropdown-select ${
                touched.region && errors.region ? 'error' : ''
              }`}
              onClick={handleRegionClick}
            >
              <span className='school-dropdown-value'>
                {values.region || `Select a ${regionLabel}`}
              </span>
              <FaChevronDown
                className={`school-dropdown-chevron ${
                  isRegionOpen ? 'open' : ''
                }`}
                color='#8F9AA4'
              />
            </div>
            {isRegionOpen && (
              <div className='school-dropdown-menu'>
                {/* Search input */}
                <div className='school-region-search-container'>
                  <div className='school-region-search-input-wrapper'>
                    <FaSearch className='school-region-search-icon' />
                    <input
                      type='text'
                      placeholder={`Search ${regionLabel.toLowerCase()}...`}
                      value={regionSearchTerm}
                      onChange={handleRegionSearchChange}
                      className='school-region-search-input'
                      autoFocus
                    />
                  </div>
                </div>
                {/* Region list */}
                <div className='school-region-list-container'>
                  {getFilteredRegions().map((region, index) => {
                    const isSelected = values.region === region
                    const isFirstAndSelected =
                      index === 0 && isSelected && !regionSearchTerm.trim()

                    return (
                      <div
                        key={region}
                        className={`school-dropdown-item ${
                          isSelected ? 'selected' : ''
                        } ${isFirstAndSelected ? 'current-selection' : ''}`}
                        onClick={() => handleRegionSelect(region)}
                      >
                        <span className='school-dropdown-item-text'>
                          {region}
                        </span>
                        {isSelected && (
                          <FaCheck className='school-dropdown-item-check' />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          {touched.region && errors.region && (
            <div className='error-message'>{errors.region}</div>
          )}
        </div>
        <div className='details__form-group'>
          <label htmlFor='schoolWebsite'>School Website</label>
          <div className='input-wrapper'>
            <HiGlobeAlt className='input-icon' size={20} />
            <input
              type='url'
              id='schoolWebsite'
              name='schoolWebsite'
              value={values.schoolWebsite || ''}
              onChange={handleFieldChange}
              onBlur={handleBlur}
              placeholder='Enter your school website'
              className={
                touched.schoolWebsite && errors.schoolWebsite ? 'error' : ''
              }
            />
          </div>
          {touched.schoolWebsite && errors.schoolWebsite && (
            <div className='error-message'>{errors.schoolWebsite}</div>
          )}
        </div>
        <div className='details__form-group details__form-group--full-width'>
          <label htmlFor='schoolDistrict'>School District / Board</label>
          <div className='input-wrapper'>
            <HiBuildingOffice2 className='input-icon' size={20} />
            <input
              type='text'
              id='schoolDistrict'
              name='schoolDistrict'
              value={values.schoolDistrict || ''}
              onChange={handleFieldChange}
              onBlur={handleBlur}
              placeholder='Enter your School District / Board'
              className={
                touched.schoolDistrict && errors.schoolDistrict ? 'error' : ''
              }
            />
          </div>
          {touched.schoolDistrict && errors.schoolDistrict && (
            <div className='error-message'>{errors.schoolDistrict}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SchoolDetailsForm
