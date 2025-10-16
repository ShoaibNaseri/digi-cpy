import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ChildAccountDetails.css'
import { FaArrowLeftLong } from 'react-icons/fa6'

const ChildAccountDetails = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDay: '',
    country: '',
    stateProvince: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleDateChange = (e) => {
    const dateValue = e.target.value
    if (dateValue) {
      setFormData({
        ...formData,
        birthDay: dateValue
      })
    } else {
      setFormData({
        ...formData,
        birthDay: ''
      })
    }
  }

  const handleCancel = () => {
    navigate('/onboarding/parent/child-account-type')
  }

  const handleContinue = () => {
    navigate('/onboarding/parent/family-plan-setup')
  }

  return (
    <div className='child-account-details-container'>
      <div className='child-account-details-content'>
        <h2 className='child-account-details-title'>Child Account Details</h2>
        <p className='child-account-details-subtitle'>
          Please provide your child's information
        </p>

        <form className='child-account-details-form'>
          <div className='form-group'>
            <label htmlFor='firstName'>First Name</label>
            <input
              type='text'
              id='firstName'
              name='firstName'
              placeholder='Enter first name'
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>

          <div className='form-group'>
            <label htmlFor='lastName'>Last Name</label>
            <input
              type='text'
              id='lastName'
              name='lastName'
              placeholder='Enter last name'
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>

          <div className='form-group'>
            <label htmlFor='birthDay'>Birth Day</label>
            <input
              type='date'
              id='birthDay'
              name='birthDay'
              className='date-picker-input'
              value={formData.birthDay}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className='form-group'>
            <label htmlFor='country'>Country</label>
            <select
              id='country'
              name='country'
              value={formData.country}
              onChange={handleInputChange}
            >
              <option value='' disabled>
                Select country
              </option>
              <option value='us'>United States</option>
              <option value='ca'>Canada</option>
            </select>
          </div>

          <div className='form-group'>
            <label htmlFor='stateProvince'>State/Province</label>
            <select
              id='stateProvince'
              name='stateProvince'
              value={formData.stateProvince}
              onChange={handleInputChange}
            >
              <option value='' disabled>
                Select state/province
              </option>
              {formData.country === 'us' && (
                <>
                  <option value='AL'>Alabama</option>
                  <option value='AK'>Alaska</option>
                  <option value='AZ'>Arizona</option>
                  <option value='AR'>Arkansas</option>
                  <option value='CA'>California</option>
                  <option value='CO'>Colorado</option>
                  <option value='CT'>Connecticut</option>
                  <option value='DE'>Delaware</option>
                  <option value='FL'>Florida</option>
                  <option value='GA'>Georgia</option>
                  <option value='HI'>Hawaii</option>
                  <option value='ID'>Idaho</option>
                  <option value='IL'>Illinois</option>
                  <option value='IN'>Indiana</option>
                  <option value='IA'>Iowa</option>
                  <option value='KS'>Kansas</option>
                  <option value='KY'>Kentucky</option>
                </>
              )}
              {formData.country === 'ca' && (
                <>
                  <option value='AB'>Alberta</option>
                  <option value='BC'>British Columbia</option>
                  <option value='MB'>Manitoba</option>
                  <option value='NB'>New Brunswick</option>
                  <option value='NL'>Newfoundland and Labrador</option>
                  <option value='NS'>Nova Scotia</option>
                  <option value='ON'>Ontario</option>
                  <option value='PE'>Prince Edward Island</option>
                  <option value='QC'>Quebec</option>
                  <option value='SK'>Saskatchewan</option>
                </>
              )}
            </select>
          </div>

          <div className='form-actions'>
            <button
              type='button'
              className='form-actions-back-button'
              onClick={handleCancel}
            >
              <FaArrowLeftLong />
              <span>Back</span>
            </button>
            <button
              type='button'
              className='continue-button'
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChildAccountDetails
