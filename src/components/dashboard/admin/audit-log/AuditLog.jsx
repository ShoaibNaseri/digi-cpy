import React, { useEffect, useState } from 'react'
import { getLogs } from '@/services/logService'
import './AuditLog.css'
import AuditLogTable from './AuditLogTable'
import ExportCSVButton from './ExportCSVButton'

const AuditLog = () => {
  const [logs, setLogs] = useState([])
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  })
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const logsData = await getLogs()
        setLogs(logsData)
      } catch (error) {
        console.error('Error fetching logs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedLogs = React.useMemo(() => {
    const sorted = [...logs].sort((a, b) => {
      if (sortConfig.key === 'userName') {
        const aName = a.userName || a.userId || ''
        const bName = b.userName || b.userId || ''
        if (aName < bName) return sortConfig.direction === 'asc' ? -1 : 1
        if (aName > bName) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      }
      if (sortConfig.key === 'schoolName') {
        const aSchool = a.schoolName || a.schoolId || ''
        const bSchool = b.schoolName || b.schoolId || ''
        if (aSchool < bSchool) return sortConfig.direction === 'asc' ? -1 : 1
        if (aSchool > bSchool) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      }
      if (!a[sortConfig.key] || !b[sortConfig.key]) return 0
      if (sortConfig.key === 'createdAt') {
        const aTime = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt)
        const bTime = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt)
        return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime
      }
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === 'asc' ? -1 : 1
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [logs, sortConfig])

  const actionOptions = React.useMemo(() => {
    const actions = logs.map((log) => log.action).filter(Boolean)
    return ['All', ...Array.from(new Set(actions))]
  }, [logs])

  const filteredLogs = sortedLogs.filter((log) => {
    return actionFilter === 'All' || log.action === actionFilter
  })

  const paginatedLogs = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredLogs.slice(start, start + rowsPerPage)
  }, [filteredLogs, currentPage])

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage)

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1))
  const handleNextPage = () =>
    setCurrentPage((p) => Math.min(totalPages, p + 1))

  useEffect(() => {
    setCurrentPage(1)
  }, [actionFilter, sortConfig, logs])

  return (
    <div className='audit-log'>
      <div className='audit-log-header'>
        <h1>Audit Log</h1>
        <p>View all audit logs</p>
      </div>
      <div className='audit-log-filters-row'>
        <div className='audit-log-filters'>
          <select
            id='action-filter'
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className='audit-log-action-dropdown'
          >
            {actionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <ExportCSVButton logs={filteredLogs} />
      </div>
      <AuditLogTable
        logs={paginatedLogs}
        loading={loading}
        sortConfig={sortConfig}
        handleSort={handleSort}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
      />
    </div>
  )
}

export default AuditLog
