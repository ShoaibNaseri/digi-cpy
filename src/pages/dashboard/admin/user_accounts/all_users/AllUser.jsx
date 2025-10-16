import React, { useState, useEffect } from 'react'
import {
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserTie,
  FaUser,
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaFilter,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'
import {
  getAllUsers,
  getPaginatedUsers,
  USER_ROLES
} from '@/services/digi_admin/userService'
import './AllUser.css'

const AllUser = () => {
  const [allUsers, setAllUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [paginatedData, setPaginatedData] = useState({
    users: [],
    totalUsers: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 8,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    handleFilterAndSearch()
  }, [searchQuery, roleFilter, allUsers])

  useEffect(() => {
    handlePagination()
  }, [filteredUsers, currentPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersData = await getAllUsers()
      setAllUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterAndSearch = () => {
    let filtered = [...allUsers]

    // Filter by role
    if (roleFilter && roleFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Search functionality
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.role?.toLowerCase().includes(searchLower) ||
          user.schoolId?.toLowerCase().includes(searchLower) ||
          user.status?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredUsers(filtered)
    // Reset to first page when filters change
    setCurrentPage(1)
  }

  const handlePagination = async () => {
    try {
      const paginatedResult = await getPaginatedUsers(
        filteredUsers,
        currentPage,
        8
      )
      setPaginatedData(paginatedResult)
    } catch (error) {
      console.error('Error paginating users:', error)
    }
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      let aValue = a[key]
      let bValue = b[key]

      // Handle timestamps
      if (key === 'createdAt' || key === 'updatedAt') {
        aValue = aValue?.toDate?.() || new Date(aValue)
        bValue = bValue?.toDate?.() || new Date(bValue)
      }

      // Handle strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue?.toLowerCase() || ''
      }

      // Handle numbers
      if (typeof aValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Handle strings
      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })

    setFilteredUsers(sortedUsers)
    // Reset to first page after sorting
    setCurrentPage(1)
  }

  const handleNextPage = () => {
    if (paginatedData.hasNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (paginatedData.hasPrevPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp?.toDate?.() || new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const statusClass =
      status === 'ACTIVE' ? 'status-active' : 'status-inactive'
    return (
      <span className={`status-badge ${statusClass}`}>
        {status || 'UNKNOWN'}
      </span>
    )
  }

  const getRoleBadge = (role) => {
    const roleClasses = {
      SCHOOL_ADMIN: 'role-admin',
      TEACHER: 'role-teacher',
      STUDENT: 'role-student',
      PARENT: 'role-parent'
    }
    const roleClass = roleClasses[role] || 'role-unknown'
    return (
      <span className={`role-badge ${roleClass}`}>{role || 'Unknown'}</span>
    )
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'SCHOOL_ADMIN':
        return <FaUserTie />
      case 'TEACHER':
        return <FaChalkboardTeacher />
      case 'STUDENT':
        return <FaUserGraduate />
      case 'PARENT':
        return <FaUser />
      default:
        return <FaUsers />
    }
  }

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className='sort-icon-placeholder'></span>
    }
    return sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />
  }

  const getUserFullName = (user) => {
    const firstName = user.firstName || ''
    const lastName = user.lastName || ''
    return `${firstName} ${lastName}`.trim() || 'Unknown User'
  }

  const getRoleStats = () => {
    const stats = {
      SCHOOL_ADMIN: allUsers.filter((u) => u.role === 'SCHOOL_ADMIN').length,
      TEACHER: allUsers.filter((u) => u.role === 'TEACHER').length,
      STUDENT: allUsers.filter((u) => u.role === 'STUDENT').length,
      PARENT: allUsers.filter((u) => u.role === 'PARENT').length
    }
    return stats
  }

  const getSchoolStatus = (user) => {
    if (!user.schoolId) {
      return <span className='school-id no-school'>No School Details</span>
    }

    if (user.schoolExists === false) {
      return (
        <span className='school-id deleted-school'>
          School has been deleted
        </span>
      )
    }

    if (user.schoolData && user.schoolData.schoolName) {
      return (
        <span className='school-id valid-school'>
          {user.schoolData.schoolName}
        </span>
      )
    }

    // Fallback to school ID if no school name is available
    return <span className='school-id valid-school'>{user.schoolId}</span>
  }

  const renderPageNumbers = () => {
    const pageNumbers = []
    const { totalPages, currentPage } = paginatedData

    // Show max 5 page numbers
    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(totalPages, startPage + 4)

    // Adjust start if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`page-number ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      )
    }

    return pageNumbers
  }

  const roleStats = getRoleStats()

  return (
    <div className='all-user-container'>
      {/* Header Section */}
      <div className='all-user-header'>
        <div className='header-title-section'>
          <div className='header-icon'>
            <FaUsers />
          </div>
          <div className='header-text'>
            <h1>All Users</h1>
            <p>Manage and view all registered users across the platform</p>
          </div>
        </div>

        <button className='add-user-btn'>
          <FaPlus />
          Add New User
        </button>
      </div>

      {/* Stats Section */}
      <div className='user-stats-grid'>
        <div className='stat-card'>
          <div className='stat-icon'>
            <FaUsers />
          </div>
          <div className='stat-info'>
            <h3>{allUsers.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className='stat-card'>
          <div className='stat-icon'>
            <FaUserTie />
          </div>
          <div className='stat-info'>
            <h3>{roleStats.SCHOOL_ADMIN}</h3>
            <p>School Admins</p>
          </div>
        </div>
        <div className='stat-card'>
          <div className='stat-icon'>
            <FaChalkboardTeacher />
          </div>
          <div className='stat-info'>
            <h3>{roleStats.TEACHER}</h3>
            <p>Teachers</p>
          </div>
        </div>
        <div className='stat-card'>
          <div className='stat-icon'>
            <FaUserGraduate />
          </div>
          <div className='stat-info'>
            <h3>{roleStats.STUDENT}</h3>
            <p>Students</p>
          </div>
        </div>
        <div className='stat-card'>
          <div className='stat-icon'>
            <FaUser />
          </div>
          <div className='stat-info'>
            <h3>{roleStats.PARENT}</h3>
            <p>Parents</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='all-user-filters'>
        <div className='search-container'>
          <FaSearch className='search-icon' />
          <input
            type='text'
            placeholder='Search users by name, email, role, or school...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='search-input'
          />
        </div>

        <div className='filter-container'>
          <FaFilter className='filter-icon' />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className='role-filter-dropdown'
          >
            <option value='ALL'>All Roles</option>
            <option value='SCHOOL_ADMIN'>School Admin</option>
            <option value='TEACHER'>Teacher</option>
            <option value='STUDENT'>Student</option>
            <option value='PARENT'>Parent</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className='all-user-table'>
        <div className='all-user-table-scroll'>
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('firstName')}>
                  <div className='table-th'>
                    Full Name {getSortIcon('firstName')}
                  </div>
                </th>
                <th onClick={() => handleSort('email')}>
                  <div className='table-th'>Email {getSortIcon('email')}</div>
                </th>
                <th onClick={() => handleSort('role')}>
                  <div className='table-th'>Role {getSortIcon('role')}</div>
                </th>
                <th onClick={() => handleSort('schoolId')}>
                  <div className='table-th'>
                    School ID {getSortIcon('schoolId')}
                  </div>
                </th>
                <th onClick={() => handleSort('status')}>
                  <div className='table-th'>Status {getSortIcon('status')}</div>
                </th>
                <th onClick={() => handleSort('createdAt')}>
                  <div className='table-th'>
                    Created {getSortIcon('createdAt')}
                  </div>
                </th>
                <th>
                  <div className='table-th'>Actions</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className='loading-cell'>
                    <div className='loading-spinner'>Loading users...</div>
                  </td>
                </tr>
              ) : paginatedData.users.length === 0 ? (
                <tr>
                  <td colSpan={7} className='no-data-cell'>
                    {searchQuery || roleFilter !== 'ALL'
                      ? 'No users found matching your filters.'
                      : 'No users found.'}
                  </td>
                </tr>
              ) : (
                paginatedData.users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className='user-name-cell'>
                        <div className='user-icon'>
                          {getRoleIcon(user.role)}
                        </div>
                        <div className='user-details'>
                          <strong>{getUserFullName(user)}</strong>
                          {user.phone && (
                            <div className='user-phone'>{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{user.email || 'N/A'}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>
                      {user.role === 'PARENT'
                        ? 'Parent Account'
                        : getSchoolStatus(user)}
                    </td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className='action-buttons'>
                        <button
                          className='action-btn view-btn'
                          title='View Details'
                        >
                          <FaEye />
                        </button>
                        <button
                          className='action-btn edit-btn'
                          title='Edit User'
                        >
                          <FaEdit />
                        </button>
                        <button
                          className='action-btn delete-btn'
                          title='Delete User'
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && paginatedData.totalPages > 1 && (
          <div className='user-pagination'>
            <button
              onClick={handlePrevPage}
              disabled={!paginatedData.hasPrevPage}
              className='pagination-btn'
            >
              <FaChevronLeft />
              Previous
            </button>

            <div className='page-numbers'>{renderPageNumbers()}</div>

            <button
              onClick={handleNextPage}
              disabled={!paginatedData.hasNextPage}
              className='pagination-btn'
            >
              Next
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className='results-summary'>
          Showing {(currentPage - 1) * 8 + 1} to{' '}
          {Math.min(currentPage * 8, paginatedData.totalUsers)} of{' '}
          {paginatedData.totalUsers} users
          {roleFilter !== 'ALL' && ` (${roleFilter} only)`}
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      )}
    </div>
  )
}

export default AllUser
