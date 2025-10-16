import React, { useState, useEffect } from 'react'
import {
  FaSchool,
  FaUsers,
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus
} from 'react-icons/fa'
import { getSchools } from '@/services/digi_admin/schoolService'
import './SchoolUser.css'

const SchoolUser = () => {
  const [schools, setSchools] = useState([])
  const [filteredSchools, setFilteredSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  })

  useEffect(() => {
    fetchSchools()
  }, [])

  useEffect(() => {
    handleSearch()
  }, [searchQuery, schools])

  const fetchSchools = async () => {
    try {
      setLoading(true)
      const schoolsData = await getSchools()
      setSchools(schoolsData)
    } catch (error) {
      console.error('Error fetching schools:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredSchools(schools)
      return
    }

    const searchLower = searchQuery.toLowerCase()
    const filtered = schools.filter(
      (school) =>
        school.schoolName?.toLowerCase().includes(searchLower) ||
        school.schoolAdminEmail?.toLowerCase().includes(searchLower) ||
        school.address?.toLowerCase().includes(searchLower) ||
        school.phone?.toLowerCase().includes(searchLower) ||
        school.plan?.toLowerCase().includes(searchLower) ||
        school.status?.toLowerCase().includes(searchLower)
    )
    setFilteredSchools(filtered)
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })

    const sortedSchools = [...filteredSchools].sort((a, b) => {
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

    setFilteredSchools(sortedSchools)
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

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className='sort-icon-placeholder'></span>
    }
    return sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />
  }

  return (
    <div className='school-user-container'>
      {/* Header Section */}
      <div className='school-user-header'>
        <div className='header-title-section'>
          <div className='header-icon'>
            <FaSchool />
          </div>
          <div className='header-text'>
            <h1>Schools</h1>
            <p>Manage and view all registered schools in the system</p>
          </div>
        </div>

        <button className='add-school-btn'>
          <FaPlus />
          Add New School
        </button>
      </div>

      {/* Stats Section */}
      <div className='school-stats-grid'>
        <div className='stat-card'>
          <div className='stat-icon'>
            <FaSchool />
          </div>
          <div className='stat-info'>
            <h3>{schools.length}</h3>
            <p>Total Schools</p>
          </div>
        </div>
        <div className='stat-card'>
          <div className='stat-icon'>
            <FaUsers />
          </div>
          <div className='stat-info'>
            <h3>{schools.filter((s) => s.status === 'ACTIVE').length}</h3>
            <p>Active Schools</p>
          </div>
        </div>
        <div className='stat-card'>
          <div className='stat-icon'>
            <FaUsers />
          </div>
          <div className='stat-info'>
            <h3>{schools.filter((s) => s.status === 'INACTIVE').length}</h3>
            <p>Inactive Schools</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='school-user-filters'>
        <div className='search-container'>
          <FaSearch className='search-icon' />
          <input
            type='text'
            placeholder='Search schools by name, email, address, plan, or status...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='search-input'
          />
        </div>
      </div>

      {/* Table Section */}
      <div className='school-user-table'>
        <div className='school-user-table-scroll'>
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('schoolName')}>
                  <div className='table-th'>
                    School Name {getSortIcon('schoolName')}
                  </div>
                </th>
                <th onClick={() => handleSort('country')}>
                  <div className='table-th'>
                    Country {getSortIcon('country')}
                  </div>
                </th>
                <th onClick={() => handleSort('schoolAdminEmail')}>
                  <div className='table-th'>
                    Administrator Email {getSortIcon('schoolAdminEmail')}
                  </div>
                </th>
                <th onClick={() => handleSort('plan')}>
                  <div className='table-th'>
                    Subscription Plan {getSortIcon('plan')}
                  </div>
                </th>
                <th onClick={() => handleSort('numberOfSeats')}>
                  <div className='table-th'>
                    Seats {getSortIcon('numberOfSeats')}
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
                    <div className='loading-spinner'>Loading schools...</div>
                  </td>
                </tr>
              ) : filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={7} className='no-data-cell'>
                    {searchQuery
                      ? 'No schools found matching your search.'
                      : 'No schools found.'}
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => (
                  <tr key={school.id}>
                    <td>
                      <div className='school-name-cell'>
                        <strong>{school.schoolName || 'Unnamed School'}</strong>
                        {school.address && (
                          <div className='school-address'>{school.address}</div>
                        )}
                      </div>
                    </td>
                    <td>{school.country || 'N/A'}</td>
                    <td>{school.schoolAdminEmail || 'N/A'}</td>
                    <td>
                      <span className='plan-badge'>
                        {school.plan || 'Unknown'}
                      </span>
                    </td>
                    <td>{school.numberOfSeats || 0}</td>
                    <td>{getStatusBadge(school.status)}</td>
                    <td>{formatDate(school.createdAt)}</td>
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
                          title='Edit School'
                        >
                          <FaEdit />
                        </button>
                        <button
                          className='action-btn delete-btn'
                          title='Delete School'
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
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className='results-summary'>
          Showing {filteredSchools.length} of {schools.length} schools
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      )}
    </div>
  )
}

export default SchoolUser
