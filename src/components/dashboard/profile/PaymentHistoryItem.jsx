import { FaDownload } from 'react-icons/fa6'
import './PaymentHistoryItem.css'

const PaymentHistoryItem = ({ type, date, amount }) => {
  return (
    <div className='history-item'>
      <div className='history-item__content'>
        <p className='history-item__type'>{type}</p>
        <p className='history-item__date'>{date}</p>
      </div>
      <div className='history-item__amount-container'>
        <p className='history-item__amount'>{amount}</p>
        <button>
          {/* <img src={icons.downloadButtonIcon} alt='download' /> */}
          <FaDownload size={16} color='#374151' />
        </button>
      </div>
    </div>
  )
}

export default PaymentHistoryItem
