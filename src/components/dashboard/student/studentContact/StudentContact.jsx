import './StudentContact.css'
import PageHeader from '@/components/common/dashboard-header/common/PageHeader'
import useStudentMenuItems from '@/hooks/useStudentMenuItems'
import ContactSupport from '../../ContactSupport'
const StudentContact = () => {
  const menuItems = useStudentMenuItems()
  return (
    <div className='student-contact-container'>
      <div className='student-contact-content'>
        <PageHeader
          title='Contact Support'
          subtitle='Contact our support team for any questions or issues'
          menuItems={menuItems}
        />
        <ContactSupport />
      </div>
    </div>
  )
}

export default StudentContact
