import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/dashboard/Sidebar'
import { TbTarget } from 'react-icons/tb'
import { FaUser, FaQuestion, FaCreditCard, FaBook } from 'react-icons/fa'
import { BiSupport } from 'react-icons/bi'
import { FaChildren } from 'react-icons/fa6'
import './ParentDashboardLayout.css'

const ICON_SIZE = 20

const ParentDashboardLayout = ({ hideSidebar }) => {
  const menuItems = [
    {
      icon: <TbTarget size={ICON_SIZE} />,
      text: 'Dashboard',
      path: '/dashboard/parent'
    },
    {
      icon: <FaBook size={ICON_SIZE} />,
      text: ' Resources',
      path: '/dashboard/parent/teaching-resources'
    },
    {
      icon: <FaUser size={ICON_SIZE} />,
      text: 'My Profile',
      path: '/dashboard/parent/profile'
    },
    {
      icon: <FaChildren size={ICON_SIZE} />,
      text: 'Children Profile',
      path: '/dashboard/parent/add-child'
    },
    {
      icon: <FaCreditCard size={ICON_SIZE} />,
      text: 'Billings',
      path: '/dashboard/parent/billings'
    },
    {
      icon: <FaQuestion size={ICON_SIZE} />,
      text: 'Help',
      path: '/dashboard/parent/help'
    },
    {
      icon: <BiSupport size={ICON_SIZE} />,
      text: 'Contact',
      path: '/dashboard/parent/contact'
    }
  ]

  return (
    <div className='layout'>
      {!hideSidebar && <Sidebar menuItems={menuItems} />}
      <main className='TeacherDashboard_main__container'>
        <Outlet />
      </main>
    </div>
  )
}

export default ParentDashboardLayout
