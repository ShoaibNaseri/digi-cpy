import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaClock,
  FaChartLine,
  FaChartBar,
  FaUsers
} from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { getUserMonthlyStats } from '@/services/adminService'
import {
  getSchoolAnalytics,
  getHistoricalTimeData,
  formatTimeToHoursMinutes
} from '@/services/school_admin/schoolAnalyticService'
import { useAuth } from '@/context/AuthContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import './EducatorDashboardStats.css'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const EducatorDashboardStats = () => {
  const [stats, setStats] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartFilter, setChartFilter] = useState('week') // day, week, month
  const [timeUnit, setTimeUnit] = useState('minutes') // minutes, hours
  const [historicalData, setHistoricalData] = useState(null)
  const [chartLoading, setChartLoading] = useState(false)
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Fetch both monthly stats and analytics
        const [monthlyData, analyticsData] = await Promise.all([
          getUserMonthlyStats(currentUser.schoolId),
          getSchoolAnalytics(currentUser.schoolId)
        ])

        setAnalytics(analyticsData)

        setStats([
          {
            label: 'School Engagement',
            value: analyticsData.school.engagementRate.toFixed(1) + '%',
            icon: <FaChartLine />,
            change: `${analyticsData.school.activeUsers}`,
            changeText: 'active users',
            up: analyticsData.school.totalTimeSpent > 0
          },
          // School Overview Cards
          {
            label: 'Total Students',
            value: analyticsData.totalStudents.toString(),
            icon: <FaUserGraduate />,
            change: `${analyticsData.students.activeUsers}/${analyticsData.students.userCount}`,
            changeText: 'active students',
            up: analyticsData.students.activeUsers > 0
          },
          {
            label: 'Total Teachers',
            value: analyticsData.totalTeachers.toString(),
            icon: <FaChalkboardTeacher />,
            change: `${analyticsData.teachers.acceptedTeachers}`,
            changeText: 'accepted teachers',
            up: analyticsData.teachers.acceptedTeachers > 0
          },
          {
            label: 'Total App Time',
            value: formatTimeToHoursMinutes(
              analyticsData.school.totalTimeSpent
            ),
            icon: <FaClock />,
            change: `${analyticsData.school.activeUsers}`,
            changeText: 'active users',
            up: analyticsData.school.totalTimeSpent > 0
          }
        ])
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser?.schoolId) {
      fetchStats()
    }
  }, [currentUser])

  // Fetch historical data when chart filter changes
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!currentUser?.schoolId) return

      try {
        setChartLoading(true)
        const data = await getHistoricalTimeData(
          currentUser.schoolId,
          chartFilter
        )
        setHistoricalData(data)
      } catch (error) {
        console.error('Error fetching historical data:', error)
      } finally {
        setChartLoading(false)
      }
    }

    fetchHistoricalData()
  }, [currentUser?.schoolId, chartFilter])

  // Generate chart data based on filter
  const generateChartData = () => {
    if (!historicalData) return null

    // Convert data based on selected time unit
    const convertData = (data) => {
      if (timeUnit === 'hours') {
        return data.map((value) => Math.round((value / 60) * 100) / 100) // Convert minutes to hours with 2 decimal places
      }
      return data.map((value) => Math.round(value)) // Keep as minutes, rounded
    }

    return {
      labels: historicalData.labels,
      datasets: [
        {
          label: `Students (${timeUnit})`,
          data: convertData(historicalData.studentData),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        },
        {
          label: `Teachers (${timeUnit})`,
          data: convertData(historicalData.teacherData),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2
        }
      ]
    }
  }

  // Generate pie chart data for total time comparison
  const generatePieChartData = () => {
    if (!analytics) return null

    const studentTotalTime = analytics.students.totalTimeSpent || 0
    const teacherTotalTime = analytics.teachers.totalTimeSpent || 0
    const totalTime = studentTotalTime + teacherTotalTime

    if (totalTime === 0) return null

    return {
      labels: ['Students', 'Teachers'],
      datasets: [
        {
          data: [studentTotalTime, teacherTotalTime],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)', // Green for students
            'rgba(168, 85, 247, 0.8)' // Purple for teachers
          ],
          borderColor: ['rgba(34, 197, 94, 1)', 'rgba(168, 85, 247, 1)'],
          borderWidth: 2
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: `Time Distribution - ${
          chartFilter.charAt(0).toUpperCase() + chartFilter.slice(1)
        }`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: `Time (${timeUnit})`
        }
      }
    }
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Total Time Spent Comparison'
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${formatTimeToHoursMinutes(
              value
            )} (${percentage}%)`
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <section className='educator-dashboard-stats'>
        <div className='educator-dashboard-stats__loading'>
          <div className='loading-spinner'></div>
          <p>Loading analytics...</p>
        </div>
      </section>
    )
  }

  return (
    <section className='educator-dashboard-stats'>
      {/* School Overview Cards */}
      <div className='educator-dashboard-stats__section'>
        <div className='educator-dashboard-stats__cards'>
          {stats.slice(0, 4).map((stat, idx) => (
            <div className='educator-dashboard-stats__card' key={stat.label}>
              <div className='educator-dashboard-stats__icon'>{stat.icon}</div>
              <div className='educator-dashboard-stats__value'>
                {stat.value}
              </div>
              <div className='educator-dashboard-stats__label'>
                {stat.label}
              </div>
              <div className='educator-dashboard-stats__change'>
                <span
                  className={
                    stat.up
                      ? 'educator-dashboard-stats__up'
                      : 'educator-dashboard-stats__down'
                  }
                >
                  {stat.change}
                </span>
                <span className='educator-dashboard-stats__change-text'>
                  {stat.changeText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Analytics Section */}
      <div className='educator-dashboard-stats__section'>
        {/* Charts Section */}
        {analytics && (
          <div className='educator-dashboard-stats__charts-section'>
            {/* Bar Chart Card */}
            <div className='educator-dashboard-stats__chart-card'>
              <div className='chart-card-header'>
                <h4 className='chart-card-title'>Time Trends Analysis</h4>
                <div className='chart-controls'>
                  <div className='chart-filters'>
                    <button
                      className={`chart-filter-btn ${
                        chartFilter === 'day' ? 'active' : ''
                      }`}
                      onClick={() => setChartFilter('day')}
                    >
                      Day
                    </button>
                    <button
                      className={`chart-filter-btn ${
                        chartFilter === 'week' ? 'active' : ''
                      }`}
                      onClick={() => setChartFilter('week')}
                    >
                      Week
                    </button>
                    <button
                      className={`chart-filter-btn ${
                        chartFilter === 'month' ? 'active' : ''
                      }`}
                      onClick={() => setChartFilter('month')}
                    >
                      Month
                    </button>
                  </div>
                  <div className='time-unit-selector'>
                    <label className='time-unit-label'>Time Unit:</label>
                    <select
                      value={timeUnit}
                      onChange={(e) => setTimeUnit(e.target.value)}
                      className='time-unit-select'
                    >
                      <option value='minutes'>Minutes</option>
                      <option value='hours'>Hours</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className='chart-container'>
                {chartLoading ? (
                  <div className='chart-loading'>
                    <div className='loading-spinner'></div>
                    <p>Loading chart data...</p>
                  </div>
                ) : (
                  <Bar data={generateChartData()} options={chartOptions} />
                )}
              </div>
            </div>

            {/* Pie Chart Card */}
            <div className='educator-dashboard-stats__chart-card'>
              <div className='chart-card-header'>
                <h4 className='chart-card-title'>Total Time Distribution</h4>
                <p className='chart-card-subtitle'>
                  Students vs Teachers comparison
                </p>
              </div>
              <div className='chart-container'>
                {generatePieChartData() ? (
                  <Pie
                    data={generatePieChartData()}
                    options={pieChartOptions}
                  />
                ) : (
                  <div className='chart-loading'>
                    <p>No time data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default EducatorDashboardStats
