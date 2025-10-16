import './ProtectionPlan.css'
import { FaFilter, FaSearch } from 'react-icons/fa'
import PlanList from './PlanList'
import { useState } from 'react'
import ReportModal from './ReportModal'
import { useProtection } from '@/context/ProtectionContext'

const ProtectPlan = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { isModalOpen, openModal, closeModal, selectedDate } = useProtection()

  return (
    <div className='all-plans'>
      <div className='all-plans-header'>
        <div>
          <h1>Protection Plans</h1>
          <p>These are safety plans that only you can view.</p>
        </div>
        <div className='all-plans-header-actions'>
          <div className='all-plans-header-actions-search'>
            <button>
              <FaSearch />
            </button>
            <input
              type='text'
              placeholder='Search plans...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* <div className='filter-container'>
            <button onClick={() => setShowFilter(!showFilter)}>
              <FaFilter />
              <span>Filter</span>
            </button>
            {showFilter && (
              <div className='filter-popup'>
                <div className='filter-options'>
                  <h3>Filter by Status</h3>
                  <label>
                    <input
                      type='radio'
                      name='status'
                      value='all'
                      checked={statusFilter === 'all'}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    />
                    All Statuses
                  </label>
                  <label>
                    <input
                      type='radio'
                      name='status'
                      value='published'
                      checked={statusFilter === 'published'}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    />
                    Published
                  </label>
                  <label>
                    <input
                      type='radio'
                      name='status'
                      value='draft'
                      checked={statusFilter === 'draft'}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    />
                    Draft
                  </label>
                </div>
              </div>
            )}
          </div> */}
        </div>
      </div>
      <PlanList searchQuery={searchQuery} statusFilter={statusFilter} />
      <ReportModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedDate}
      />
    </div>
  )
}

export default ProtectPlan
