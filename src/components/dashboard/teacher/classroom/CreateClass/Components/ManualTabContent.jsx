/**
 * Content for the manual entry tab
 */
const ManualTabContent = ({ toggleAddStudentModal }) => {
  return (
    <div className='tcr-manual-entry-area'>
      <div className='tcr-manual-entry-container'>
        <div className='tcr-manual-entry-icon'>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21V19A4 4 0 0 0 12 15H8A4 4 0 0 0 4 19V21" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="#94A3B8" strokeWidth="2"/>
          </svg>
        </div>
        <div className='tcr-manual-entry-text'>
          Add students one by one to your class
        </div>
        <button
          type='button'
          className='tcr-manual-entry-button'
          onClick={toggleAddStudentModal}
        >
          Enter Manually
        </button>
      </div>
    </div>
  )
}

export default ManualTabContent
