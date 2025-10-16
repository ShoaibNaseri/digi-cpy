import './HelpContent.css'
import { icons } from '@/config/images'
import HelpFaqList from './HelpFaqList'
import TeacherContactForm from '../teacher/helps/TeacherContactForm'
import HelpResourceCards from './HelpResourceCards'
import PageHeader from '@/components/common/dashboard-header/common/PageHeader'
import useStudentMenuItems from '@/hooks/useStudentMenuItems'
import useEducatorMenuItems from '@/hooks/useEducatorMenuItems'
import { useLocation } from 'react-router-dom'
const HelpContent = () => {
  const location = useLocation()
  const studentMenuItems = useStudentMenuItems()
  const educatorMenuItems = useEducatorMenuItems()
  const isParentPath = location.pathname.includes('/dashboard/parent')
  const isEducatorPath = location.pathname.includes('/dashboard/educator')
  const isStudentPath = location.pathname.includes('/dashboard/student')

  const menuItems = isParentPath
    ? educatorMenuItems
    : isEducatorPath
    ? educatorMenuItems
    : isStudentPath
    ? studentMenuItems
    : []
  return (
    <>
      <div className='container'>
        <PageHeader
          title='Help Center'
          subtitle='Find answers to common questions.'
          menuItems={menuItems}
        />

        {/* Resources Section */}
        <HelpResourceCards />

        {/* FAQ Section */}
        <HelpFaqList />
      </div>
    </>
  )
}

export default HelpContent
