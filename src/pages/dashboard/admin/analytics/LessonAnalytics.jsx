import React, { useState, useEffect } from 'react'
import {
  FaGamepad,
  FaClock,
  FaUsers,
  FaRedo,
  FaArrowUp,
  FaArrowDown,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaUserCheck
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
import { Doughnut, Line } from 'react-chartjs-2'
import {
  getMissionAnalyticsSummary,
  getSpecificMissionAnalytics,
  getMissionAttemptsChartData,
  getTimeSpentByMissionChartData,
  formatDuration,
  formatTimeSince
} from '@/services/digi_admin/missionAnalyticsService'
import './LessonAnalytics.css'
import { getAllMissions } from '@/utils/jsnMissions'

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

const LessonAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [specificMissionData, setSpecificMissionData] = useState(null)
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMission, setSelectedMission] = useState(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)

  // Sorting states
  const [sortConfig, setSortConfig] = useState({
    key: 'totalTimeSpent',
    direction: 'desc'
  })

  const missionsList = getAllMissions()

  useEffect(() => {
    fetchOverallAnalytics()
  }, [])

  useEffect(() => {
    if (selectedMission) {
      fetchSpecificMissionAnalytics(selectedMission.id)
    } else {
      // Clear specific mission data when no mission is selected
      setSpecificMissionData(null)
      setFilteredUsers([])
    }
  }, [selectedMission])

  useEffect(() => {
    if (specificMissionData) {
      handleSort()
    } else {
      // Clear filtered users when no specific mission data
      setFilteredUsers([])
    }
  }, [specificMissionData, sortConfig])

  useEffect(() => {
    if (specificMissionData) {
      handleSearch()
    } else {
      // Clear filtered users when no specific mission data
      setFilteredUsers([])
    }
  }, [searchQuery, specificMissionData, sortConfig])

  useEffect(() => {
    setCurrentPage(1)
    // Also clear search when switching missions
    if (selectedMission) {
      setSearchQuery('')
    }
  }, [selectedMission, sortConfig, searchQuery])

  const fetchOverallAnalytics = async () => {
    try {
      setLoading(true)
      const data = await getMissionAnalyticsSummary()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching mission analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSpecificMissionAnalytics = async (missionId) => {
    try {
      setLoading(true)
      // Clear previous data immediately when starting new fetch
      setSpecificMissionData(null)
      setFilteredUsers([])

      const data = await getSpecificMissionAnalytics(missionId.toString())

      if (data && data.userDetails) {
        setSpecificMissionData(data)
      } else {
        setSpecificMissionData({
          ...data,
          userDetails: []
        })
      }
    } catch (error) {
      console.error('Error fetching specific mission analytics:', error)
      // Set empty data on error
      setSpecificMissionData({
        missionId: parseInt(missionId) || 0,
        missionTitle: `Mission ${missionId}`,
        totalAttempts: 0,
        totalTimeSpent: 0,
        uniqueUsers: 0,
        averageTimePerUser: 0,
        averageAttemptsPerUser: 0,
        userDetails: []
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSort = () => {
    if (!specificMissionData?.userDetails?.length) {
      setFilteredUsers([])
      return
    }

    const sortedData = [...specificMissionData.userDetails].sort((a, b) => {
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

    if (!searchQuery.trim()) {
      setFilteredUsers(sortedData)
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
      setFilteredUsers(searchFiltered)
    }
  }

  const handleSearch = () => {
    if (!specificMissionData?.userDetails?.length) {
      setFilteredUsers([])
      return
    }
    handleSort()
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
      return <span className='lesson-analytics-sort-icon-placeholder'></span>
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

  const handleMissionClick = (mission) => {
    if (!mission) {
      // Handle "All Missions - Overview" selection
      setSelectedMission(null)
      setSpecificMissionData(null)
      setFilteredUsers([])
    } else if (selectedMission?.id === mission.id) {
      // If clicking the same mission, deselect it
      setSelectedMission(null)
      setSpecificMissionData(null)
      setFilteredUsers([])
    } else {
      // Select new mission
      setSelectedMission(mission)
    }
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)

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

  if (loading && !analyticsData) {
    return (
      <div className='lesson-analytics-container'>
        <div className='loading-spinner'>Loading mission analytics...</div>
      </div>
    )
  }

  return (
    <div className='lesson-analytics-container'>
      {/* Header Section */}
      <div className='lesson-analytics-header'>
        <div className='lesson-analytics-header-title-section'>
          <div className='lesson-analytics-header-icon'>
            <FaGamepad />
          </div>
          <div className='lesson-analytics-header-text'>
            <h1>Mission Analytics</h1>
            <p>
              Track mission engagement, completion rates, and user performance
              across all missions
            </p>
          </div>
        </div>
      </div>

      {/* Mission Selection Dropdown */}
      <div className='lesson-analytics-mission-filter-section'>
        <h2 className='lesson-analytics-mission-filter-title'>
          Select a Mission to View Detailed Analytics
        </h2>
        <div className='lesson-analytics-mission-dropdown-container'>
          <select
            className='lesson-analytics-mission-dropdown'
            value={selectedMission?.id || ''}
            onChange={(e) => {
              const missionId = e.target.value
              if (missionId) {
                const mission = missionsList.find(
                  (m) => m.id === parseInt(missionId)
                )
                handleMissionClick(mission)
              } else {
                handleMissionClick(null)
              }
            }}
          >
            <option value=''>All Missions - Overview</option>
            {missionsList.map((mission) => (
              <option key={mission.id} value={mission.id}>
                Mission {mission.id}: {mission.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall Summary Cards */}
      {analyticsData && (
        <div className='lesson-analytics-summary'>
          <div className='lesson-analytics-summary-card'>
            <div className='lesson-analytics-summary-card-content'>
              <div className='lesson-analytics-summary-info'>
                <h3>{analyticsData.overallSummary.totalMissions}</h3>
                <p>Active Missions</p>
              </div>
              <div className='lesson-analytics-summary-icon'>
                <FaGamepad />
              </div>
            </div>
          </div>

          <div className='lesson-analytics-summary-card'>
            <div className='lesson-analytics-summary-card-content'>
              <div className='lesson-analytics-summary-info'>
                <h3>{analyticsData.overallSummary.totalUsers}</h3>
                <p>Total Users</p>
              </div>
              <div className='lesson-analytics-summary-icon'>
                <FaUsers />
              </div>
            </div>
          </div>

          <div className='lesson-analytics-summary-card'>
            <div className='lesson-analytics-summary-card-content'>
              <div className='lesson-analytics-summary-info'>
                <h3>{analyticsData.overallSummary.totalAttempts}</h3>
                <p>Total Attempts</p>
              </div>
              <div className='lesson-analytics-summary-icon'>
                <FaRedo />
              </div>
            </div>
          </div>

          <div className='lesson-analytics-summary-card'>
            <div className='lesson-analytics-summary-card-content'>
              <div className='lesson-analytics-summary-info'>
                <h3>
                  {formatDuration(analyticsData.overallSummary.totalTimeSpent)}
                </h3>
                <p>Total Time Spent</p>
              </div>
              <div className='lesson-analytics-summary-icon'>
                <FaClock />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts - Show different charts based on selection */}
      <div className='lesson-analytics-charts'>
        {selectedMission ? (
          <>
            {/* Mission-specific charts */}
            <div className='lesson-analytics-chart-container'>
              <div className='lesson-analytics-chart-header'>
                <h3 className='lesson-analytics-chart-title'>
                  {selectedMission.title} - Daily Attempts
                </h3>
                <p className='lesson-analytics-chart-subtitle'>
                  Daily attempt count over the last 30 days
                </p>
              </div>
              <div className='lesson-analytics-chart-content'>
                <MissionAttemptsChart missionId={selectedMission.id} />
              </div>
            </div>

            <div className='lesson-analytics-chart-container'>
              <div className='lesson-analytics-chart-header'>
                <h3 className='lesson-analytics-chart-title'>
                  Mission Summary
                </h3>
                <p className='lesson-analytics-chart-subtitle'>
                  Overview of {selectedMission.title} engagement
                </p>
              </div>
              <div className='lesson-analytics-chart-content lesson-analytics-mission-summary-stats'>
                {specificMissionData && (
                  <>
                    <div className='lesson-analytics-summary-stat'>
                      <div className='lesson-analytics-summary-stat-icon users'>
                        <FaUsers />
                      </div>
                      <div className='lesson-analytics-summary-stat__value'>
                        {specificMissionData.uniqueUsers}
                      </div>
                      <div className='lesson-analytics-summary-stat__label'>
                        Unique Users
                      </div>
                    </div>
                    <div className='lesson-analytics-summary-stat'>
                      <div className='lesson-analytics-summary-stat-icon attempts'>
                        <FaRedo />
                      </div>
                      <div className='lesson-analytics-summary-stat__value'>
                        {specificMissionData.totalAttempts}
                      </div>
                      <div className='lesson-analytics-summary-stat__label'>
                        Total Attempts
                      </div>
                    </div>
                    <div className='lesson-analytics-summary-stat'>
                      <div className='lesson-analytics-summary-stat-icon time'>
                        <FaClock />
                      </div>
                      <div className='lesson-analytics-summary-stat__value'>
                        {formatDuration(specificMissionData.totalTimeSpent)}
                      </div>
                      <div className='lesson-analytics-summary-stat__label'>
                        Total Time
                      </div>
                    </div>
                    <div className='lesson-analytics-summary-stat'>
                      <div className='lesson-analytics-summary-stat-icon average'>
                        <FaUserCheck />
                      </div>
                      <div className='lesson-analytics-summary-stat__value'>
                        {formatDuration(specificMissionData.averageTimePerUser)}
                      </div>
                      <div className='lesson-analytics-summary-stat__label'>
                        Avg Time/User
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Overall charts */}
            <div className='lesson-analytics-chart-container'>
              <div className='lesson-analytics-chart-header'>
                <h3 className='lesson-analytics-chart-title'>
                  Time Spent by Mission
                </h3>
                <p className='lesson-analytics-chart-subtitle'>
                  Total minutes spent across all missions
                </p>
              </div>
              <div className='lesson-analytics-chart-content'>
                <TimeSpentByMissionChart />
              </div>
            </div>

            <div className='lesson-analytics-chart-container'>
              <div className='lesson-analytics-chart-header'>
                <h3 className='lesson-analytics-chart-title'>
                  Mission Engagement Overview
                </h3>
                <p className='lesson-analytics-chart-subtitle'>
                  Click on a mission above to view detailed analytics
                </p>
              </div>
              <div className='lesson-analytics-chart-content'>
                <div className='lesson-analytics-engagement-overview'>
                  <div className='lesson-analytics-engagement-message'>
                    <FaGamepad className='lesson-analytics-engagement-icon' />
                    <h4>Select a Mission</h4>
                    <p>
                      Choose a mission from the grid above to view detailed
                      analytics, user performance data, and engagement metrics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Details Table - Only show when a mission is selected */}
      {selectedMission && specificMissionData && (
        <div className='lesson-analytics-user-table'>
          <div className='lesson-analytics-table-header'>
            <h3 className='lesson-analytics-table-title'>
              {selectedMission.title} - User Performance
            </h3>
            <div className='lesson-analytics-table-search'>
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

          <div className='lesson-analytics-table-scroll'>
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSortClick('firstName')}>
                    <div className='lesson-analytics-table-th'>
                      User {getSortIcon('firstName')}
                    </div>
                  </th>
                  <th onClick={() => handleSortClick('role')}>
                    <div className='lesson-analytics-table-th'>
                      Role {getSortIcon('role')}
                    </div>
                  </th>
                  <th onClick={() => handleSortClick('attemptCount')}>
                    <div className='lesson-analytics-table-th'>
                      Attempts {getSortIcon('attemptCount')}
                    </div>
                  </th>
                  <th onClick={() => handleSortClick('totalTimeSpent')}>
                    <div className='lesson-analytics-table-th'>
                      Time Spent {getSortIcon('totalTimeSpent')}
                    </div>
                  </th>
                  <th onClick={() => handleSortClick('averageSessionTime')}>
                    <div className='lesson-analytics-table-th'>
                      Avg Session {getSortIcon('averageSessionTime')}
                    </div>
                  </th>
                  <th onClick={() => handleSortClick('progress')}>
                    <div className='lesson-analytics-table-th'>
                      Progress {getSortIcon('progress')}
                    </div>
                  </th>
                  <th onClick={() => handleSortClick('lastAttempt')}>
                    <div className='lesson-analytics-table-th'>
                      Last Attempt {getSortIcon('lastAttempt')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className='lesson-analytics-loading-cell'>
                      <div className='lesson-analytics-loading-spinner'>
                        Loading user data...
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='lesson-analytics-no-data-cell'>
                      {searchQuery
                        ? `No users found matching "${searchQuery}".`
                        : 'No user data found for this mission.'}
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.userId}>
                      <td>
                        <div className='lesson-analytics-user-info-cell'>
                          <div className='lesson-analytics-user-avatar'>
                            {getUserInitials(user)}
                          </div>
                          <div className='lesson-analytics-user-details'>
                            <h4>{`${user.firstName} ${user.lastName}`}</h4>
                            <p>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`lesson-analytics-role-badge ${getRoleBadgeClass(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>{user.attemptCount}</td>
                      <td>
                        <span
                          className={`lesson-analytics-time-badge ${getTimeBadgeClass(
                            user.totalTimeSpent
                          )}`}
                        >
                          {formatDuration(user.totalTimeSpent)}
                        </span>
                      </td>
                      <td>{formatDuration(user.averageSessionTime)}</td>
                      <td>
                        <div className='lesson-analytics-progress-cell'>
                          <div className='lesson-analytics-progress-bar'>
                            <div
                              className='lesson-analytics-progress-fill'
                              style={{ width: `${user.progress}%` }}
                            ></div>
                          </div>
                          <span className='lesson-analytics-progress-text'>
                            {user.progress}%
                          </span>
                        </div>
                      </td>
                      <td>
                        {user.lastAttempt
                          ? formatTimeSince(user.lastAttempt)
                          : 'Never'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && filteredUsers.length > 0 && (
            <div className='lesson-analytics-pagination-container'>
              <div className='lesson-analytics-pagination-info'>
                Showing {indexOfFirstUser + 1} to{' '}
                {Math.min(indexOfLastUser, filteredUsers.length)} of{' '}
                {filteredUsers.length} users
              </div>

              <div className='lesson-analytics-pagination-controls'>
                <button
                  className={`lesson-analytics-pagination-btn ${
                    currentPage === 1 ? 'disabled' : ''
                  }`}
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                  Previous
                </button>

                <div className='lesson-analytics-pagination-numbers'>
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      className={`lesson-analytics-pagination-number ${
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
                  className={`lesson-analytics-pagination-btn ${
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
      )}

      {/* Results Summary */}
      {selectedMission && !loading && (
        <div className='lesson-analytics-results-summary'>
          Showing {currentUsers.length} of {filteredUsers.length} users for{' '}
          {selectedMission.title}
          {searchQuery && ` • Search: "${searchQuery}"`}
          {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
        </div>
      )}
    </div>
  )
}

// Chart Components
const MissionAttemptsChart = ({ missionId }) => {
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMissionAttemptsChartData(missionId.toString())
        setChartData(data)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      }
    }
    fetchData()
  }, [missionId])

  if (!chartData) return <div>Loading chart...</div>

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }

  return <Line data={chartData} options={chartOptions} />
}

const TimeSpentByMissionChart = () => {
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTimeSpentByMissionChartData()
        setChartData(data)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      }
    }
    fetchData()
  }, [])

  if (!chartData) return <div>Loading chart...</div>

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
    }
  }

  return <Doughnut data={chartData} options={chartOptions} />
}

export default LessonAnalytics
