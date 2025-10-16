import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { quizService } from '../../../../services/quizService'
import QuizCard from './QuizCard'
import './QuizList.css'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

const QUIZZES_PER_PAGE = 6

const QuizList = ({ searchQuery, statusFilter }) => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSnapshots, setPageSnapshots] = useState({})
  const [allQuizzes, setAllQuizzes] = useState([])
  const [isFiltering, setIsFiltering] = useState(false)
  const navigate = useNavigate()

  const fetchAllQuizzes = async () => {
    try {
      setLoading(true)
      const fetchedQuizzes = await quizService.getAllQuizzes()
      setAllQuizzes(fetchedQuizzes)
      return fetchedQuizzes
    } catch (error) {
      console.error('Error fetching all quizzes:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const fetchQuizzes = async (page) => {
    try {
      setLoading(true)
      const lastVisible = pageSnapshots[page - 1]

      if (page !== 1 && !lastVisible) {
        await fetchPage(1)
        return
      }

      const { quizzes: fetchedQuizzes, lastVisible: lastVisibleDoc } =
        await quizService.getQuizzesByPage(page, lastVisible)

      setPageSnapshots((prev) => ({
        ...prev,
        [page]: lastVisibleDoc
      }))

      setQuizzes(fetchedQuizzes)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPage = async (page) => {
    if (page < 1 || page > totalPages) return
    await fetchQuizzes(page)
  }

  const filterQuizzes = useCallback(async () => {
    if (!searchQuery && statusFilter === 'all') {
      setIsFiltering(false)
      await fetchPage(1)
      return
    }

    setIsFiltering(true)
    const quizzesToSearch =
      allQuizzes.length > 0 ? allQuizzes : await fetchAllQuizzes()

    const filtered = quizService.filterQuizzes(
      quizzesToSearch,
      searchQuery,
      statusFilter
    )
    setQuizzes(filtered)
  }, [searchQuery, statusFilter, allQuizzes])

  useEffect(() => {
    const initializePagination = async () => {
      const total = await quizService.getTotalPages()
      setTotalPages(total)
      fetchPage(1)
    }

    initializePagination()
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      filterQuizzes()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, statusFilter, filterQuizzes])

  const handleEdit = (quizId) => {
    navigate(`/dashboard/admin/quiz-builder/${quizId}`)
  }

  const handleToggleRetry = async (quizId, currentValue) => {
    try {
      await quizService.updateQuizRetryStatus(quizId, !currentValue)

      setQuizzes(
        quizzes.map((quiz) =>
          quiz.id === quizId
            ? { ...quiz, canUserRetryQuiz: !currentValue }
            : quiz
        )
      )

      toast.success(
        `Retry ${!currentValue ? 'enabled' : 'disabled'} for this quiz`
      )
    } catch (error) {
      console.error('Error updating quiz retry setting:', error)
      toast.error('Failed to update retry setting')
    }
  }

  const handleDelete = async (quizId) => {
    try {
      await quizService.deleteQuiz(quizId)

      // Update the local state to remove the deleted quiz
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId))
      setAllQuizzes(allQuizzes.filter((quiz) => quiz.id !== quizId))

      // Refresh the total pages count
      const total = await quizService.getTotalPages()
      setTotalPages(total)

      // If the current page is now empty and it's not the first page,
      // go to the previous page
      if (quizzes.length === 1 && currentPage > 1) {
        await fetchPage(currentPage - 1)
      } else if (quizzes.length === 1) {
        // If we're on the first page and it's empty, refresh
        await fetchPage(1)
      }

      toast.success('Quiz deleted successfully')
    } catch (error) {
      console.error('Error deleting quiz:', error)
      toast.error('Failed to delete quiz')
    }
  }

  if (loading && quizzes.length === 0) {
    return <div className='loading'>Loading quizzes...</div>
  }

  return (
    <div className='quiz-list-container'>
      <div className='quiz-grid'>
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            id={quiz.id}
            title={quiz.quizTitle}
            duration={quiz.quizDuration}
            questions={quiz.questions?.length || 0}
            status={quiz.status}
            canUserRetryQuiz={quiz.canUserRetryQuiz || false}
            onEdit={() => handleEdit(quiz.id)}
            onToggleRetry={() =>
              handleToggleRetry(quiz.id, quiz.canUserRetryQuiz || false)
            }
            onDelete={handleDelete}
          />
        ))}
      </div>

      {!isFiltering && (
        <div className='pagination'>
          <button
            className='pagination-button'
            onClick={() => fetchPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaArrowLeft />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pagination-button ${
                currentPage === page ? 'active' : ''
              }`}
              onClick={() => fetchPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className='pagination-button'
            onClick={() => fetchPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaArrowRight />
          </button>
        </div>
      )}
    </div>
  )
}

export default QuizList
