import React from 'react'
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'
import './AuditLog.css'

function exportLogsToCSV(logs) {
  if (!logs || logs.length === 0) return
  const headers = ['Action', 'User', 'School', 'Collection', 'Time']
  const rows = logs.map((log) => [
    log.action || '',
    log.userName ? log.userName : log.userId || '',
    log.schoolName ? log.schoolName : log.schoolId || '',
    log.collection || '',
    log.createdAt?.toDate
      ? log.createdAt.toDate().toLocaleString()
      : new Date(log.createdAt).toLocaleString()
  ])
  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'audit_logs.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const AuditLogTable = ({
  logs,
  loading,
  sortConfig,
  handleSort,
  currentPage,
  totalPages,
  handlePrevPage,
  handleNextPage
}) => {
  return (
    <div className='audit-log-table'>
      <div className='audit-log-table-scroll'>
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('action')}>
                <div className='audit-log-table-th'>
                  Action{' '}
                  {sortConfig.key === 'action' ? (
                    sortConfig.direction === 'asc' ? (
                      <FaArrowUp />
                    ) : (
                      <FaArrowDown />
                    )
                  ) : (
                    ''
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('userName')}>
                <div className='audit-log-table-th'>
                  User{' '}
                  {sortConfig.key === 'userName' ? (
                    sortConfig.direction === 'asc' ? (
                      <FaArrowUp />
                    ) : (
                      <FaArrowDown />
                    )
                  ) : (
                    ''
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('schoolName')}>
                <div className='audit-log-table-th'>
                  School{' '}
                  {sortConfig.key === 'schoolName' ? (
                    sortConfig.direction === 'asc' ? (
                      <FaArrowUp />
                    ) : (
                      <FaArrowDown />
                    )
                  ) : (
                    ''
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('collection')}>
                <div className='audit-log-table-th'>
                  Collection{' '}
                  {sortConfig.key === 'collection' ? (
                    sortConfig.direction === 'asc' ? (
                      <FaArrowUp />
                    ) : (
                      <FaArrowDown />
                    )
                  ) : (
                    ''
                  )}
                </div>
              </th>
              <th onClick={() => handleSort('createdAt')}>
                <div className='audit-log-table-th'>
                  Time{' '}
                  {sortConfig.key === 'createdAt' ? (
                    sortConfig.direction === 'asc' ? (
                      <FaArrowUp />
                    ) : (
                      <FaArrowDown />
                    )
                  ) : (
                    ''
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>Loading...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4}>No logs found.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.action}</td>
                  <td>{log.userName ? log.userName : log.userId}</td>
                  <td>{log.schoolName ? log.schoolName : log.schoolId}</td>
                  <td>{log.collection}</td>
                  <td>
                    {log.createdAt?.toDate
                      ? log.createdAt.toDate().toLocaleString()
                      : new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className='audit-log-pagination'>
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className='audit-log-pagination-btn'
        >
          Previous
        </button>
        <span className='audit-log-pagination-info'>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className='audit-log-pagination-btn'
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default AuditLogTable
