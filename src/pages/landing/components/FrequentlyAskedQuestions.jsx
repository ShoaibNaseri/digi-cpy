import React, { useState } from 'react'
import './FrequentlyAskedQuestions.css'
import { faqQuestions } from '@/utils/staticData/faqQuestions'

const FrequentlyAskedQuestions = () => {
  // State to track which FAQ item is open
  const [openFaqId, setOpenFaqId] = useState(null)

  // State to track how many FAQ items to show (3, 7, 11, or all 12)
  const [visibleCount, setVisibleCount] = useState(3)

  // FAQ data
  const faqItems = faqQuestions

  // Toggle FAQ item open/closed
  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id)
  }

  // Show 4 more questions
  const showMore = () => {
    const newCount = Math.min(visibleCount + 4, faqItems.length)
    setVisibleCount(newCount)
  }

  // Show less (back to 3)
  const showLess = () => {
    setVisibleCount(3)
    setOpenFaqId(null) // Close any open FAQ when showing less
  }

  // Get the FAQ items to display based on visibleCount
  const displayedFaqItems = faqItems.slice(0, visibleCount)
  const canShowMore = visibleCount < faqItems.length
  const canShowLess = visibleCount > 3

  return (
    <section className='digipalz-landing-faq__section'>
      <div className='digipalz-landing-faq__container'>
        <div className='digipalz-landing-faq__header'>
          <h2 className='digipalz-landing-faq__title'>
            Frequently Asked Questions
          </h2>
          <p className='digipalz-landing-faq__subtitle'>
            Got questions? We've got answers — everything you need to feel
            confident about Digipalz.
          </p>
        </div>

        <div className='digipalz-landing-faq__items'>
          {displayedFaqItems.map((faq, index) => (
            <div
              key={faq.id}
              className={`digipalz-landing-faq__item ${
                openFaqId === faq.id ? 'digipalz-landing-faq__item--open' : ''
              }`}
            >
              <div
                className='digipalz-landing-faq__item-header'
                onClick={() => toggleFaq(faq.id)}
              >
                <h3 className='digipalz-landing-faq__item-question'>
                  {faq.question}
                </h3>
                <button className='digipalz-landing-faq__item-toggle'>
                  {openFaqId === faq.id ? (
                    <span className='digipalz-landing-faq__item-icon-close'>
                      ×
                    </span>
                  ) : (
                    <span className='digipalz-landing-faq__item-icon-open'>
                      +
                    </span>
                  )}
                </button>
              </div>

              {openFaqId === faq.id && faq.answer && (
                <div className='digipalz-landing-faq__item-content'>
                  <p className='digipalz-landing-faq__item-answer'>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className='digipalz-landing-faq__show-more'>
          {canShowLess && (
            <button
              className='digipalz-landing-faq__show-less-button'
              onClick={showLess}
            >
              Show Less
            </button>
          )}
          {canShowMore && (
            <button
              className='digipalz-landing-faq__show-less-button'
              onClick={showMore}
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default FrequentlyAskedQuestions
