import './TeacherContact.css'
import ContactSupport from '../../ContactSupport'
const TeacherContact = () => {
  // const menuItems = useTeacherMenuItems()
  return (
    <div className='teacher-contact-container'>
      <div className='teacher-contact-content'>
        {/* Header Section */}
        <div className='teacher-helpcenter-header'>
          <h2 className='teacher-helpcenter-title'>Contact Support</h2>
          <p className='teacher-helpcenter-subtitle'>
            Contact our support team for any questions or issues
          </p>
        </div>
        <ContactSupport />
      </div>
    </div>
  )
}

export default TeacherContact
