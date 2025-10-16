import './ParentContact.css'
import PageHeader from '@/components/common/dashboard-header/common/PageHeader'
import useParentMenuItems from '@/hooks/useParentMenuItems'
import ContactSupport from '../../ContactSupport'
const ParentContact = () => {
  const menuItems = useParentMenuItems()
  return (
    <div className='parent-contact-container'>
      <div className='parent-contact-content'>
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

export default ParentContact
