import UserFilters from './UserFilters'
import UserTable from './UserTable'
import ManageUserModal from './ManageUserModal'
import './UserManagementContent.css'
import { FaPlus } from 'react-icons/fa6'
import { useEffect } from 'react'
import { useSchoolPortal } from '@/context/SchoolPortalContext'
import { getUsers } from '@/services/adminService'
import { useAuth } from '@/context/AuthContext'

const UserManagementContent = ({ isEducatorDashboard = false }) => {
  const { setUsers, setIsModalOpen, setIsEducatorDashboard } = useSchoolPortal()
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getUsers(undefined, currentUser.schoolId)
      setUsers(users)
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    if (isEducatorDashboard) {
      setIsEducatorDashboard(true)
    }
  }, [isEducatorDashboard])

  return (
    <div className='user-management-content'>
      <div className='user-management-content__header'>
        <h1>User Management</h1>
        <button
          className='user-management-content__header-button'
          onClick={() => setIsModalOpen(true)}
        >
          <FaPlus />
          <span>
            {/* {isEducatorDashboard ? 'Add New User' : 'Add New Teacher'} */}
            Add New User
          </span>
        </button>
      </div>
      <UserFilters />
      <UserTable />
      <ManageUserModal />
    </div>
  )
}

export default UserManagementContent
