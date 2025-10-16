import { Outlet } from 'react-router-dom'
import './AdminDashboardLayout.css'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import {
  AdminDashboardProvider,
  useAdminDashboard
} from '@/context/AdminDashboardContext'
import { GoGraph } from 'react-icons/go'
import { CgPerformance } from 'react-icons/cg'
import { FaUsers, FaShieldAlt } from 'react-icons/fa'
import {
  FaServer,
  FaFlag,
  FaClipboardQuestion,
  FaHandshakeSimple,
  FaClockRotateLeft,
  FaUser,
  FaBell,
  FaFileContract
} from 'react-icons/fa6'
import { IoAnalyticsSharp } from 'react-icons/io5'
import { MdFormatListBulletedAdd } from 'react-icons/md'
import { RiContactsBookFill } from 'react-icons/ri'

const AdminDashboardContent = () => {
  const { isSideBarOpen } = useAdminDashboard()
  const menuItems = [
    {
      icon: <GoGraph />,
      text: 'Dashboard',
      path: '/dashboard/admin',
      hasChildren: false
    },
    // {
    //   icon: <FaBell />,
    //   text: 'Notifications',
    //   path: '/dashboard/admin/notifications',
    //   hasChildren: false
    // },
    {
      icon: <IoAnalyticsSharp color='blue' />,
      text: ' Analytics',
      path: '/dashboard/admin/user-analytics',
      hasChildren: true,
      children: [
        {
          text: 'User Analytics',
          path: '/dashboard/admin/analytics/user-analytics'
        },
        {
          text: 'Learning Analytics',
          path: '/dashboard/admin/analytics/lesson-analytics'
        },
        // {
        //   text: 'Instructor Analytics',
        //   path: '/dashboard/admin/instructor-analytics'
        // }
      ]
    },
    {
      icon: <FaUsers />,
      text: 'User Accounts',
      path: '/dashboard/admin/user-accounts',
      hasChildren: true,
      children: [
        {
          text: 'All Users',
          path: '/dashboard/admin/user-accounts/all-users'
        },
        {
          text: 'Schools',
          path: '/dashboard/admin/user-accounts/schools'
        }
      ]
    },
    // {
    //   icon: <CgPerformance />,
    //   text: ' Performance',
    //   path: '/dashboard/admin/content-performance',
    //   hasChildren: false
    // },
    // {
    //   icon: <FaServer />,
    //   text: 'Metrics',
    //   path: '/dashboard/admin/operational-metrics',
    //   hasChildren: true,
    //   children: [
    //     {
    //       text: 'Operational Metrics',
    //       path: '/dashboard/admin/operational-metrics'
    //     },
    //     {
    //       text: 'Financial Metrics',
    //       path: '/dashboard/admin/financial-metrics'
    //     }
    //   ]
    // },
    {
      icon: <FaFlag />,
      text: 'Mission Builder',
      path: '/dashboard/admin/mission-builder',
      hasChildren: false
    },
    {
      icon: <MdFormatListBulletedAdd />,
      text: 'All Quizzes',
      path: '/dashboard/admin/all-quizzes',
      hasChildren: false
    },
    {
      icon: <FaClipboardQuestion />,
      text: 'Quiz Builder',
      path: '/dashboard/admin/quiz-builder',
      hasChildren: false
    },
    {
      icon: <FaShieldAlt />,
      text: 'Protect Plan',
      path: '/dashboard/admin/protect-plan',
      hasChildren: false
    },
    // {
    //   icon: <RiContactsBookFill />,
    //   text: 'CRM',
    //   path: '/dashboard/admin/crm',
    //   hasChildren: false
    // },
    // {
    //   icon: <FaHandshakeSimple />,
    //   text: 'Affiliate Marketing',
    //   path: '/dashboard/admin/affiliate-marketing',
    //   hasChildren: false
    // },
    {
      icon: <FaClockRotateLeft />,
      text: 'Audit Logs',
      path: '/dashboard/admin/audit-logs',
      hasChildren: false
    },
    {
      icon: <FaUser />,
      text: 'My Profile',
      path: '/dashboard/admin/profile',
      hasChildren: false
    },
    {
      icon: <FaFileContract />,
      text: 'Law Enforcement Reports',
      path: '/dashboard/admin/law-enforcement-reports',
      hasChildren: false
    }
  ]

  return (
    <div className='admin-dashboard-layout'>
      <AdminSidebar menuItems={menuItems} hideSidebar={isSideBarOpen} />
      <section>
        <main className='admin-dashboard-main'>
          <Outlet />
        </main>
      </section>
    </div>
  )
}

const AdminDashboardLayout = () => {
  return (
    <AdminDashboardProvider>
      <AdminDashboardContent />
    </AdminDashboardProvider>
  )
}

export default AdminDashboardLayout
