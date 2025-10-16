import './ActionLoadingIndicator.css'

const ActionLoadingIndicator = ({ message = 'Loading...' }) => {
  return (
    <div className='action-loading-indicator'>
      <div className='action-loading-spinner'></div>
      <p className='action-loading-text'>{message}</p>
    </div>
  )
}

export default ActionLoadingIndicator
