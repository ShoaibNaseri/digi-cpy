import React from 'react'

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

const ExportCSVButton = ({ logs }) => (
  <button
    onClick={() => exportLogsToCSV(logs)}
    className='audit-log-export-btn'
  >
    Export CSV
  </button>
)

export default ExportCSVButton
