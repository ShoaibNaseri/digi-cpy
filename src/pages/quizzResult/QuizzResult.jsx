import { useEffect, useState } from 'react'
import { db } from '@/firebase/config'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore'
import './quizzresult.css'

const QuizzResult = () => {
  const [quizResults, setQuizResults] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState([])
  const [postConfidenceQuizzes, setPostConfidenceQuizzes] = useState([])
  const [regularQuizzes, setRegularQuizzes] = useState([])
  const [answerStats, setAnswerStats] = useState({})
  const [questionBreakdown, setQuestionBreakdown] = useState([])

  const calculateAnalytics = (data) => {
    const quizTypeStats = {}

    data.forEach((item) => {
      const quizTitle = item.quiz?.quizTitle || 'Unknown Quiz'
      const score = item.quiz?.score
      const totalQuestions = item.quiz?.currentQuestionIndex
        ? item.quiz.currentQuestionIndex + 1
        : 0

      if (!quizTypeStats[quizTitle]) {
        quizTypeStats[quizTitle] = {
          title: quizTitle,
          studentCount: 0,
          scores: [],
          totalQuestions: totalQuestions,
          completedQuizzes: 0
        }
      }

      quizTypeStats[quizTitle].studentCount++

      if (score !== undefined && score !== null) {
        quizTypeStats[quizTitle].scores.push(score)
        quizTypeStats[quizTitle].completedQuizzes++
      }
    })

    // Calculate analytics for each quiz type
    const analyticsData = Object.values(quizTypeStats).map((stat) => {
      const scores = stat.scores
      const avgScore =
        scores.length > 0
          ? (
              scores.reduce((sum, score) => sum + score, 0) / scores.length
            ).toFixed(1)
          : 0
      const maxScore = scores.length > 0 ? Math.max(...scores) : 0
      const minScore = scores.length > 0 ? Math.min(...scores) : 0
      const completionRate =
        stat.studentCount > 0
          ? ((stat.completedQuizzes / stat.studentCount) * 100).toFixed(1)
          : 0

      return {
        title: stat.title,
        studentCount: stat.studentCount,
        avgScore: parseFloat(avgScore),
        maxScore,
        minScore,
        completionRate: parseFloat(completionRate),
        totalQuestions: stat.totalQuestions
      }
    })

    return analyticsData.sort((a, b) => b.studentCount - a.studentCount)
  }

  const analyzePostConfidenceAnswers = (postConfidenceData) => {
    const answerCounts = {
      'Not Confident': 0,
      'A Little Confident': 0,
      'Somewhat Confident': 0,
      'Very Confident': 0
    }

    let totalAnswers = 0

    postConfidenceData.forEach((item, index) => {
      // Access answers as an object
      const answers = item.quiz?.answers

      if (answers && typeof answers === 'object' && !Array.isArray(answers)) {
        // Convert object values to array and process each answer
        const answerValues = Object.values(answers)

        answerValues.forEach((answerValue, answerIndex) => {
          totalAnswers++

          // Normalize the answer value
          const normalizedAnswer = answerValue.toString().toLowerCase().trim()

          // Match confidence levels
          if (normalizedAnswer.includes('not confident')) {
            answerCounts['Not Confident']++
          } else if (normalizedAnswer.includes('a little confident')) {
            answerCounts['A Little Confident']++
          } else if (normalizedAnswer.includes('somewhat confident')) {
            answerCounts['Somewhat Confident']++
          } else if (normalizedAnswer.includes('very confident')) {
            answerCounts['Very Confident']++
          } else {
          }
        })
      } else {
      }
    })

    // Calculate percentages
    const answerStats = {}
    Object.keys(answerCounts).forEach((key) => {
      answerStats[key] = {
        count: answerCounts[key],
        percentage:
          totalAnswers > 0
            ? ((answerCounts[key] / totalAnswers) * 100).toFixed(1)
            : 0
      }
    })

    return answerStats
  }

  // Function to analyze individual student answers
  const getStudentAnswerCounts = (studentQuiz) => {
    const answerCounts = {
      notConfident: 0,
      littleConfident: 0,
      somewhatConfident: 0,
      veryConfident: 0
    }

    // Access answers as an object
    const answers = studentQuiz.quiz?.answers

    if (answers && typeof answers === 'object' && !Array.isArray(answers)) {
      // Convert object values to array and process each answer
      const answerValues = Object.values(answers)

      answerValues.forEach((answerValue) => {
        // Normalize the answer value
        const normalizedAnswer = answerValue.toString().toLowerCase().trim()

        if (normalizedAnswer.includes('not confident')) {
          answerCounts.notConfident++
        } else if (normalizedAnswer.includes('a little confident')) {
          answerCounts.littleConfident++
        } else if (normalizedAnswer.includes('somewhat confident')) {
          answerCounts.somewhatConfident++
        } else if (normalizedAnswer.includes('very confident')) {
          answerCounts.veryConfident++
        }
      })
    } else {
    }

    return answerCounts
  }

  // Function to analyze answers by question
  const analyzeQuestionBreakdown = async (postConfidenceData) => {
    if (postConfidenceData.length === 0) {
      return []
    }

    // Get questions from the first post confidence quiz (they should all have the same questions)
    const firstQuiz = postConfidenceData[0]
    const questions = firstQuiz.quiz?.questions

    if (!questions || !Array.isArray(questions)) {
      return []
    }

    // Initialize question stats for each question
    const questionStats = []

    questions.forEach((question, index) => {
      questionStats.push({
        questionNumber: index + 1,
        questionText: question.question,
        options: question.options || [],
        optionA: 0,
        optionB: 0,
        optionC: 0,
        optionD: 0,
        total: 0
      })
    })

    // Process each student's answers
    postConfidenceData.forEach((item, itemIndex) => {
      const answers = item.quiz?.answers
      const studentName =
        item.user?.firstName || item.user?.displayName || 'Unknown'

      if (answers && typeof answers === 'object' && !Array.isArray(answers)) {
        Object.entries(answers).forEach(([questionIndex, answerValue]) => {
          const qIndex = parseInt(questionIndex)
          const normalizedAnswer = answerValue.toString().toLowerCase().trim()

          if (qIndex < questionStats.length) {
            const questionStat = questionStats[qIndex]
            const questionOptions = questionStat.options

            questionStat.total++

            // Map confidence level to option letter
            // We need to find which option matches the confidence level
            let optionIndex = -1
            for (let i = 0; i < questionOptions.length; i++) {
              const optionText = questionOptions[i]
                .toString()
                .toLowerCase()
                .trim()
              if (
                optionText.includes(normalizedAnswer) ||
                normalizedAnswer.includes(optionText)
              ) {
                optionIndex = i
                break
              }
            }

            // If direct match not found, try to map by confidence level patterns
            if (optionIndex === -1) {
              if (normalizedAnswer.includes('not confident')) {
                optionIndex = 0 // Usually option A
              } else if (normalizedAnswer.includes('a little confident')) {
                optionIndex = 1 // Usually option B
              } else if (normalizedAnswer.includes('somewhat confident')) {
                optionIndex = 2 // Usually option C
              } else if (normalizedAnswer.includes('very confident')) {
                optionIndex = 3 // Usually option D
              }
            }

            // Count the option
            switch (optionIndex) {
              case 0:
                questionStat.optionA++
                break
              case 1:
                questionStat.optionB++
                break
              case 2:
                questionStat.optionC++
                break
              case 3:
                questionStat.optionD++
                break
              default:
            }
          }
        })
      }
    })

    return questionStats
  }

  const fetchStudentQuizzesWithUserData = async () => {
    try {
      setLoading(true)
      const schoolId = 'alskdjflsdf232'

      // Query studentQuizzes collection filtered by schoolId
      const studentQuizzesRef = collection(db, 'studentQuizzes')
      const q = query(studentQuizzesRef, where('schoolId', '==', schoolId))
      const querySnapshot = await getDocs(q)

      const studentQuizzesWithUserData = []

      // For each studentQuiz, fetch the corresponding user data and quiz data
      for (const docSnapshot of querySnapshot.docs) {
        const quizData = { id: docSnapshot.id, ...docSnapshot.data() }

        // Fetch user data using studentId
        let userData = null
        if (quizData.studentId) {
          const userRef = doc(db, 'users', quizData.studentId)
          const userDoc = await getDoc(userRef)
          userData = userDoc.exists() ? userDoc.data() : null
        }

        // Fetch original quiz data using originalQuizzId
        let originalQuizData = null
        if (quizData.originalQuizzId) {
          const quizRef = doc(db, 'quizzes', quizData.originalQuizzId)
          const quizDoc = await getDoc(quizRef)
          originalQuizData = quizDoc.exists() ? quizDoc.data() : null
        }

        studentQuizzesWithUserData.push({
          quiz: quizData,
          user: userData,
          originalQuiz: originalQuizData,
          quizTitle: originalQuizData?.quizTitle || 'No title found'
        })
      }

      // Separate quizzes by type
      const postConfidence = studentQuizzesWithUserData.filter(
        (item) =>
          item.quiz?.quizTitle?.toLowerCase().includes('post confidence') ||
          item.quizTitle?.toLowerCase().includes('post confidence')
      )

      const regular = studentQuizzesWithUserData.filter(
        (item) =>
          !item.quiz?.quizTitle?.toLowerCase().includes('post confidence') &&
          !item.quizTitle?.toLowerCase().includes('post confidence')
      )

      setQuizResults(studentQuizzesWithUserData)
      setFilteredResults(studentQuizzesWithUserData)
      setPostConfidenceQuizzes(postConfidence)
      setRegularQuizzes(regular)

      // Analyze post confidence answers
      const postConfidenceAnswerStats =
        analyzePostConfidenceAnswers(postConfidence)
      setAnswerStats(postConfidenceAnswerStats)

      // Analyze question breakdown

      try {
        const questionBreakdownData = await analyzeQuestionBreakdown(
          postConfidence
        )

        setQuestionBreakdown(questionBreakdownData)
      } catch (error) {
        console.error('Error analyzing question breakdown:', error)
        setQuestionBreakdown([])
      }

      // Calculate analytics for all quiz attempts
      const analyticsData = calculateAnalytics(studentQuizzesWithUserData)
      setAnalytics(analyticsData)

      return studentQuizzesWithUserData
    } catch (error) {
      console.error('Error fetching student quizzes with user data:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentQuizzesWithUserData()
  }, [])

  useEffect(() => {
    const filtered = quizResults.filter((item) => {
      const userName = item.user?.firstName || item.user?.displayName || ''
      const userEmail = item.user?.email || ''
      const quizTitle = item.quiz?.quizTitle || ''

      return (
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    setFilteredResults(filtered)
  }, [searchTerm, quizResults])

  // Get unique student count for display
  const getUniqueStudentCount = (data) => {
    const uniqueStudents = new Set()
    data.forEach((item) => {
      const studentId = item.quiz?.studentId
      const studentName =
        item.user?.firstName || item.user?.displayName || 'N/A'
      const uniqueKey = studentId || studentName.toLowerCase()
      uniqueStudents.add(uniqueKey)
    })
    return uniqueStudents.size
  }

  // Filter data by search term for each quiz type
  const getFilteredDataByType = (data) => {
    return data.filter((item) => {
      const userName = item.user?.firstName || item.user?.displayName || ''
      const userEmail = item.user?.email || ''
      const quizTitle = item.quiz?.quizTitle || ''

      return (
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }

  const filteredPostConfidence = getFilteredDataByType(postConfidenceQuizzes)
  const filteredRegular = getFilteredDataByType(regularQuizzes)

  return (
    <div className='quiz-results-container'>
      <div className='results-header'>
        <h1>Quiz Results</h1>
        <div className='search-container'>
          <input
            type='text'
            placeholder='Search by name, email, or quiz title...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='search-input'
          />
        </div>
      </div>

      {loading ? (
        <div className='loading'>Loading quiz results...</div>
      ) : (
        <>
          <div className='results-count'>
            <span className='count-text'>
              {searchTerm
                ? `Showing ${filteredResults.length} of ${
                    quizResults.length
                  } quiz attempts | ${getUniqueStudentCount(
                    filteredResults
                  )} unique students`
                : `Total Quiz Attempts: ${
                    quizResults.length
                  } | Unique Students: ${getUniqueStudentCount(quizResults)}`}
            </span>
          </div>

          {/* Regular Quizzes Table */}
          {filteredRegular.length > 0 && (
            <div className='quiz-section'>
              <h2 className='quiz-section-title'>
                Cyberbullying Awareness Post -Test
              </h2>
              <div className='table-container'>
                <table className='results-table'>
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Quiz Title</th>
                      <th>Total Questions</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegular.map((item, index) => (
                      <tr key={item.quiz.id || index}>
                        <td className='row-number'>{index + 1}</td>
                        <td>
                          {item.user?.firstName ||
                            item.user?.displayName ||
                            'N/A'}
                        </td>
                        <td>{item.user?.email || 'N/A'}</td>
                        <td>{item.quiz?.quizTitle}</td>
                        <td>
                          {item.quiz.currentQuestionIndex
                            ? item.quiz.currentQuestionIndex + 1
                            : 'N/A'}
                        </td>
                        <td>
                          <span className='score'>
                            {item.quiz.score !== undefined
                              ? item.quiz.score
                              : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h2 className='quiz-section-title'>Post Confidence Quizzes</h2>
              <div className='table-container'>
                <table className='results-table'>
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Quiz Title</th>
                      <th>Total Questions</th>
                      <th>Not Confident</th>
                      <th>A Little Confident</th>
                      <th>Somewhat Confident</th>
                      <th>Very Confident</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPostConfidence.map((item, index) => {
                      const answerCounts = getStudentAnswerCounts(item)
                      return (
                        <tr key={item.quiz.id || index}>
                          <td className='row-number'>{index + 1}</td>
                          <td>
                            {item.user?.firstName ||
                              item.user?.displayName ||
                              'N/A'}
                          </td>
                          <td>{item.user?.email || 'N/A'}</td>
                          <td>{item.quiz?.quizTitle}</td>
                          <td>
                            {item.quiz.currentQuestionIndex
                              ? item.quiz.currentQuestionIndex + 1
                              : 'N/A'}
                          </td>
                          <td>
                            <span className='answer-count-badge not-confident'>
                              {answerCounts.notConfident}
                            </span>
                          </td>
                          <td>
                            <span className='answer-count-badge little-confident'>
                              {answerCounts.littleConfident}
                            </span>
                          </td>
                          <td>
                            <span className='answer-count-badge somewhat-confident'>
                              {answerCounts.somewhatConfident}
                            </span>
                          </td>
                          <td>
                            <span className='answer-count-badge very-confident'>
                              {answerCounts.veryConfident}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Post Confidence Quizzes Table */}
          {filteredPostConfidence.length > 0 && (
            <div className='quiz-section'>
              <h2 className='quiz-section-title'>Post Confidence Quizzes</h2>

              {/* Answer Statistics */}
              <div className='answer-stats-container'>
                <h3 className='answer-stats-title'>
                  Confidence Level Statistics
                </h3>
                <div className='answer-stats-grid'>
                  {Object.entries(answerStats).map(([answerType, stats]) => (
                    <div key={answerType} className='answer-stat-card'>
                      <div className='answer-type'>{answerType}</div>
                      <div className='answer-count'>{stats.count} times</div>
                      <div className='answer-percentage'>
                        {stats.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Breakdown Table */}
              {questionBreakdown.length > 0 && (
                <div className='question-breakdown-container'>
                  <h3 className='question-breakdown-title'>
                    Question-by-Question Breakdown
                  </h3>
                  <div className='table-container'>
                    <table className='results-table question-breakdown-table'>
                      <thead>
                        <tr>
                          <th>Q#</th>
                          <th>Question</th>
                          <th>Not Confident</th>
                          <th>A Little Confident</th>
                          <th>Somewhat Confident</th>
                          <th>Very Confident</th>
                          <th>Total Responses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questionBreakdown.map((question, index) => (
                          <tr key={index}>
                            <td className='question-number'>
                              {question.questionNumber}
                            </td>
                            <td className='question-text'>
                              {question.questionText}
                            </td>
                            <td>
                              <span className='answer-count-badge not-confident'>
                                {question.optionA}
                              </span>
                            </td>
                            <td>
                              <span className='answer-count-badge little-confident'>
                                {question.optionB}
                              </span>
                            </td>
                            <td>
                              <span className='answer-count-badge somewhat-confident'>
                                {question.optionC}
                              </span>
                            </td>
                            <td>
                              <span className='answer-count-badge very-confident'>
                                {question.optionD}
                              </span>
                            </td>
                            <td className='total-responses'>
                              {question.total}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Debug info */}
              {/* <div
                style={{
                  padding: '10px',
                  background: '#f0f0f0',
                  margin: '10px 0',
                  fontSize: '12px'
                }}
              >
                <strong>DEBUG INFO:</strong>
                <br />
                Post Confidence Quizzes Count: {filteredPostConfidence.length}
                <br />
                Question Breakdown Count: {questionBreakdown.length}
                <br />
                Question Breakdown Data:{' '}
                {JSON.stringify(questionBreakdown, null, 2)}
              </div> */}
            </div>
          )}

          {/* Show message if no results after filtering */}
          {filteredRegular.length === 0 &&
            filteredPostConfidence.length === 0 &&
            searchTerm && (
              <div className='no-results-section'>
                <p>No results found matching your search.</p>
              </div>
            )}

          {/* Analytics Section */}
          <div className='analytics-section'>
            <h2 className='analytics-title'>Quiz Analytics by Type</h2>
            <div className='analytics-grid'>
              {analytics.map((stat, index) => (
                <div key={index} className='analytics-card'>
                  <div className='card-header'>
                    <h3 className='quiz-type-title'>{stat.title}</h3>
                  </div>
                  <div className='card-content'>
                    <div className='stat-row'>
                      <span className='stat-label'>Quiz Attempts:</span>
                      <span className='stat-value'>{stat.studentCount}</span>
                    </div>
                    <div className='stat-row'>
                      <span className='stat-label'>Average Score:</span>
                      <span className='stat-value score-avg'>
                        {stat.avgScore}
                      </span>
                    </div>
                    <div className='stat-row'>
                      <span className='stat-label'>Completion Rate:</span>
                      <span className='stat-value completion-rate'>
                        {stat.completionRate}%
                      </span>
                    </div>
                    <div className='stat-row'>
                      <span className='stat-label'>Highest Score:</span>
                      <span className='stat-value score-high'>
                        {stat.maxScore}
                      </span>
                    </div>
                    <div className='stat-row'>
                      <span className='stat-label'>Lowest Score:</span>
                      <span className='stat-value score-low'>
                        {stat.minScore}
                      </span>
                    </div>
                    <div className='stat-row'>
                      <span className='stat-label'>Total Questions:</span>
                      <span className='stat-value'>{stat.totalQuestions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default QuizzResult
