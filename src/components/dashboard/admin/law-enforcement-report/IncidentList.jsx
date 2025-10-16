import React, { useState, useEffect, useCallback } from 'react'
import IncidentCard from './IncidentCard'
import './LawEnforcementReport.css'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { getLawEnforcementReports } from '@/services/lawIncidentReportService'

const IncidentList = ({ searchQuery, statusFilter }) => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchReports = async () => {
    try {
      setLoading(true)
      const fetchedReports = await getLawEnforcementReports()
      setReports(fetchedReports)
      setTotalPages(Math.ceil(fetchedReports.length / 6)) // 6 reports per page
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterReports = useCallback(() => {
    if (!searchQuery) {
      return reports
    }

    return reports.filter((report) =>
      report.incidentReport.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, reports])

  useEffect(() => {
    fetchReports()
  }, [])

  if (loading && reports.length === 0) {
    return <div className='incident-loading'>Loading reports...</div>
  }

  const filteredReports = filterReports()
  const startIndex = (currentPage - 1) * 6
  const endIndex = startIndex + 6
  const currentReports = filteredReports.slice(startIndex, endIndex)

  return (
    <div className='incident-list-container'>
      <div className='incident-grid'>
        {currentReports.map((report) => (
          <IncidentCard key={report.id} data={report} />
        ))}
      </div>

      {filteredReports.length > 6 && (
        <div className='incident-pagination'>
          <button
            className='incident-pagination-button'
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaArrowLeft />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`incident-pagination-button ${
                currentPage === page ? 'active' : ''
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className='incident-pagination-button'
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaArrowRight />
          </button>
        </div>
      )}
    </div>
  )
}

export default IncidentList
