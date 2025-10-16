import React, { useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { FaTimes, FaDownload } from 'react-icons/fa'
import jsPDF from 'jspdf'
import './InvoiceModal.css'
import digipalzLogo from '@/assets/digipalz_b.png'
const BASIC_PRICE = 4.99
const PREMIUM_PRICE = 5.99
const MONTHS_PER_YEAR = 10

const InvoiceModal = ({ record, isOpen, onClose }) => {
  const invoiceRef = useRef(null)

  // Close modal with Escape key and manage body overflow
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

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
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00'
    return `$${(amount / 100).toFixed(2)}`
  }

  const getPricePerMonth = (planType) => {
    switch (planType?.toLowerCase()) {
      case 'basic':
        return BASIC_PRICE
      case 'premium':
        return PREMIUM_PRICE
      default:
        return 0
    }
  }

  const calculateTableTotal = (planType, seats) => {
    const pricePerMonth = getPricePerMonth(planType)
    return pricePerMonth * seats * MONTHS_PER_YEAR
  }

  const downloadPDF = () => {
    if (!invoiceRef.current) return

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Add header with better spacing
    pdf.setFontSize(28)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Digipalz', 20, 25)

    // Add invoice title
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('INVOICE', pageWidth - 20, 25, { align: 'right' })

    // Add separator line
    pdf.setLineWidth(0.8)
    pdf.setDrawColor(0, 0, 0)
    pdf.line(20, 32, pageWidth - 20, 32)

    // Add invoice details section
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Invoice Details', 20, 45)

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Invoice #: ${String(record.id || 'N/A')}`, 20, 52)
    pdf.text(`Date: ${formatDate(record.paymentDate)}`, 20, 58)
    pdf.text(`Stripe ID: ${String(record.stripeSessionId || 'N/A')}`, 20, 64)

    // Add customer details section
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Bill To:', 20, 80)

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.text(String(record.email || 'N/A'), 20, 87)

    // Add main separator line
    pdf.setLineWidth(0.5)
    pdf.line(20, 95, pageWidth - 20, 95)

    // Add table with better formatting
    const tableStartY = 105
    const colPositions = [20, 100, 120, 150, 180]

    // Table headers with background
    pdf.setFillColor(248, 249, 250) // Light gray background
    pdf.rect(20, tableStartY - 5, pageWidth - 40, 8, 'F')

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Description', colPositions[0], tableStartY)
    pdf.text('Qty', colPositions[1], tableStartY)
    pdf.text('Price/Month', colPositions[2], tableStartY)
    pdf.text('Duration', colPositions[3], tableStartY)
    pdf.text('Total', colPositions[4], tableStartY)

    // Header line
    pdf.setLineWidth(0.3)
    pdf.line(20, tableStartY + 2, pageWidth - 20, tableStartY + 2)

    // Table content
    const itemY = tableStartY + 10
    const pricePerMonth = getPricePerMonth(record.planType)
    const tableTotal = calculateTableTotal(record.planType, record.numOfSeats)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.text(
      `${String(record.planType?.toUpperCase() || 'N/A')} Plan`,
      colPositions[0],
      itemY
    )
    pdf.text(String(record.numOfSeats || 'N/A'), colPositions[1], itemY)
    pdf.text(`$${pricePerMonth.toFixed(2)}`, colPositions[2], itemY)
    pdf.text(`${MONTHS_PER_YEAR} months`, colPositions[3], itemY)
    pdf.text(`$${tableTotal.toFixed(2)}`, colPositions[4], itemY)

    // Add totals section with better formatting
    const totalsY = itemY + 20
    const totalsStartX = 120

    // Subtotal (calculated from table)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Subtotal:', totalsStartX, totalsY)
    pdf.text(`$${tableTotal.toFixed(2)}`, totalsStartX + 30, totalsY)

    let currentY = totalsY + 8

    // Discount if applicable
    if (record.discount && parseInt(record.discount) > 0) {
      const discountAmount = (record.total * record.discount) / 100
      pdf.text(
        `Discount (${String(record.discount)}%):`,
        totalsStartX,
        currentY
      )
      pdf.text(
        `-${formatCurrency(discountAmount)}`,
        totalsStartX + 30,
        currentY
      )
      currentY += 8
    }

    // Total line
    pdf.setLineWidth(0.3)
    pdf.line(totalsStartX, currentY - 2, totalsStartX + 40, currentY - 2)

    // Table Total
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Table Total:', totalsStartX, currentY + 5)
    pdf.text(`$${tableTotal.toFixed(2)}`, totalsStartX + 30, currentY + 5)

    // Add separator line before actual total
    currentY += 25
    pdf.setLineWidth(0.5)
    pdf.line(totalsStartX, currentY, totalsStartX + 50, currentY)

    // Actual Total from record - Add much more spacing
    currentY += 20
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('ACTUAL TOTAL:', totalsStartX - 20, currentY)
    pdf.text(formatCurrency(record.total), totalsStartX + 30, currentY)

    // Status section - Add much more spacing after actual total
    const statusY = currentY + 40
    pdf.setFillColor(248, 249, 250)
    pdf.rect(20, statusY - 5, pageWidth - 40, 12, 'F')

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Status:', 25, statusY + 2)

    // Color code status
    const status = String(record.paymentStatus || 'N/A')
    if (status.toLowerCase() === 'paid') {
      pdf.setTextColor(22, 101, 52) // Green
    } else if (status.toLowerCase() === 'pending') {
      pdf.setTextColor(146, 64, 14) // Orange
    } else if (status.toLowerCase() === 'failed') {
      pdf.setTextColor(153, 27, 27) // Red
    } else {
      pdf.setTextColor(107, 114, 128) // Gray
    }

    pdf.setFont('helvetica', 'normal')
    pdf.text(status, 80, statusY + 2) // Position status value to avoid overlap with ACTUAL TOTAL
    pdf.setTextColor(0, 0, 0) // Reset to black

    // Footer
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'italic')
    pdf.setTextColor(107, 114, 128)
    pdf.text('Thank you for your business!', 20, pageHeight - 15)

    // Reset text color
    pdf.setTextColor(0, 0, 0)

    // Save the PDF
    pdf.save(`invoice-${String(record.id || 'unknown')}.pdf`)
  }

  if (!isOpen) return null

  if (!record) {
    console.error('InvoiceModal: No record provided')
    return null
  }

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('invoice-modal-backdrop')) {
      onClose()
    }
  }

  const modalContent = (
    <div className='invoice-modal-backdrop' onClick={handleBackdropClick}>
      <div className='invoice-modal-container'>
        {/* Modal Header */}
        <div className='invoice-modal-header'>
          <div className='invoice-modal-title-section'>
            <h2 className='invoice-modal-title'>Invoice</h2>
          </div>

          {/* Controls */}
          <div className='invoice-modal-controls'>
            {/* Action Controls */}
            <div className='invoice-control-group'>
              <button
                className='invoice-control-btn'
                onClick={downloadPDF}
                title='Download PDF'
              >
                <FaDownload />
                Download PDF
              </button>
            </div>

            {/* Close Button */}
            <button
              className='invoice-modal-close-btn'
              onClick={onClose}
              title='Close'
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className='invoice-modal-content'>
          <div className='invoice-content-wrapper'>
            <div className='invoice-content' ref={invoiceRef}>
              {/* Header */}
              <div className='invoice-header'>
                <div className='invoice-logo'>
                  <img src={digipalzLogo} alt='Digipalz' />
                </div>
                <div className='invoice-title'>
                  <h2>INVOICE</h2>
                </div>
              </div>

              {/* Invoice Details */}
              <div className='invoice-details'>
                <div className='invoice-info'>
                  <p>
                    <strong>Invoice #:</strong> {record.id}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(record.paymentDate)}
                  </p>
                </div>
                <div className='invoice-info'>
                  <p>
                    <strong>Stripe ID:</strong>{' '}
                    {record.stripeSessionId || 'N/A'}
                  </p>
                </div>

                <div className='customer-info'>
                  <p>
                    <strong>Bill To:</strong>{' '}
                    <span>{record.email || 'N/A'}</span>
                  </p>
                </div>
              </div>
              <div className='invoice-stipe-details'></div>

              {/* Items Table */}
              <div className='invoice-items'>
                <table className='invoice-table'>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Price/Month</th>
                      <th>Duration</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{record.planType?.toUpperCase() || 'N/A'} Plan</td>
                      <td>{record.numOfSeats || 'N/A'}</td>
                      <td>${getPricePerMonth(record.planType).toFixed(2)}</td>
                      <td>{MONTHS_PER_YEAR} months</td>
                      <td>
                        $
                        {calculateTableTotal(
                          record.planType,
                          record.numOfSeats
                        ).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className='invoice-totals'>
                <div className='totals-section'>
                  <div className='total-row'>
                    <span>Subtotal:</span>
                    <span>
                      $
                      {calculateTableTotal(
                        record.planType,
                        record.numOfSeats
                      ).toFixed(2)}
                    </span>
                  </div>
                  {record.discount && parseInt(record.discount) > 0 && (
                    <div className='total-row discount'>
                      <span>Discount ({record.discount}%):</span>
                      <span>
                        -
                        {formatCurrency((record.total * record.discount) / 100)}
                      </span>
                    </div>
                  )}
                  <div className='total-row table-total'>
                    <span>Table Total:</span>
                    <span>
                      $
                      {calculateTableTotal(
                        record.planType,
                        record.numOfSeats
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className='total-row actual-total'>
                    <span>ACTUAL TOTAL:</span>
                    <span>{formatCurrency(record.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className='invoice-status'>
                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`status-${
                      record.paymentStatus?.toLowerCase() || 'unknown'
                    }`}
                  >
                    {record.paymentStatus || 'N/A'}
                  </span>
                </p>
              </div>

              {/* Footer */}
              <div className='invoice-footer'>
                <p>Thank you for your business!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render the modal using Portal to ensure it's at the root level
  return ReactDOM.createPortal(modalContent, document.body)
}

export default InvoiceModal
