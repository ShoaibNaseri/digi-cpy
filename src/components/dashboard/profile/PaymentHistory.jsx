import './PaymentHistory.css'
import PaymentHistoryItem from './PaymentHistoryItem'

const PaymentHistory = () => {
  const paymentHistory = [
    {
      id: 1,
      type: 'Monthly Membership',
      date: 'Jan 1, 2025',
      amount: '$9.99'
    },
    {
      id: 2,
      type: 'Monthly Membership',
      date: 'Dec 1, 2024',
      amount: '$9.99'
    }
  ]

  return (
    <div className='payment-history'>
      <h1>Payment History</h1>
      <div className='payment-history__list'>
        {paymentHistory.map((payment) => (
          <PaymentHistoryItem
            key={payment.id}
            type={payment.type}
            date={payment.date}
            amount={payment.amount}
          />
        ))}
      </div>
    </div>
  )
}

export default PaymentHistory
