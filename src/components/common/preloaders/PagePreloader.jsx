import './PagePreloader.css'
import PageSpinner from './PageSpinner'
const PagePreloader = ({ color = '#ad29a5', textData = 'Loading...' }) => {
  return (
    <div className='page-preloader'>
      <PageSpinner color={color} />
      <div style={{ color: color }} className='page-preloader-text'>
        {textData}
      </div>
    </div>
  )
}

export default PagePreloader
