import QuizBuilderActionButtons from './QuizBuilderActionButtons'
import QuestionsForm from './QuestionsForm'
import QuestionsList from './QuestionsList'
import './QuizForm.css'
import { useAdminQuizBuilder } from '@/context/AdminQuizBuilderContext'
import { useState } from 'react'
import { FaRegCalendarAlt, FaChevronDown } from 'react-icons/fa'
import { getAllMissions } from '@/utils/jsnMissions'

const missionList = getAllMissions()

const QuizForm = () => {
  const {
    isQuestionsFormOpen,
    quizData,
    setQuizData,
    QUIZ_TYPES,
    QUIZ_TYPE_LABELS
  } = useAdminQuizBuilder()
  const [errors, setErrors] = useState({
    quizTitle: '',
    quizDuration: '',
    quizPassingScore: '',
    dueDate: '',
    mission: '',
    quizType: ''
  })

  const validateQuizData = () => {
    const newErrors = {
      quizTitle: '',
      quizDuration: '',
      quizPassingScore: '',
      dueDate: '',
      mission: '',
      quizType: ''
    }

    if (!quizData.quizTitle.trim()) {
      newErrors.quizTitle = 'Quiz title is required'
    }

    if (!quizData.mission) {
      newErrors.mission = 'Mission is required'
    }

    if (!quizData.quizType) {
      newErrors.quizType = 'Quiz type is required'
    }

    if (!quizData.quizDuration.trim()) {
      newErrors.quizDuration = 'Quiz duration is required'
    } else if (
      isNaN(quizData.quizDuration) ||
      parseInt(quizData.quizDuration) <= 0
    ) {
      newErrors.quizDuration = 'Quiz duration must be a positive number'
    }

    if (quizData.quizType === QUIZ_TYPES.MULTIPLE_CHOICE) {
      if (!quizData.quizPassingScore.trim()) {
        newErrors.quizPassingScore = 'Passing score is required'
      } else if (
        isNaN(quizData.quizPassingScore) ||
        parseInt(quizData.quizPassingScore) < 0 ||
        parseInt(quizData.quizPassingScore) > 100
      ) {
        newErrors.quizPassingScore = 'Passing score must be between 0 and 100'
      }
    }

    if (!quizData.dueDate.trim()) {
      newErrors.dueDate = 'Due date is required'
    }

    setErrors(newErrors)
    return Object.values(newErrors).every((error) => !error)
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    let updatedData = { ...quizData, [id]: value }

    // If mission is being changed, also save the mission title
    if (id === 'mission') {
      const selectedMission = missionList.find(
        (mission) => mission.id.toString() === value
      )
      if (selectedMission) {
        updatedData = {
          ...updatedData,
          mission: value,
          missionTitle: selectedMission.title
        }
      }
    }

    setQuizData(updatedData)

    if (errors[id]) {
      setErrors({ ...errors, [id]: '' })
    }
  }

  return (
    <div className='quiz-form'>
      <div className='quiz-form__group'>
        <label htmlFor='quizTitle' className='quiz-form__label'>
          Quiz Titles
        </label>
        <input
          type='text'
          id='quizTitle'
          placeholder='Quiz Title'
          value={quizData.quizTitle || ''}
          onChange={handleChange}
          className={errors.quizTitle ? 'error' : ''}
        />
        {errors.quizTitle && (
          <span className='error-message'>{errors.quizTitle}</span>
        )}
      </div>

      <div className='quiz-form__group'>
        <label htmlFor='quizType' className='quiz-form__label'>
          Quiz Type
        </label>
        <div className='quiz-form__select-wrapper'>
          <select
            id='quizType'
            value={quizData.quizType || ''}
            onChange={handleChange}
            className={errors.quizType ? 'error' : ''}
          >
            <option value=''>Select quiz type</option>
            {Object.entries(QUIZ_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FaChevronDown className='quiz-form__select-icon' />
        </div>
        {errors.quizType && (
          <span className='error-message'>{errors.quizType}</span>
        )}
      </div>

      <div className='quiz-form__group-bottom'>
        <div className='quiz-form__group'>
          <label htmlFor='quizDuration' className='quiz-form__label'>
            Quiz Duration
          </label>
          <input
            type='text'
            id='quizDuration'
            placeholder='Quiz Duration (minutes)'
            value={quizData.quizDuration || ''}
            onChange={handleChange}
            className={errors.quizDuration ? 'error' : ''}
          />
          {errors.quizDuration && (
            <span className='error-message'>{errors.quizDuration}</span>
          )}
        </div>
        {quizData.quizType === QUIZ_TYPES.MULTIPLE_CHOICE && (
          <div className='quiz-form__group'>
            <label htmlFor='quizPassingScore' className='quiz-form__label'>
              Passing Score
            </label>
            <input
              type='text'
              id='quizPassingScore'
              placeholder='Passing Score %'
              value={quizData.quizPassingScore || ''}
              onChange={handleChange}
              className={errors.quizPassingScore ? 'error' : ''}
            />
            {errors.quizPassingScore && (
              <span className='error-message'>{errors.quizPassingScore}</span>
            )}
          </div>
        )}
        <div className='quiz-form__group'>
          <label htmlFor='dueDate' className='quiz-form__label'>
            Due Date
          </label>
          <div className='quiz-form__date-input-wrapper'>
            <input
              type='date'
              id='dueDate'
              placeholder='Due Date'
              value={quizData.dueDate || ''}
              onChange={handleChange}
              className={errors.dueDate ? 'error' : ''}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <FaRegCalendarAlt className='calendar-icon' />
          </div>
          {errors.dueDate && (
            <span className='error-message'>{errors.dueDate}</span>
          )}
        </div>
        <div className='quiz-form__group'>
          <label htmlFor='mission' className='quiz-form__label'>
            Mission
          </label>
          <div className='quiz-form__select-wrapper'>
            <select
              id='mission'
              value={quizData.mission || ''}
              onChange={handleChange}
              className={errors.mission ? 'error' : ''}
            >
              <option value=''>Select a mission</option>
              {missionList.map((mission) => (
                <option key={mission.id} value={mission.id}>
                  {mission.title}
                </option>
              ))}
            </select>
            <FaChevronDown className='quiz-form__select-icon' />
          </div>
          {errors.mission && (
            <span className='error-message'>{errors.mission}</span>
          )}
        </div>
      </div>
      {isQuestionsFormOpen && <QuestionsForm />}
      <QuizBuilderActionButtons validateQuizData={validateQuizData} />
      {quizData && quizData.questions.length > 0 && <QuestionsList />}
    </div>
  )
}

export default QuizForm
