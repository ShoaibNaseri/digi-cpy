import './EducatorAccess.css'
import { FaRegUserCircle } from 'react-icons/fa'
import { FaChalkboardUser } from 'react-icons/fa6'
import { FaGraduationCap } from 'react-icons/fa6'
import { FaShieldAlt } from 'react-icons/fa'
import { FaSchool } from 'react-icons/fa6'

const EducatorAccess = () => {
  return (
    <div className='login-container'>
      <div className='access-layout'>
        <div className='login-card-wrapper'>
          <div className='login-card'>
            <div className='login-card-body'>
              <div className='access-card-body-icon'>
                <FaChalkboardUser size={50} />
              </div>
              <p className='access-card-title'>Educator Access</p>
              <p className='access-card-subtitle'>
                Please enter your access code to continue
              </p>
              <form
                action='auth-from'
                style={{
                  textAlign: 'start'
                }}
              >
                <div className='form-group mb-4'>
                  <label htmlFor='email' className='login-form-label'>
                    Access Code
                  </label>
                </div>
                <div className='input-group'>
                  <input
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1px solid #000',
                      padding: '10px',
                      width: '100%',
                      backgroundColor: '#fff',
                      color: '#9c9494',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                    type='email'
                    className=''
                    id='email'
                    placeholder='Enter your access code'
                  />
                </div>
                <div className='access-card-subtitle-note'>
                  Enter the code provided by your institution
                </div>
                <button type='submit' className='access-submit-btn'>
                  Access Platform
                </button>
              </form>
              <div className='access-card-footer'>
                <p className='access-card-footer-text'>
                  Need an access code?{' '}
                  <span className='access-card-footer-text-link'>
                    Contact administrator
                  </span>
                </p>
              </div>
              <div className='bottom-border-line'></div>
              <div className='protect-platform'>
                <div className='platform-text'>
                  <p>Portected education platform</p>
                </div>
                <div className='platform-icons'>
                  <FaShieldAlt size={15} style={{ marginRight: '5px' }} />
                  <FaSchool size={19} style={{ marginRight: '5px' }} />
                  <FaGraduationCap size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EducatorAccess
