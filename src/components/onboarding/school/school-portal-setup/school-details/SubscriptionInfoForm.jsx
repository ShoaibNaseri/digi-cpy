import './SubscriptionInfoForm.css'

const SubscriptionInfoForm = ({ schoolInfo }) => {
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

  return (
    <div className='subscription-info'>
      <h1>Subscription Information</h1>
      <div className='subscription-info__content'>
        <div className='subscription-info__row'>
          <div className='subscription-info__column'>
            <div className='subscription-info__label--seats'>Licensed Seats</div>
            <div className='subscription-info__value--seats'>{schoolInfo?.numOfSeats || 'Purchased seats'}</div>
          </div>
          <div className='subscription-info__column'>
            <div className='subscription-info__label--renewal'>Renewal Date</div>
            <div className='subscription-info__value--renewal'>
              {formatDate(
                (() => {
                  let date
                  if (schoolInfo?.createdAt) {
                    if (typeof schoolInfo.createdAt.toDate === 'function') {
                      date = schoolInfo.createdAt.toDate()
                    } else if (
                      typeof schoolInfo.createdAt === 'string' ||
                      typeof schoolInfo.createdAt === 'number'
                    ) {
                      date = new Date(schoolInfo.createdAt)
                    } else if (schoolInfo.createdAt instanceof Date) {
                      date = schoolInfo.createdAt
                    }
                    if (date && !isNaN(date.getTime())) {
                      date.setFullYear(date.getFullYear() + 1)
                      return date
                    }
                  }
                  return null
                })()
              ) || 'Renewal Date'}
            </div>
          </div>
          <div className='subscription-info__column'>
            <div className='subscription-info__label--activation'>Activation Date</div>
            <div className='subscription-info__value--activation'>{formatDate(schoolInfo?.createdAt) || 'Activation Date'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionInfoForm
