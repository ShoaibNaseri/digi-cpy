import './UserFilters.css'
import { useSchoolPortal } from '@/context/SchoolPortalContext'
import { getUsers } from '@/services/adminService'
import { useAuth } from '@/context/AuthContext'
import { useState, useCallback } from 'react'
import debounce from 'lodash/debounce'
import CustomDropdown from '../../../../dashboard/teacher/profile/CustomDropdown'

const UserFilters = () => {
  const { currentUser } = useAuth()
  const { setUsers, isEducatorDashboard } = useSchoolPortal()
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState('ALL')
  const [role, setRole] = useState('ALL')

  const fetchUsers = async (search, status, role) => {
    const users = await getUsers(
      status === 'ALL' ? undefined : status,
      currentUser.schoolId,
      search
    )
    // Filter by role on the client side since getUsers doesn't support role filtering
    const filteredUsers =
      role === 'ALL' ? users : users.filter((user) => user.role === role)
    setUsers(filteredUsers)
  }

  const debouncedFetchUsers = useCallback(
    debounce((search, status, role) => {
      fetchUsers(search, status, role)
    }, 300),
    []
  )

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus)
    fetchUsers(searchQuery, newStatus, role)
  }

  const handleRoleChange = async (newRole) => {
    setRole(newRole)
    fetchUsers(searchQuery, status, newRole)
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    debouncedFetchUsers(query, status, role)
  }

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'INVITED', label: 'Invited' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'DELETED', label: 'Deleted' }
  ]

  const roleOptions = [
    { value: 'ALL', label: 'All Roles' },
    { value: 'SCHOOL_ADMIN', label: 'Administrator' },
    { value: 'TEACHER', label: 'Teacher' },
    { value: 'STUDENT', label: 'Student' }
  ]

  return (
    <div className='user-filters'>
      <div className='user-filters__search'>
        <input
          type='text'
          placeholder='Search users...'
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <div className='user-filters__select'>
        <CustomDropdown
          value={status}
          onChange={handleStatusChange}
          options={statusOptions}
          placeholder='All Status'
        />
      </div>
      {isEducatorDashboard && (
        <div className='user-filters__select'>
          <CustomDropdown
            value={role}
            onChange={handleRoleChange}
            options={roleOptions}
            placeholder='All Roles'
          />
        </div>
      )}
    </div>
  )
}

export default UserFilters
