import './HelpFaqList.css'
import { icons } from '../../../config/images'
import { useState } from 'react'
import {
  FaArrowDown,
  FaArrowRight,
  FaSearch,
  FaChevronDown
} from 'react-icons/fa'

const HelpFaqList = () => {
  const [openStates, setOpenStates] = useState(new Array(23).fill(false))
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [showMore, setShowMore] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleFaq = (index) => {
    setOpenStates((prevStates) => {
      const newStates = [...prevStates]
      newStates[index] = !newStates[index]
      return newStates
    })
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const handleCategoryFilter = (category) => {
    setActiveCategory(category)
    setShowMore(false) // Reset to show only 3 when category changes
  }

  const toggleShowMore = () => {
    setShowMore(!showMore)
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const categories = [
    'All',
    'Accounts',
    'Progress Tracking',
    'Lessons',
    'New Class',
    'Safety',
    'Students',
    'Billing',
    'Support',
    'Suggest a Feature'
  ]

  const dropdownOptions = [
    'All Topics',
    'Account Issues',
    'Technical Problems',
    'Billing Questions',
    'General Support'
  ]

  const faqs = [
    {
      question: 'How do I access my lessons or dashboard?',
      answer:
        'Log in at www.digipalz.io using the email and password used during sign-up. Choose "Student," "Parent," or "Teacher" to enter your specific dashboard.',
      category: 'Accounts'
    },
    {
      question: 'How many missions are included in my subscription?',
      answer:
        'Your membership includes access to 10 cyber safety missions, with new content and updates added annually.',
      category: 'Accounts'
    },
    {
      question: 'Can I retake quizzes or mini-games?',
      answer:
        'Yes! Students can replay lessons, mini-games, and quizzes as many times as needed to improve their understanding or grades.',
      category: 'Lessons'
    },
    {
      question: 'Is Digipalz safe for kids to use alone?',
      answer:
        'Yes. All content is designed for ages 10+ with educator-reviewed material. However, we recommend that guardians review sensitive topics with their children.',
      category: 'Safety'
    },
    {
      question:
        'What do I do if my child reports a cyber incident using the chatbot?',
      answer:
        'When a student submits a report, a personalized protection plan is generated in their dashboard, and a secure alert is sent to the designated school contact or guardian.',
      category: 'Safety'
    },
    {
      question: 'Can I disable the chatbot or certain lessons?',
      answer:
        'Yes. In your Parent or Teacher dashboard, you can adjust chatbot settings or temporarily restrict access to specific lessons if needed.',
      category: 'Accounts'
    },
    {
      question: 'How does grading work for students?',
      answer:
        "Students are scored on a 100-point scale. Teachers receive automatic updates with each student's results and can download performance reports.",
      category: 'Students'
    },
    {
      question: "How is my child's data protected?",
      answer:
        'Digipalz follows strict privacy regulations under Canadian law and American law. All data is encrypted and stored on secure AWS servers. We do not sell user data or use it for advertising.',
      category: 'Safety'
    },
    {
      question: 'Can I get a refund if we no longer want to use the platform?',
      answer:
        'Annual subscriptions are refundable within the first 30 days. After that period, subscriptions are valid for the full 12-month term.',
      category: 'Billing'
    },
    {
      question: 'Who do I contact if I need help?',
      answer:
        'Email support@digipalz.io or use the live chat on your dashboard. Educators can also request a 1:1 onboarding session or troubleshooting call.',
      category: 'Support'
    },
    {
      question: 'What topics are covered in the lessons?',
      answer:
        'Topics include cyberbullying, extortion, online scams, grooming, identity theft, fake profiles, digital footprints, deepfakes, catfishing, and social engineering. Each mission focuses on a specific threat with real-world examples.',
      category: 'Lessons'
    },
    {
      question: 'How long does each mission take to complete?',
      answer:
        'Each mission takes about 30-40 minutes to complete, including a short news article, interactive story-based game, quizzes, and reflection prompts.',
      category: 'Lessons'
    },
    {
      question: 'Are any of the lessons emotionally sensitive or triggering?',
      answer:
        'Some topics, like grooming or extortion, include emotionally mature content. All lessons are age-appropriate, but we recommend parent/teacher guidance for sensitive missions. Opt-out settings are available.',
      category: 'Lessons'
    },
    {
      question: "Can I track my child or student's progress?",
      answer:
        'Yes! The parent and teacher dashboards show real-time progress and chatbot interaction summaries. Teacher dashboards, however, see anonymous data.',
      category: 'Progress Tracking'
    },
    {
      question: 'Is the content available in other languages?',
      answer:
        'Digipalz is currently available in English, with French and Spanish rolling out soon. Future updates will include additional languages based on user demand.',
      category: 'Support'
    },
    {
      question: 'Can I print or save the lessons for offline use?',
      answer:
        'Some lesson resources (quizzes, discussion prompts, activity sheets) are available for download in PDF format. The game itself must be played online to protect interactive features.',
      category: 'Lessons'
    },
    {
      question: 'What if my child/student has a learning difference or IEP?',
      answer:
        'Digipalz is designed with accessibility in mind—featuring visual cues, audio narration options, and simplified text modes. Contact us for additional accommodations.',
      category: 'Students'
    },
    {
      question: 'Can teachers use this in group/classroom settings?',
      answer:
        'Absolutely! Lessons can be paused for classroom discussion, and teachers can guide students through missions together or assign them individually. Built-in teacher guides support instruction.',
      category: 'New Class'
    },
    {
      question: 'How often is the content updated?',
      answer:
        'Lessons are reviewed annually for accuracy, relevance, and alignment with emerging online threats. Immediate updates are made if urgent safety issues arise.',
      category: 'Lessons'
    },
    {
      question: 'Can I use Digipalz across multiple children or classrooms?',
      answer:
        'Yes. Family plans allow for multiple student profiles. School accounts can manage multiple classrooms and assign lessons by grade, topic, or teacher.',
      category: 'New Class'
    },
    {
      question: 'Do you integrate with Google Classroom?',
      answer:
        'Yes. Digipalz integrates seamlessly with Google Classroom. Teachers can assign missions, track student progress, and sync grades directly within their existing classroom workflow. This makes it easy to incorporate Digipalz into your digital learning environment without adding extra admin work.',
      category: 'New Class'
    },
    {
      question: 'How do I share feedback?',
      answer:
        'We would love to hear from you! Please email clientsupport@digipalz.io and your emaill will be routed to the right team member. We love feedback!',
      category: 'Suggest a Feature'
    }
  ]

  const filteredFaqs =
    searchQuery.trim() === '' && activeCategory === 'All'
      ? faqs
      : faqs.filter((faq) => {
          const matchesSearch =
            searchQuery.trim() === '' ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())

          const matchesCategory =
            activeCategory === 'All' || faq.category === activeCategory

          return matchesSearch && matchesCategory
        })

  // Determine how many FAQs to show
  const faqsToShow = showMore ? filteredFaqs : filteredFaqs.slice(0, 3)
  const canShowMore = filteredFaqs.length > 3 && !showMore
  const canShowLess = showMore

  return (
    <section className='teacher-helpcenter-faq'>
      <div className='teacher-helpcenter-faq-header'>
        <h3 className='teacher-helpcenter-faq-title'>
          Frequently Asked Questions
        </h3>
        <div className='teacher-helpcenter-faq-controls'>
          {/* Sample Dropdown Button */}
          {/* <div className='student-helpcenter-dropdown'>
            <button 
              className='student-helpcenter-dropdown-btn'
              onClick={toggleDropdown}
            >
              All Topics
              <FaChevronDown className={`dropdown-arrow ${dropdownOpen ? 'rotate' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className='student-helpcenter-dropdown-menu'>
                {dropdownOptions.map((option, index) => (
                  <div 
                    key={index} 
                    className='student-helpcenter-dropdown-option'
                    onClick={() => {
                      // Handle dropdown option selection
                      setDropdownOpen(false)
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div> */}

          <div className='teacher-helpcenter-faq-search'>
            <div className='teacher-helpcenter-faq-search-wrapper'>
              <FaSearch
                size={20}
                className='teacher-helpcenter-faq-search-icon'
              />
              <input
                type='text'
                placeholder='Search FAQs...'
                value={searchQuery}
                onChange={handleSearchChange}
                className='teacher-helpcenter-faq-search-input'
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className='clear-button'
                  aria-label='Clear search'
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className='faq__categories'>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryFilter(category)}
            className={`faq__category-btn ${
              activeCategory === category ? 'active' : ''
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className='teacher-helpcenter-faq-list'>
        {faqsToShow.map((faq, filteredIndex) => {
          const originalIndex = faqs.findIndex(
            (originalFaq) => originalFaq.question === faq.question
          )
          return (
            <div
              key={originalIndex}
              className={`teacher-helpcenter-faq-item ${
                openStates[originalIndex] ? 'active' : ''
              }`}
            >
              <div
                className='teacher-helpcenter-faq-question'
                onClick={() => toggleFaq(originalIndex)}
              >
                <div className='teacher-helpcenter-faq-question-content'>
                  <span className='teacher-helpcenter-faq-number'>
                    0{originalIndex + 1}
                  </span>
                  <h4>{faq.question}</h4>
                </div>
                <button className='teacher-helpcenter-faq-toggle'>
                  {openStates[originalIndex] ? (
                    <FaArrowDown />
                  ) : (
                    <FaArrowRight />
                  )}
                </button>
              </div>
              {openStates[originalIndex] && (
                <div className='teacher-helpcenter-faq-answer'>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          )
        })}
        {filteredFaqs.length === 0 && (
          <div className='faq__no-results'>
            No matching FAQs found. Try a different search term.
          </div>
        )}
      </div>

      {/* Show More/Less Button - Only show when there are more than 3 FAQs */}
      {(canShowMore || canShowLess) && (
        <div className='teacher-helpcenter-faq-more'>
          <button
            className={`teacher-helpcenter-faq-more-btn ${
              canShowLess ? 'showing-less' : ''
            }`}
            onClick={toggleShowMore}
          >
            {canShowMore ? 'Show More FAQs' : 'Show Less FAQs'}
          </button>
        </div>
      )}
    </section>
  )
}

export default HelpFaqList
