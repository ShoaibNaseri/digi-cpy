import './QuestionsForm.css'
import { useAdminQuizBuilder } from '../../../../context/AdminQuizBuilderContext'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import MultipleChoiceForm from './question-forms/MultipleChoiceForm'
import ConfidenceBasedForm from './question-forms/ConfidenceBasedForm'
import AgreeBasedForm from './question-forms/AgreeBasedForm'
import TextInputForm from './question-forms/TextInputForm'

const QuestionsForm = () => {
  const {
    setIsQuestionsFormOpen,
    quizData,
    setQuizData,
    editingQuestionIndex,
    setEditingQuestionIndex,
    QUIZ_TYPES
  } = useAdminQuizBuilder()

  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    confidenceLevels: [
      'Very Confident',
      'Confident',
      'Somewhat Confident',
      'Not Confident'
    ],
    agreeOptions: ['Strongly Agree', 'Agree', 'Disagree', 'Strongly Disagree'],
    expectedAnswer: '',
    explanation: ''
  })

  const [errors, setErrors] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    expectedAnswer: '',
    explanation: ''
  })

  useEffect(() => {
    if (editingQuestionIndex !== null) {
      const questionToEdit = quizData.questions[editingQuestionIndex]
      setFormData({
        question: questionToEdit.question || '',
        options: questionToEdit.options || ['', '', '', ''],
        correctAnswer: questionToEdit.correctAnswer || 0,
        confidenceLevels: questionToEdit.confidenceLevels || [
          'Very Confident',
          'Confident',
          'Somewhat Confident',
          'Not Confident'
        ],
        agreeOptions: questionToEdit.agreeOptions || [
          'Strongly Agree',
          'Agree',
          'Disagree',
          'Strongly Disagree'
        ],
        expectedAnswer: questionToEdit.expectedAnswer || '',
        explanation: questionToEdit.explanation || ''
      })

      setErrors({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        expectedAnswer: '',
        explanation: ''
      })
    }
  }, [editingQuestionIndex, quizData.questions])

  const validateQuestion = () => {
    const newErrors = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      expectedAnswer: '',
      explanation: ''
    }
    let isValid = true

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required'
      isValid = false
    }

    // Validation based on quiz type
    switch (quizData.quizType) {
      case QUIZ_TYPES.MULTIPLE_CHOICE:
        const emptyOptions = formData.options.filter((option) => !option.trim())
        if (emptyOptions.length > 0) {
          formData.options.forEach((option, index) => {
            if (!option.trim()) {
              newErrors.options[index] = 'Option is required'
            }
          })
          isValid = false
        }
        if (formData.options.length < 2) {
          newErrors.correctAnswer = 'At least 2 options are required'
          isValid = false
        }
        break

      case QUIZ_TYPES.CONFIDENCE_BASED:
        // No additional validation needed for confidence-based questions
        break

      case QUIZ_TYPES.AGREE_BASED:
        if (!formData.explanation.trim()) {
          newErrors.explanation = 'Explanation is required'
          isValid = false
        }
        break

      case QUIZ_TYPES.TEXT_INPUT:
        // No additional validation needed for text input questions
        break

      default:
        break
    }

    setErrors(newErrors)
    return isValid
  }

  const handleAddQuestion = () => {
    if (!validateQuestion()) {
      toast.error('Please fix the validation errors')
      return
    }

    let newQuestion = {
      question: formData.question,
      type: quizData.quizType
    }

    // Add type-specific data
    switch (quizData.quizType) {
      case QUIZ_TYPES.MULTIPLE_CHOICE:
        newQuestion = {
          ...newQuestion,
          options: formData.options,
          correctAnswer: formData.options[formData.correctAnswer]
        }
        break

      case QUIZ_TYPES.CONFIDENCE_BASED:
        // No additional data needed for confidence-based questions
        break

      case QUIZ_TYPES.AGREE_BASED:
        newQuestion = {
          ...newQuestion,
          options: formData.agreeOptions,
          explanation: formData.explanation
        }
        break

      case QUIZ_TYPES.TEXT_INPUT:
        // No additional data needed for text input questions
        break

      default:
        break
    }

    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...quizData.questions]
      updatedQuestions[editingQuestionIndex] = newQuestion
      setQuizData({
        ...quizData,
        questions: updatedQuestions
      })
      setEditingQuestionIndex(null)
    } else {
      setQuizData({
        ...quizData,
        questions: [...quizData.questions, newQuestion]
      })
    }

    // Reset form
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      confidenceLevels: [
        'Very Confident',
        'Confident',
        'Somewhat Confident',
        'Not Confident'
      ],
      agreeOptions: [
        'Strongly Agree',
        'Agree',
        'Disagree',
        'Strongly Disagree'
      ],
      expectedAnswer: '',
      explanation: ''
    })
    setErrors({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      expectedAnswer: '',
      explanation: ''
    })
    setIsQuestionsFormOpen(false)
  }

  const renderQuestionForm = () => {
    switch (quizData.quizType) {
      case QUIZ_TYPES.MULTIPLE_CHOICE:
        return (
          <MultipleChoiceForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        )
      case QUIZ_TYPES.CONFIDENCE_BASED:
        return (
          <ConfidenceBasedForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        )
      case QUIZ_TYPES.AGREE_BASED:
        return (
          <AgreeBasedForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        )
      case QUIZ_TYPES.TEXT_INPUT:
        return (
          <TextInputForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        )
      default:
        return <div>Please select a quiz type</div>
    }
  }

  return (
    <div className='questions-form'>
      <div className='questions-form__header'>
        <h3 className='questions-form__title'>
          {editingQuestionIndex !== null
            ? `Edit Question ${editingQuestionIndex + 1}`
            : `Question ${quizData.questions.length + 1}`}
        </h3>
        <div className='questions-form__btn-container'>
          <button
            className='questions-form__btn-add-question'
            onClick={handleAddQuestion}
          >
            {editingQuestionIndex !== null
              ? 'Update Question'
              : 'Save Question'}
          </button>
        </div>
      </div>

      <div className='questions-form__group'>
        <textarea
          type='text'
          id='question'
          placeholder='Enter your question'
          rows={3}
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          className={errors.question ? 'error' : ''}
        />
        {errors.question && (
          <span className='error-message'>{errors.question}</span>
        )}
      </div>

      {renderQuestionForm()}
    </div>
  )
}

export default QuestionsForm
