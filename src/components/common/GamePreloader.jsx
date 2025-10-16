import './GamePreloader.css'

const LoadingIndicator = ({ content = 'Loading...', isLoading = true }) => {
  if (!isLoading) return null

  return (
    <div className='loading-indicator'>
      <div className='loading-content'>
        <div className='loading-spinner'></div>
        <span className='loading-text'>{content}</span>
      </div>
    </div>
  )
}

export default LoadingIndicator
