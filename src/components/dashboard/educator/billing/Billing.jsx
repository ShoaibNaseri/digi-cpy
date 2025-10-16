import './Billing.css'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getSchoolInfo } from '@/services/adminService'
import { getPaymentRecord } from '@/services/paymentService'
import { useNavigate } from 'react-router-dom'
import PaymentRecordsTable from './PaymentRecordsTable'
import { FaUsers, FaClipboardList, FaRocket, FaSyncAlt } from 'react-icons/fa'
import PageHeader from '@/components/common/dashboard-header/common/PageHeader'
import useEducatorMenuItems from '@/hooks/useEducatorMenuItems.jsx'
const Billing = () => {
  const [schoolInfo, setSchoolInfo] = useState(null)
  const [paymentRecord, setPaymentRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const menuItems = useEducatorMenuItems()
  useEffect(() => {
    const fetchSchoolDetails = async () => {
      try {
        if (currentUser?.schoolId) {
          const info = await getSchoolInfo(currentUser.schoolId)
          setSchoolInfo(info)
        }
      } catch (err) {
        setError('Failed to load school details')
      } finally {
        setLoading(false)
      }
    }

    fetchSchoolDetails()
  }, [currentUser])
  const redirectToPlanOptions = () => {
    navigate('/school-plan-options')
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
      month: 'long',
      day: 'numeric'
    })
  }

  const getRenewalDate = (createdAt) => {
    if (!createdAt) return 'N/A'
    let date
    if (typeof createdAt.toDate === 'function') {
      date = createdAt.toDate()
    } else if (typeof createdAt === 'string' || typeof createdAt === 'number') {
      date = new Date(createdAt)
    } else if (createdAt instanceof Date) {
      date = createdAt
    }
    if (date && !isNaN(date.getTime())) {
      date.setFullYear(date.getFullYear() + 1)
      return formatDate(date)
    }
    return 'N/A'
  }
  console.log(schoolInfo)
  if (loading) {
    return (
      <div className='educator-school-details'>
        <p>Loading school details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='educator-school-details'>
        <p className='error-message'>{error}</p>
      </div>
    )
  }

  if (!schoolInfo) {
    return (
      <div className='educator-school-details'>
        <p>No school information available.</p>
      </div>
    )
  }

  return (
    <div className='educator-sdp-billing'>
      <PageHeader
        title='School Billing & Subscription'
        subtitle='Manage your subscription, billing information, and payment history'
        menuItems={menuItems}
      />
      <div className='educator-sdp-billing__section'>
        <div className='educator-sdp-billing__section-header'>
          <h2 className='educator-sdp-billing__section-title'>
            Active Purchase
          </h2>
          <button
            onClick={redirectToPlanOptions}
            className='educator-sdp-billing__edit-btn'
          >
            Purchase More Seats
          </button>
        </div>

        <div className='educator-sdp-billing__grid educator-sdp-billing__grid--view'>
          <div className='educator-sdp-billing__field'>
            <div className='educator-sdp-billing__field-icon'>
              <FaUsers size={18} />
            </div>
            <div className='educator-sdp-billing__field-content'>
              <span className='educator-sdp-billing__label'>
                Licensed Seats
              </span>
              <div className='educator-sdp-billing__value'>
                {schoolInfo.availableSeats || 'N/A'}
              </div>
            </div>
          </div>

          <div className='educator-sdp-billing__field'>
            <div className='educator-sdp-billing__field-icon'>
              <FaClipboardList size={18} />
            </div>
            <div className='educator-sdp-billing__field-content'>
              <span className='educator-sdp-billing__label'>Plan Type</span>
              <div className='educator-sdp-billing__value'>
                {paymentRecord?.planType?.toUpperCase() ||
                  schoolInfo.planType?.toUpperCase() ||
                  'N/A'}
              </div>
            </div>
          </div>

          <div className='educator-sdp-billing__field'>
            <div className='educator-sdp-billing__field-icon'>
              <FaRocket size={18} />
            </div>
            <div className='educator-sdp-billing__field-content'>
              <span className='educator-sdp-billing__label'>
                Activation Date
              </span>
              <div className='educator-sdp-billing__value'>
                {formatDate(paymentRecord?.createdAt || schoolInfo.createdAt)}
              </div>
            </div>
          </div>

          <div className='educator-sdp-billing__field'>
            <div className='educator-sdp-billing__field-icon'>
              <FaSyncAlt size={18} />
            </div>
            <div className='educator-sdp-billing__field-content'>
              <span className='educator-sdp-billing__label'>Renewal Date</span>
              <div className='educator-sdp-billing__value'>
                {getRenewalDate(
                  paymentRecord?.createdAt || schoolInfo.createdAt
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Records Table */}
      <div className='educator-sdp-billing__section'>
        <PaymentRecordsTable />
      </div>
    </div>
  )
}

export default Billing
