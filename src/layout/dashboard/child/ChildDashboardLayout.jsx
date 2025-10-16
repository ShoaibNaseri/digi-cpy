import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '@/components/dashboard/Sidebar'
import { TbTarget, TbDevicesQuestion } from 'react-icons/tb'
import { HiChatBubbleLeftRight } from 'react-icons/hi2'
import { BsShieldFillCheck } from 'react-icons/bs'
import { FaQuestion } from 'react-icons/fa'
import { FaClipboardQuestion } from 'react-icons/fa6'
import './ChildDashboardLayout.css'

const ICON_SIZE = 20

const ChildDashboardLayout = ({ hideSidebar }) => {
  const location = useLocation()
  const isSupportChat = location.pathname === '/dashboard/child/support-chat'

  const menuItems = [
    {
      icon: <TbTarget size={ICON_SIZE} />,
      text: 'Missions',
      path: '/dashboard/child'
    },
    {
      icon: <FaClipboardQuestion size={ICON_SIZE} />,
      text: 'Quizzes',
      path: '/dashboard/child/quizzes'
    }
    // {
    //   icon: <HiChatBubbleLeftRight size={ICON_SIZE} />,
    //   text: 'Support Chat',
    //   path: '/dashboard/child/support-chat'
    // },
    // {
    //   icon: <BsShieldFillCheck size={ICON_SIZE} />,
    //   text: 'My Protection Plan',
    //   path: '/dashboard/child/my-protection-plan'
    // },
    // {
    //   icon: <FaQuestion size={ICON_SIZE} />,
    //   text: 'Help',
    //   path: '/dashboard/child/help'
    // }
  ]

  return (
    <div className='layout'>
      {!hideSidebar && <Sidebar menuItems={menuItems} />}
      <main
        className={`${
          isSupportChat ? 'main__container-support-chat' : 'main__container'
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default ChildDashboardLayout
