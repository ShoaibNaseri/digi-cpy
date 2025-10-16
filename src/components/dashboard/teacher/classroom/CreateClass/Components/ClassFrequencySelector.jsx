import React from 'react'
import { HiCalendar } from 'react-icons/hi2'

const ClassFrequencySelector = ({ frequency, onFrequencyChange }) => {
  const handleFrequencyButtonClick = (selectedFrequency) => {
    onFrequencyChange(selectedFrequency)
  }

  return (
    <div className='tcr-form-field-group'>
      <label className='tcr-section-label'>How often will you teach this class?</label>
      <div className='tcr-frequency-button-group'>
        {/* <button
          type='button'
          className={`tcr-frequency-button ${
            frequency === 'weekly' ? 'active' : ''
          }`}
          onClick={() => handleFrequencyButtonClick('weekly')}
        >
          <div className='tcr-frequency-icon'>
            <HiCalendar size={22} color="currentColor" />
          </div>
          Weekly
        </button>
        <button
          type='button'
          className={`tcr-frequency-button ${
            frequency === 'biweekly' ? 'active' : ''
          }`}
          onClick={() => handleFrequencyButtonClick('biweekly')}
        >
          <div className='tcr-frequency-icon'>
            <HiCalendar size={22} color="currentColor" />
          </div>
          Bi-Weekly
        </button> */}
        <button
          type='button'
          className={`tcr-frequency-button ${
            frequency === 'monthly' ? 'active' : ''
          }`}
          onClick={() => handleFrequencyButtonClick('monthly')}
        >
          <div className='tcr-frequency-icon'>
            <HiCalendar size={22} color="currentColor" />
          </div>
          Monthly
        </button>
      </div>
    </div>
  )
}

export default ClassFrequencySelector
