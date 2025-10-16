import { useState, useRef, useEffect, useCallback } from 'react'
import { FaChevronDown, FaGlobe, FaCheck, FaSearch } from 'react-icons/fa'
import { PiMapPinLineFill } from 'react-icons/pi'
import ReactCountryFlag from 'react-country-flag'
import { countries } from './countriesData'
import { usStates } from '@/utils/usStatesData'
import { canadaRegions } from '@/utils/canadaRegionsData'
import './CountryRegionsDropdown.css'

const CountryRegionsDropdown = ({
  countryValue,
  regionValue,
  onCountryChange,
  onRegionChange,
  className = '',
  countryLabel = 'Country',
  regionLabel = 'State/Province'
}) => {
  const [isCountryOpen, setIsCountryOpen] = useState(false)
  const [isRegionOpen, setIsRegionOpen] = useState(false)
  const [regionSearchTerm, setRegionSearchTerm] = useState('')
  const countryRef = useRef(null)
  const regionRef = useRef(null)

  // Get regions based on selected country
  const getRegions = () => {
    if (countryValue === 'United States') {
      return usStates
    } else if (countryValue === 'Canada') {
      return canadaRegions
    }
    return []
  }

  // Get filtered regions based on search term
  const getFilteredRegions = () => {
    const regions = getRegions()
    let filteredRegions = regions

    // Filter by search term if there is one
    if (regionSearchTerm.trim()) {
      filteredRegions = regions.filter((region) =>
        region.toLowerCase().includes(regionSearchTerm.toLowerCase())
      )
    }

    // If there's a selected region and no search term, move it to the top
    if (regionValue && !regionSearchTerm.trim()) {
      const selectedRegion = filteredRegions.find(
        (region) => region === regionValue
      )
      if (selectedRegion) {
        const otherRegions = filteredRegions.filter(
          (region) => region !== regionValue
        )
        return [selectedRegion, ...otherRegions]
      }
    }

    return filteredRegions
  }

  // Get region label based on country
  const getRegionLabel = () => {
    if (countryValue === 'United States') {
      return 'State'
    } else if (countryValue === 'Canada') {
      return 'Province/Territory'
    }
    return 'Region'
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

  // Get flag icon for dropdown items
  const getCountryFlagIconSmall = (country) => {
    if (country === 'United States') {
      return (
        <ReactCountryFlag
          countryCode='US'
          svg
          style={{ width: '1.25rem', height: '1.25rem' }}
        />
      )
    } else if (country === 'Canada') {
      return (
        <ReactCountryFlag
          countryCode='CA'
          svg
          style={{ width: '1.25rem', height: '1.25rem' }}
        />
      )
    }
    return (
      <FaGlobe
        style={{ width: '1.25rem', height: '1.25rem', color: '#8F9AA4' }}
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

  const handleCountrySelect = useCallback(
    (country) => {
      onCountryChange(country)
      // Reset region when country changes
      if (onRegionChange) {
        onRegionChange('')
      }
      setIsCountryOpen(false)
    },
    [onCountryChange, onRegionChange]
  )

  const handleRegionSelect = useCallback(
    (region) => {
      onRegionChange(region)
      setRegionSearchTerm('') // Clear search when region is selected
      setIsRegionOpen(false)
    },
    [onRegionChange]
  )

  const handleCountryClick = useCallback(() => {
    setIsCountryOpen(!isCountryOpen)
  }, [isCountryOpen])

  const handleRegionClick = useCallback(() => {
    setIsRegionOpen(!isRegionOpen)
    if (!isRegionOpen) {
      setRegionSearchTerm('') // Clear search when opening
    }
  }, [isRegionOpen])

  const handleRegionSearchChange = useCallback((e) => {
    setRegionSearchTerm(e.target.value)
  }, [])

  return (
    <div className={`country-regions-dropdown ${className}`}>
      {/* Country Dropdown */}
      <div className='educator-account-setup-form-group'>
        <label htmlFor='country'>{countryLabel}</label>
        <div className='input-group' ref={countryRef}>
          <span className='input-group-text'>
            <span className='country-flag-icon'>
              {getCountryFlagIcon(countryValue)}
            </span>
          </span>
          <div className='country-dropdown-select' onClick={handleCountryClick}>
            <span className='country-dropdown-value'>
              {countryValue || 'Select Country'}
            </span>
            <FaChevronDown
              className={`country-dropdown-chevron ${
                isCountryOpen ? 'open' : ''
              }`}
              color='#8F9AA4'
            />
          </div>
          {isCountryOpen && (
            <div className='country-dropdown-menu'>
              {countries && countries.length > 0 ? (
                countries.map((country) => (
                  <div
                    key={country}
                    className={`country-dropdown-item ${
                      countryValue === country ? 'selected' : ''
                    }`}
                    onClick={() => handleCountrySelect(country)}
                  >
                    <span className='country-flag-icon-small'>
                      {getCountryFlagIconSmall(country)}
                    </span>
                    <span className='dropdown-item-text'>{country}</span>
                    {countryValue === country && (
                      <FaCheck className='dropdown-item-check' />
                    )}
                  </div>
                ))
              ) : (
                <div className='country-dropdown-item'>
                  No countries available
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Region Dropdown */}
      {countryValue && (
        <div className='educator-account-setup-form-group'>
          <label htmlFor='region'>{getRegionLabel()}</label>
          <div className='input-group' ref={regionRef}>
            <span className='input-group-text'>
              <PiMapPinLineFill
                className='educator-account-setup-input-icon'
                color='#8F9AA4'
              />
            </span>
            <div className='region-dropdown-select' onClick={handleRegionClick}>
              <span className='region-dropdown-value'>
                {regionValue || `Select ${getRegionLabel()}`}
              </span>
              <FaChevronDown
                className={`region-dropdown-chevron ${
                  isRegionOpen ? 'open' : ''
                }`}
                color='#8F9AA4'
              />
            </div>
            {isRegionOpen && (
              <div className='region-dropdown-menu'>
                {/* Search input */}
                <div className='region-search-container'>
                  <div className='region-search-input-wrapper'>
                    <FaSearch className='region-search-icon' />
                    <input
                      type='text'
                      placeholder={`Search ${getRegionLabel().toLowerCase()}...`}
                      value={regionSearchTerm}
                      onChange={handleRegionSearchChange}
                      className='region-search-input'
                      autoFocus
                    />
                  </div>
                </div>
                {/* Region list */}
                {getFilteredRegions() && getFilteredRegions().length > 0 ? (
                  getFilteredRegions().map((region, index) => {
                    const isSelected = regionValue === region
                    const isFirstAndSelected =
                      index === 0 && isSelected && !regionSearchTerm.trim()

                    return (
                      <div
                        key={region}
                        className={`region-dropdown-item ${
                          isSelected ? 'selected' : ''
                        } ${isFirstAndSelected ? 'current-selection' : ''}`}
                        onClick={() => handleRegionSelect(region)}
                      >
                        <span className='dropdown-item-text'>{region}</span>
                        {isSelected && (
                          <FaCheck className='dropdown-item-check' />
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className='region-dropdown-item'>
                    {regionSearchTerm
                      ? 'No matching regions found'
                      : 'No regions available'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CountryRegionsDropdown
