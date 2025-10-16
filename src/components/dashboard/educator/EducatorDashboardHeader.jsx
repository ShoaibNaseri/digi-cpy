import { FiSearch, FiBell, FiHelpCircle } from 'react-icons/fi'
import './EducatorDashboardHeader.css'

const EducatorDashboardHeader = () => (
  <header className='educator-dashboard-header'>
    <h1 className='educator-dashboard-header__title'>Dashboard</h1>
    <div className='educator-dashboard-header__actions'>
      <div className='educator-dashboard-header__search'>
        <FiSearch />
        <input type='text' placeholder='Search...' />
      </div>
      <FiBell className='educator-dashboard-header__icon' />
      <FiHelpCircle className='educator-dashboard-header__icon' />
    </div>
  </header>
)

export default EducatorDashboardHeader
