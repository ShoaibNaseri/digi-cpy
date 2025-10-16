import PropTypes from 'prop-types'
import UploadTabContent from './UploadTabContent.jsx'
import ManualTabContent from './ManualTabContent.jsx'

/**
 * Component for the student import section of the class form
 */
const StudentImportSection = ({
  activeTab,
  setActiveTab,
  onFileUpload,
  toggleAddStudentModal
}) => {
  return (
    <div className='tcr-form-field-group'>

      {/* Tab navigation for Upload CSV / Enter Manually */}
      <div className='tcr-student-import-tabs'>
        <button
          type='button'
          className={`tcr-tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <div className='tcr-tab-icon'>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          Upload CSV
        </button>
        <button
          type='button'
          className={`tcr-tab-button ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          Enter Manually
        </button>
      </div>

      {/* Content based on active tab */}
      <div className='tcr-tab-content'>
        {activeTab === 'upload' ? (
          <UploadTabContent onFileUpload={onFileUpload} />
        ) : (
          <ManualTabContent toggleAddStudentModal={toggleAddStudentModal} />
        )}
      </div>
    </div>
  )
}

StudentImportSection.propTypes = {
  activeTab: PropTypes.oneOf(['upload', 'manual']).isRequired,
  setActiveTab: PropTypes.func.isRequired,
  onFileUpload: PropTypes.func.isRequired,
  toggleAddStudentModal: PropTypes.func.isRequired
}

UploadTabContent.propTypes = {
  onFileUpload: PropTypes.func.isRequired
}

ManualTabContent.propTypes = {
  toggleAddStudentModal: PropTypes.func.isRequired
}

export default StudentImportSection
