import React, { useState, useEffect } from 'react'
import {
  FaChartBar,
  FaClock,
  FaUsers,
  FaSignInAlt,
  FaArrowUp,
  FaArrowDown,
  FaUserCheck,
  FaUserTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSearch
} from 'react-icons/fa'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  getUserAnalytics,
  getAnalyticsSummary,
  getTimeSpentByRoleChartData,
  getLoginActivityChartData,
  formatDuration,
  formatTimeSince
} from '@/services/digi_admin/analyticsService'
import './UserAnalytics.css'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

const UserAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({})

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)

  // Filter states
  const [filters, setFilters] = useState({
    role: 'ALL',
    timePeriod: 'ALL'
  })

  // Sorting states
  const [sortConfig, setSortConfig] = useState({
    key: 'analytics.totalTimeSpent',
    direction: 'desc'
  })

  useEffect(() => {
    fetchAnalytics()
  }, [filters])

  useEffect(() => {
    handleSort()
  }, [analyticsData, sortConfig])

  useEffect(() => {
    handleSearch()
  }, [searchQuery, analyticsData, sortConfig])

  useEffect(() => {
    // Reset to first page when filters or search change
    setCurrentPage(1)
  }, [filters, sortConfig, searchQuery])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const data = await getUserAnalytics(filters)
      setAnalyticsData(data)
      setSummary(getAnalyticsSummary(data))
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = () => {
    if (!analyticsData.length) return

    const sortedData = [...analyticsData].sort((a, b) => {
      let aValue = getNestedValue(a, sortConfig.key)
      let bValue = getNestedValue(b, sortConfig.key)

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue?.toLowerCase() || ''
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    // Apply search filter to sorted data
    if (!searchQuery.trim()) {
      setFilteredData(sortedData)
    } else {
      const searchLower = searchQuery.toLowerCase()
      const searchFiltered = sortedData.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.role?.toLowerCase().includes(searchLower) ||
          `${user.firstName || ''} ${user.lastName || ''}`
            .toLowerCase()
            .includes(searchLower)
      )
      setFilteredData(searchFiltered)
    }
  }

  const handleSearch = () => {
    if (!analyticsData.length) return

    if (!searchQuery.trim()) {
      // If no search query, use the current sorted data
      handleSort()
      return
    }

    const searchLower = searchQuery.toLowerCase()
    const searchFiltered = analyticsData.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower) ||
        `${user.firstName || ''} ${user.lastName || ''}`
          .toLowerCase()
          .includes(searchLower)
    )

    // Apply sorting to search results
    const sortedSearchResults = [...searchFiltered].sort((a, b) => {
      let aValue = getNestedValue(a, sortConfig.key)
      let bValue = getNestedValue(b, sortConfig.key)

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue?.toLowerCase() || ''
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    setFilteredData(sortedSearchResults)
  }

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  const handleSortClick = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className='user-analytics-sort-icon-placeholder'></span>
    }
    return sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />
  }

  const getUserInitials = (user) => {
    const firstName = user.firstName || 'U'
    const lastName = user.lastName || ''
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'teacher':
        return 'teacher'
      case 'student':
        return 'student'
      case 'school_admin':
        return 'school_admin'
      case 'parent':
        return 'parent'
      case 'admin':
        return 'admin'
      default:
        return 'student'
    }
  }

  const getTimeBadgeClass = (timeSpent) => {
    const hours = timeSpent / (1000 * 60 * 60)
    if (hours >= 2) return 'high'
    if (hours >= 0.5) return 'medium'
    return 'low'
  }

  const getLoginStatus = (timeSinceLastLogin) => {
    if (!timeSinceLastLogin) {
      return { class: 'offline', text: 'Never logged in' }
    }

    const hours = timeSinceLastLogin / (1000 * 60 * 60)
    if (hours <= 1) {
      return { class: 'online', text: 'Online' }
    } else if (hours <= 24) {
      return { class: 'recent', text: 'Recently active' }
    } else {
      return { class: 'offline', text: 'Offline' }
    }
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / usersPerPage)
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredData.slice(indexOfFirstUser, indexOfLastUser)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      const end = Math.min(totalPages, start + maxVisiblePages - 1)

      if (start > 1) {
        pages.push(1)
        if (start > 2) pages.push('...')
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  }

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }

  return (
    <div className='user-analytics-container'>
      {/* Header Section */}
      <div className='user-analytics-header'>
        <div className='user-analytics-header-title-section'>
          <div className='user-analytics-header-icon'>
            <FaChartBar />
          </div>
          <div className='user-analytics-header-text'>
            <h1>User Analytics</h1>
            <p>
              Track user engagement, session times, and login patterns across
              your platform
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='user-analytics-filters'>
        <div className='user-analytics-filter-group'>
          <label className='user-analytics-filter-label'>User Role</label>
          <select
            className='user-analytics-filter-select'
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value='ALL'>All Roles</option>
            <option value='ADMIN'>Admins</option>
            <option value='TEACHER'>Teachers</option>
            <option value='STUDENT'>Students</option>
            <option value='SCHOOL_ADMIN'>School Admins</option>
            <option value='PARENT'>Parents</option>
          </select>
        </div>

        <div className='user-analytics-filter-group'>
          <label className='user-analytics-filter-label'>Time Period</label>
          <select
            className='user-analytics-filter-select'
            value={filters.timePeriod}
            onChange={(e) =>
              setFilters({ ...filters, timePeriod: e.target.value })
            }
          >
            <option value='ALL'>All Time</option>
            <option value='TODAY'>Today</option>
            <option value='WEEK'>This Week</option>
            <option value='MONTH'>This Month</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='user-analytics-summary'>
        <div className='user-analytics-summary-card'>
          <div className='user-analytics-summary-card-content'>
            <div className='user-analytics-summary-info'>
              <h3>{summary.totalUsers || 0}</h3>
              <p>Total Users</p>
            </div>
            <div className='user-analytics-summary-icon'>
              <FaUsers />
            </div>
          </div>
        </div>

        <div className='user-analytics-summary-card'>
          <div className='user-analytics-summary-card-content'>
            <div className='user-analytics-summary-info'>
              <h3>{formatDuration(summary.totalTimeSpent || 0)}</h3>
              <p>Total Time Spent</p>
            </div>
            <div className='user-analytics-summary-icon'>
              <FaClock />
            </div>
          </div>
        </div>

        <div className='user-analytics-summary-card'>
          <div className='user-analytics-summary-card-content'>
            <div className='user-analytics-summary-info'>
              <h3>{summary.totalLogins || 0}</h3>
              <p>Total Logins</p>
            </div>
            <div className='user-analytics-summary-icon'>
              <FaSignInAlt />
            </div>
          </div>
        </div>

        <div className='user-analytics-summary-card'>
          <div className='user-analytics-summary-card-content'>
            <div className='user-analytics-summary-info'>
              <h3>{summary.activeUsers || 0}</h3>
              <p>Active Users (7 days)</p>
            </div>
            <div className='user-analytics-summary-icon'>
              <FaUserCheck />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className='user-analytics-charts'>
        <div className='user-analytics-chart-container'>
          <div className='user-analytics-chart-header'>
            <h3 className='user-analytics-chart-title'>Time Spent by Role</h3>
            <p className='user-analytics-chart-subtitle'>
              Total minutes spent by user role
            </p>
          </div>
          <div className='user-analytics-chart-content'>
            {analyticsData.length > 0 ? (
              <Doughnut
                data={getTimeSpentByRoleChartData(analyticsData)}
                options={chartOptions}
              />
            ) : (
              <div>No data available</div>
            )}
          </div>
        </div>

        <div className='user-analytics-chart-container'>
          <div className='user-analytics-chart-header'>
            <h3 className='user-analytics-chart-title'>Login Activity</h3>
            <p className='user-analytics-chart-subtitle'>
              Daily login count over the last 30 days
            </p>
          </div>
          <div className='user-analytics-chart-content'>
            {analyticsData.length > 0 ? (
              <Line
                data={getLoginActivityChartData(analyticsData)}
                options={lineChartOptions}
              />
            ) : (
              <div>No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className='user-analytics-table'>
        <div className='user-analytics-table-header'>
          <h3 className='user-analytics-table-title'>User Details</h3>
          <div className='user-analytics-table-search'>
            <FaSearch className='search-icon' />
            <input
              type='text'
              placeholder='Search users by name, email, or role...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='search-input'
            />
          </div>
        </div>

        <div className='user-analytics-table-scroll'>
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSortClick('firstName')}>
                  <div className='user-analytics-table-th'>
                    User {getSortIcon('firstName')}
                  </div>
                </th>
                <th onClick={() => handleSortClick('role')}>
                  <div className='user-analytics-table-th'>
                    Role {getSortIcon('role')}
                  </div>
                </th>
                <th onClick={() => handleSortClick('analytics.totalTimeSpent')}>
                  <div className='user-analytics-table-th'>
                    Time Spent {getSortIcon('analytics.totalTimeSpent')}
                  </div>
                </th>
                <th onClick={() => handleSortClick('analytics.loginCount')}>
                  <div className='user-analytics-table-th'>
                    Login Count {getSortIcon('analytics.loginCount')}
                  </div>
                </th>
                <th
                  onClick={() =>
                    handleSortClick('analytics.averageSessionTime')
                  }
                >
                  <div className='user-analytics-table-th'>
                    Avg Session {getSortIcon('analytics.averageSessionTime')}
                  </div>
                </th>
                <th onClick={() => handleSortClick('analytics.lastLogin')}>
                  <div className='user-analytics-table-th'>
                    Last Login {getSortIcon('analytics.lastLogin')}
                  </div>
                </th>
                <th>
                  <div className='user-analytics-table-th'>Status</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className='user-analytics-loading-cell'>
                    <div className='user-analytics-loading-spinner'>
                      Loading analytics...
                    </div>
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className='user-analytics-no-data-cell'>
                    {searchQuery
                      ? `No users found matching "${searchQuery}".`
                      : 'No user data found for the selected filters.'}
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => {
                  const loginStatus = getLoginStatus(
                    user.analytics.timeSinceLastLogin
                  )

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className='user-analytics-user-info-cell'>
                          <div className='user-analytics-user-avatar'>
                            {getUserInitials(user)}
                          </div>
                          <div className='user-analytics-user-details'>
                            <h4>{`${user.firstName || 'Unknown'} ${
                              user.lastName || 'User'
                            }`}</h4>
                            <p>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`user-analytics-role-badge ${getRoleBadgeClass(
                            user.role
                          )}`}
                        >
                          {user.role || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`user-analytics-time-badge ${getTimeBadgeClass(
                            user.analytics.totalTimeSpent
                          )}`}
                        >
                          {formatDuration(user.analytics.totalTimeSpent)}
                        </span>
                      </td>
                      <td>{user.analytics.loginCount}</td>
                      <td>
                        {formatDuration(user.analytics.averageSessionTime)}
                      </td>
                      <td>
                        {user.analytics.lastLogin
                          ? user.analytics.lastLogin.toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td>
                        <div className='user-analytics-login-status'>
                          <span
                            className={`user-analytics-login-status-dot ${loginStatus.class}`}
                          ></span>
                          {formatTimeSince(user.analytics.timeSinceLastLogin)}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredData.length > 0 && (
          <div className='user-analytics-pagination-container'>
            <div className='user-analytics-pagination-info'>
              Showing {indexOfFirstUser + 1} to{' '}
              {Math.min(indexOfLastUser, filteredData.length)} of{' '}
              {filteredData.length} users
            </div>

            <div className='user-analytics-pagination-controls'>
              <button
                className={`user-analytics-pagination-btn ${
                  currentPage === 1 ? 'disabled' : ''
                }`}
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
                Previous
              </button>

              <div className='user-analytics-pagination-numbers'>
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    className={`user-analytics-pagination-number ${
                      page === currentPage ? 'active' : ''
                    } ${page === '...' ? 'dots' : ''}`}
                    onClick={() =>
                      typeof page === 'number' && handlePageChange(page)
                    }
                    disabled={page === '...'}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className={`user-analytics-pagination-btn ${
                  currentPage === totalPages ? 'disabled' : ''
                }`}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className='user-analytics-results-summary'>
          Showing {currentUsers.length} of {filteredData.length} users
          {filters.role !== 'ALL' && ` (${filters.role})`}
          {filters.timePeriod !== 'ALL' && ` • ${filters.timePeriod}`}
          {searchQuery && ` • Search: "${searchQuery}"`}
          {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
        </div>
      )}
    </div>
  )
}

export default UserAnalytics
