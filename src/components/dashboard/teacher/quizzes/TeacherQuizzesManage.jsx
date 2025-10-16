import './TeacherQuizzesManage.css'
import { useState } from 'react'
import { icons, images } from '../../../../config/teacherDash/images.js'

const TeacherQuizzesManage = () => {
  const [allowMultipleAttempts, setAllowMultipleAttempts] = useState(false)

  // Sample quiz data
  const quizzes = [
    'Cyberbullying',
    'IP Addresses & Digital Footprints',
    'Online Scams & Password Protection',
    'Personal Information & Identity Theft',
    'Artificial Intelligence and Deepfakes',
    'Extortion',
    'Catfishing & Fake Profiles',
    'Grooming',
    'Online Predators',
    'Social Engineering'
  ]

  const handleToggleSwitch = () => {
    setAllowMultipleAttempts(!allowMultipleAttempts)
  }

  return (
    <div className='quiz-management-container'>
      {/* head section */}
      <div className='header-section'>
        <h1 className='section-title'>Quiz Management</h1>
        <p className='section-description'>
          Access and download quizzes for your classes
        </p>
      </div>

      {/* setting section */}
      <div className='settings-section'>
        <h2 className='settings-title'>Quiz Settings</h2>
        <div className='setting-card'>
          <div className='setting-label'>Allow multiple attempts</div>
          <div className='switch-container'>
            <label className='switch'>
              <input
                type='checkbox'
                checked={allowMultipleAttempts}
                onChange={handleToggleSwitch}
              />
              <span className='slider round'></span>
            </label>
          </div>
        </div>
      </div>

      {/* library section */}
      <div className='library-section'>
        <h2 className='library-title'>Quiz Library</h2>
        <div className='quiz-list'>
          {quizzes.map((quiz, index) => (
            <div className='quiz-item' key={index}>
              <span className='quiz-name'>{quiz}</span>
              <button className='download-btn'>
                <img
                  src={icons.downloadIcon}
                  alt='downloadIcon'
                  className='downloadIcon'
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeacherQuizzesManage
