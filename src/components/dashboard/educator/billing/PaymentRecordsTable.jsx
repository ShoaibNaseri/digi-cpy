import React, { useState, useEffect, useMemo } from 'react'
import {
  FaSearch,
  FaDownload,
  FaChevronUp,
  FaChevronDown,
  FaFileInvoice
} from 'react-icons/fa'
import { getUserPaymentRecords } from '@/services/paymentService'
import { useAuth } from '@/context/AuthContext'
import InvoiceModal from './InvoiceModal'
import './PaymentRecordsTable.css'

const PaymentRecordsTable = () => {
  const [paymentRecords, setPaymentRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortField, setSortField] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchPaymentRecords = async () => {
      try {
        setLoading(true)
        if (currentUser?.uid) {
          const records = await getUserPaymentRecords(currentUser.uid)
          if (records.success === false) {
            setError(records.error)
          } else {
            // Add id to each record for consistency
            const recordsWithId = records.map((record, index) => ({
              id: `payment-${index}-${Date.now()}`,
              ...record
            }))
            setPaymentRecords(recordsWithId)
            setFilteredRecords(recordsWithId)
          }
        }
      } catch (err) {
        setError('Failed to load payment records')
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentRecords()
  }, [currentUser])

  // Filter records based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecords(paymentRecords)
    } else {
      const filtered = paymentRecords.filter((record) => {
        const searchTerm = searchQuery.toLowerCase()

        // Search in text fields
        const textMatch =
          record.id?.toLowerCase().includes(searchTerm) ||
          record.planType?.toLowerCase().includes(searchTerm) ||
          record.paymentStatus?.toLowerCase().includes(searchTerm) ||
          record.sessionId?.toLowerCase().includes(searchTerm) ||
          record.stripeSessionId?.toLowerCase().includes(searchTerm)

        // Search in numeric fields (seats)
        const seatsMatch = record.numOfSeats?.toString().includes(searchTerm)

        // Search in amount (convert to dollars for easier searching)
        const amountInDollars = record.total
          ? (record.total / 100).toFixed(2)
          : '0.00'
        const amountMatch =
          amountInDollars.includes(searchTerm) ||
          record.total?.toString().includes(searchTerm)

        return textMatch || seatsMatch || amountMatch
      })
      setFilteredRecords(filtered)
    }
  }, [searchQuery, paymentRecords])

  // Sort records
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle date fields
      if (sortField === 'createdAt' || sortField === 'paymentDate') {
        aValue = aValue?.toDate ? aValue.toDate() : new Date(aValue)
        bValue = bValue?.toDate ? bValue.toDate() : new Date(bValue)
      }

      // Handle numeric fields
      if (sortField === 'total' || sortField === 'numOfSeats') {
        aValue = parseFloat(aValue) || 0
        bValue = parseFloat(bValue) || 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredRecords, sortField, sortDirection])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    let date
    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate()
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp)
    } else if (timestamp instanceof Date) {
      date = timestamp
    } else {
      return 'N/A'
    }
    if (isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00'
    return `$${(amount / 100).toFixed(2)}`
  }

  const openInvoiceModal = (record) => {
    setSelectedRecord(record)
    setIsInvoiceModalOpen(true)
  }

  const closeInvoiceModal = () => {
    setIsInvoiceModalOpen(false)
    setSelectedRecord(null)
  }

  const exportAllRecords = () => {
    if (sortedRecords.length === 0) {
      alert('No records to export')
      return
    }

    // Create CSV headers
    const headers = [
      'Payment ID',
      'Stripe ID',
      'Email',
      'Plan Type',
      'Seats',
      'Amount',
      'Discount',
      'Status',
      'Payment Date',
      'Created At'
    ]

    // Create CSV rows
    const csvRows = sortedRecords.map((record) => [
      record.id || 'N/A',
      record.stripeSessionId || 'N/A',
      record.email || 'N/A',
      record.planType || 'N/A',
      record.numOfSeats || 'N/A',
      formatCurrency(record.total),
      record.discount ? `${record.discount}%` : '0%',
      record.paymentStatus || 'N/A',
      formatDate(record.paymentDate),
      formatDate(record.createdAt)
    ])

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payment-records-${
      new Date().toISOString().split('T')[0]
    }.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className='payment-records-loading'>
        <div className='payment-records-spinner'></div>
        <p>Loading payment records...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='payment-records-error'>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className='payment-records-table'>
      <div className='payment-records-table-header'>
        <h3 className='payment-records-table-title'>Payment History</h3>
        <div className='payment-records-table-controls'>
          <div className='payment-records-table-search'>
            <div className='payment-records-search-icon'>
              <FaSearch />
            </div>
            <input
              type='text'
              placeholder='Search by payment ID, plan type, status, seats, or amount...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='payment-records-search-input'
            />
          </div>
          <button
            onClick={exportAllRecords}
            className='payment-records-export-btn'
            title='Export all records to CSV'
          >
            <FaDownload />
            Export All
          </button>
        </div>
      </div>

      <div className='payment-records-table-scroll'>
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                <div className='payment-records-table-th'>
                  Payment ID {getSortIcon('id')}
                </div>
              </th>
              <th onClick={() => handleSort('planType')}>
                <div className='payment-records-table-th'>
                  Plan Type {getSortIcon('planType')}
                </div>
              </th>
              <th onClick={() => handleSort('numOfSeats')}>
                <div className='payment-records-table-th'>
                  Seats {getSortIcon('numOfSeats')}
                </div>
              </th>
              <th onClick={() => handleSort('total')}>
                <div className='payment-records-table-th'>
                  Amount {getSortIcon('total')}
                </div>
              </th>
              <th onClick={() => handleSort('discount')}>
                <div className='payment-records-table-th'>
                  Discount {getSortIcon('discount')}
                </div>
              </th>
              <th onClick={() => handleSort('paymentStatus')}>
                <div className='payment-records-table-th'>
                  Status {getSortIcon('paymentStatus')}
                </div>
              </th>
              <th onClick={() => handleSort('paymentDate')}>
                <div className='payment-records-table-th'>
                  Payment Date {getSortIcon('paymentDate')}
                </div>
              </th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan='8' className='payment-records-no-records'>
                  No payment records found
                </td>
              </tr>
            ) : (
              sortedRecords.map((record) => (
                <tr key={record.id}>
                  <td className='payment-records-payment-id-cell'>
                    <span className='payment-records-payment-id-text'>
                      {record.id || 'N/A'}
                    </span>
                  </td>
                  <td className='payment-records-plan-type-cell'>
                    <span className='payment-records-plan-type-badge'>
                      {record.planType?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td className='payment-records-seats-cell'>
                    <span className='payment-records-seats-count'>
                      {record.numOfSeats || 'N/A'}
                    </span>
                  </td>
                  <td className='payment-records-amount-cell'>
                    <span className='payment-records-amount-value'>
                      {formatCurrency(record.total)}
                    </span>
                  </td>
                  <td className='payment-records-discount-cell'>
                    <span className='payment-records-discount-value'>
                      {record.discount ? `${record.discount}%` : '0%'}
                    </span>
                  </td>
                  <td className='payment-records-status-cell'>
                    <span
                      className={`payment-records-status-badge payment-records-status-${
                        record.paymentStatus?.toLowerCase() || 'unknown'
                      }`}
                    >
                      {record.paymentStatus || 'N/A'}
                    </span>
                  </td>
                  <td className='payment-records-date-cell'>
                    <span className='payment-records-date-text'>
                      {formatDate(record.paymentDate)}
                    </span>
                  </td>
                  <td className='payment-records-actions-cell'>
                    <button
                      onClick={() => openInvoiceModal(record)}
                      className='payment-records-invoice-btn'
                      title='View invoice'
                    >
                      <FaFileInvoice />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sortedRecords.length > 0 && (
        <div className='payment-records-summary'>
          <p>
            Showing {sortedRecords.length} payment record
            {sortedRecords.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* Invoice Modal */}
      {isInvoiceModalOpen && selectedRecord && (
        <InvoiceModal
          record={selectedRecord}
          isOpen={isInvoiceModalOpen}
          onClose={closeInvoiceModal}
        />
      )}
    </div>
  )
}

export default PaymentRecordsTable
