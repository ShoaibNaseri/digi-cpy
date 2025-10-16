import './AllQuizzes.css'
import { FaFilter, FaSearch } from 'react-icons/fa'
import QuizList from './QuizList'
import { useState } from 'react'

const AllQuizzes = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  return (
    <div className='all-quizzes'>
      <div className='all-quizzes-header'>
        <div>
          <h1>Published Quizzes</h1>
          <p>Manage and monitor your published quizzes</p>
        </div>
        <div className='all-quizzes-header-actions'>
          <div className='all-quizzes-header-actions-search'>
            <button>
              <FaSearch />
            </button>
            <input
              type='text'
              placeholder='Search quizzes...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className='filter-container'>
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
          </div>
        </div>
      </div>
      <QuizList searchQuery={searchQuery} statusFilter={statusFilter} />
    </div>
  )
}

export default AllQuizzes
