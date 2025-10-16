import React from 'react'
import {
  FiShield,
  FiClipboard,
  FiUser,
  FiSearch,
  FiGlobe,
  FiHeart,
  FiAlertTriangle,
  FiPause,
  FiCamera,
  FiUserX,
  FiUsers,
  FiPhone,
  FiDownload,
  FiMessageCircle,
  FiCheck
} from 'react-icons/fi'
import { isEmpty } from 'lodash'

const PersonalProtectionPlan = ({
  studentName,
  platform,
  incidentStartDate,
  incidentEndDate,
  dateReported,
  concernSummary,
  incidentSummaryParagraph,
  perpetratorName,
  blockingInstructions = '1. Go to Joshua\'s profile\n2. Tap the three dots (...)\n3. Select "Block"',
  trustedAdultsList = '• Xavier, AJ, or Lenard\n• A parent or guardian\n• Teacher or counselor',
  conversationStarters = '"I got a scary message online, and I don\'t know what to do."',
  safetyReminders = 'You are not alone, and this is not your fault. Take these steps right away to stay safe.',
  threatDetected = 'Medium',
  emergencyResources = 'Kids Help Phone (Canada)\nCall: 1-800-668-6868\nCONNECT to 686868\nwww.kidshelpphone.ca',
  evidenceImages = []
}) => {
  return (
    <div
      className='pdf-friendly'
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        lineHeight: '1.5',
        color: '#fff',
        background: 'linear-gradient(180deg, #8634E3 0%, #F72585 100%)',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        padding: '20px'
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <div
          className='pdf-section'
          style={{
            textAlign: 'center',
            marginBottom: '30px',
            padding: '30px',
            borderRadius: '16px'
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 300,
              color: '#A3E635'
            }}
          >
            <FiShield />
          </div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: '800',
              margin: '0',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            YOUR PERSONAL
            <br />
            PROTECTION PLAN
          </h1>
        </div>

        {/* Incident Summary Card */}
        <div
          className='pdf-section'
          style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '25px',
              paddingBottom: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            <div
              style={{
                background: '#A3E635',
                color: '#6C2BD9',
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}
            >
              <FiClipboard />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  margin: '0',
                  color: '#fff'
                }}
              >
                Incident Summary
              </h2>
              <p
                style={{
                  margin: '5px 0 0 0',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.9rem'
                }}
              >
                Share with a trusted adult
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 5px 0',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.9rem'
                }}
              >
                For:
              </p>
              <p
                style={{
                  margin: '0',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  color: '#fff'
                }}
              >
                {studentName}
              </p>
            </div>
            <div>
              <p
                style={{
                  margin: '0 0 5px 0',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.9rem'
                }}
              >
                Platform:
              </p>
              <p
                style={{
                  margin: '0',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  color: '#fff'
                }}
              >
                {platform}
              </p>
            </div>
            <div>
              <p
                style={{
                  margin: '0 0 5px 0',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.9rem'
                }}
              >
                Date of Incident:
              </p>
              <p
                style={{
                  margin: '0',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  color: '#fff'
                }}
              >
                {incidentStartDate} - {incidentEndDate}
              </p>
            </div>
            <div>
              <p
                style={{
                  margin: '0 0 5px 0',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.9rem'
                }}
              >
                Date Reported:
              </p>
              <p
                style={{
                  margin: '0',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  color: '#fff'
                }}
              >
                {dateReported}
              </p>
            </div>
          </div>

          <div style={{ paddingTop: '20px' }}>
            <p
              style={{
                margin: '0 0 5px 0',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem'
              }}
            >
              Concern:
            </p>
            <p
              style={{
                margin: '0',
                fontWeight: '600',
                fontSize: '1.1rem',
                color: '#fff'
              }}
            >
              {concernSummary}
            </p>
          </div>
        </div>

        {/* Incident Details */}
        <div
          className='pdf-section'
          style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '0 0 20px 0',
              color: '#A3E635',
              textTransform: 'uppercase'
            }}
          >
            INCIDENT SUMMARY
          </h3>
          <p
            style={{
              margin: '0',
              fontSize: '1rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.9)'
            }}
          >
            {incidentSummaryParagraph}
          </p>
        </div>

        {/* Evidence Images */}
        {!isEmpty(evidenceImages) && (
          <div
            className='pdf-section'
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '30px',
              marginBottom: '30px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: '0 0 20px 0',
                color: '#A3E635',
                textTransform: 'uppercase'
              }}
            >
              Screenshots Captured
            </h3>
            <div
              className='evidence-images'
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              {evidenceImages.map((image, index) => (
                <img key={index} src={image} alt={`Evidence ${index + 1}`} />
              ))}
            </div>
          </div>
        )}

        {/* Emergency Actions Header */}
        <div
          className='pdf-section'
          style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '30px'
            }}
          >
            <div
              style={{
                background: '#EF4444',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '1.5rem',
                color: '#fff'
              }}
            >
              <FiAlertTriangle />
            </div>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: '600',
                margin: '0 0 10px 0',
                color: '#fff'
              }}
            >
              Immediate Safety Steps
            </h2>
            <p
              style={{
                margin: '0 0 10px 0',
                color: '#A3E635',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}
            >
              Follow these 4 steps immediately
            </p>
            <div
              style={{
                margin: '0',
                color: 'white',
                fontSize: '1rem'
              }}
            >
              <b>IMPORTANT SAFETY NOTICE:</b> If you are in immediate danger,
              contact emergency services (911) immediately.{' '}
            </div>
          </div>
        </div>

        {/* Emergency Actions Grid */}
        <div
          className='page-break-before'
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            marginBottom: '40px'
          }}
        >
          {/* Step 1 */}
          <div
            className='pdf-step'
            style={{
              background: '#FFFFFF1A',
              border: '1px solid #FFFFFF4D',
              boxShadow:
                '0px 8px 10px -6px #0000001A, 0px 20px 25px -5px #0000001A',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '33px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div
                style={{
                  background: '#A3E635',
                  color: '#6C2BD9',
                  width: '45px',
                  height: '45px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}
              >
                <FiPause />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    margin: '0',
                    color: '#A3E635'
                  }}
                >
                  1. STOP AND STAY CALM
                </h3>
                <p
                  style={{
                    margin: '5px 0 0 0',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem'
                  }}
                >
                  Take a moment to breathe
                </p>
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '12px'
                }}
              >
                <div
                  style={{
                    color: '#8634E3',
                    background: '#AFFF00',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  <FiCheck style={{ fontSize: '12px' }} />
                </div>
                <span style={{ lineHeight: '1.4' }}>
                  Don't reply or react to the messages
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '12px'
                }}
              >
                <div
                  style={{
                    color: '#8634E3',
                    background: '#AFFF00',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  <FiCheck style={{ fontSize: '12px' }} />
                </div>
                <span style={{ lineHeight: '1.4' }}>
                  Take a deep breath and pause
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    color: '#8634E3',
                    background: '#AFFF00',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  <FiCheck style={{ fontSize: '12px' }} />
                </div>
                <span style={{ lineHeight: '1.4' }}>
                  Remember: this is <strong>not your fault</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className='pdf-step'
            style={{
              background: '#FFFFFF1A',
              border: '1px solid #FFFFFF4D',
              boxShadow:
                '0px 8px 10px -6px #0000001A, 0px 20px 25px -5px #0000001A',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '33px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div
                style={{
                  background: '#A3E635',
                  color: '#6C2BD9',
                  width: '45px',
                  height: '45px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}
              >
                <FiCamera />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    margin: '0',
                    color: '#A3E635'
                  }}
                >
                  2. TAKE SCREENSHOTS
                </h3>
                <p
                  style={{
                    margin: '5px 0 0 0',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem'
                  }}
                >
                  Save evidence of what happened
                </p>
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '12px'
                }}
              >
                <div
                  style={{
                    color: '#8634E3',
                    background: '#AFFF00',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  <FiCheck style={{ fontSize: '12px' }} />
                </div>
                <span style={{ lineHeight: '1.4' }}>
                  Take clear screenshots of {perpetratorName}'s messages
                </span>
              </div>
              <div style={{ marginLeft: '32px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      color: '#8634E3',
                      background: '#AFFF00',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <FiCheck style={{ fontSize: '12px' }} />
                  </div>
                  <p style={{ margin: '5px 5px', fontSize: '0.85rem' }}>
                    Include in each screenshot:
                  </p>
                </div>
                <ul
                  style={{
                    margin: '5px 0',
                    paddingLeft: '20px',
                    fontSize: '0.85rem'
                  }}
                >
                  <li>His username</li>
                  <li>The messages</li>
                  <li>Date and time</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className='pdf-step'
            style={{
              background: '#FFFFFF1A',
              border: '1px solid #FFFFFF4D',
              boxShadow:
                '0px 8px 10px -6px #0000001A, 0px 20px 25px -5px #0000001A',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '33px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div
                style={{
                  background: '#A3E635',
                  color: '#6C2BD9',
                  width: '45px',
                  height: '45px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}
              >
                <FiUserX />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    margin: '0',
                    color: '#A3E635'
                  }}
                >
                  3. BLOCK THE PERSON
                </h3>
                <p
                  style={{
                    margin: '5px 0 0 0',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem'
                  }}
                >
                  Stop further contact immediately
                </p>
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
              <p style={{ margin: '0 0 15px 0' }}>
                To block {perpetratorName} on {platform}:
              </p>
              <div style={{ marginBottom: '15px' }}>
                {blockingInstructions.map((instruction, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '8px'
                    }}
                  >
                    <div
                      style={{
                        color: '#8634E3',
                        background: '#AFFF00',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      <FiCheck style={{ fontSize: '12px' }} />
                    </div>
                    <span style={{ lineHeight: '1.4' }}>{instruction}</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    color: '#8634E3',
                    background: '#AFFF00',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  <FiCheck style={{ fontSize: '12px' }} />
                </div>
                <span style={{ lineHeight: '1.4' }}>
                  This stops him from messaging you
                </span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div
            className='pdf-step'
            style={{
              background: '#FFFFFF1A',
              border: '1px solid #FFFFFF4D',
              boxShadow:
                '0px 8px 10px -6px #0000001A, 0px 20px 25px -5px #0000001A',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '33px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div
                style={{
                  background: '#A3E635',
                  color: '#6C2BD9',
                  width: '45px',
                  height: '45px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}
              >
                <FiUsers />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    margin: '0',
                    color: '#A3E635'
                  }}
                >
                  4. TELL A TRUSTED PERSON
                </h3>
                <p
                  style={{
                    margin: '5px 0 0 0',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem'
                  }}
                >
                  Get help from someone you trust
                </p>
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
              <p style={{ margin: '0 0 15px 0' }}>Talk to someone safe like:</p>
              {typeof trustedAdultsList === 'string' ? (
                <p>{trustedAdultsList}</p>
              ) : (
                trustedAdultsList.map((adult, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '8px'
                    }}
                  >
                    <div
                      style={{
                        color: '#8634E3',
                        background: '#AFFF00',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      <FiCheck style={{ fontSize: '12px' }} />
                    </div>
                    <span style={{ lineHeight: '1.4' }}>{adult}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Need Help Speaking Up */}
        <div className='page-break-before'>
          <div
            className='pdf-section'
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '30px',
              marginBottom: '30px',
              marginTop: 30,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <div
              style={{
                textAlign: 'center',
                marginBottom: '30px'
              }}
            >
              <div
                style={{
                  background: '#8634E3',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '1.5rem',
                  color: '#fff'
                }}
              >
                <FiMessageCircle />
              </div>
              <h2
                style={{
                  fontSize: '2rem',
                  fontWeight: '600',
                  margin: '0 0 10px 0',
                  color: '#fff'
                }}
              >
                Need Help Speaking Up?
              </h2>
              <p
                style={{
                  margin: '0 0 10px 0',
                  color: '#AFFF00',
                  fontSize: 20,
                  fontWeight: '600'
                }}
              >
                Try these conversation starters
              </p>
              <p
                style={{
                  margin: '0',
                  color: 'white',
                  fontWeight: 400,
                  fontSize: 16
                }}
              >
                Feeling stuck? That's okay. Here are some ways to start the
                conversation with a trusted adult.
              </p>
            </div>
          </div>

          <div
            className='pdf-section'
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '25px',
              border: '1px solid rgba(255,255,255,0.2)',
              marginBottom: '20px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div
                style={{
                  background: '#A3E635',
                  color: '#6C2BD9',
                  width: '45px',
                  height: '45px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}
              >
                <FiMessageCircle />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    margin: '0',
                    color: '#A3E635'
                  }}
                >
                  YOU CAN SAY:
                </h3>
                <p
                  style={{
                    margin: '5px 0 0 0',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem'
                  }}
                >
                  Choose what feels right for you
                </p>
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
              {conversationStarters.map((starter, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <div
                    style={{
                      color: '#8634E3',
                      background: '#AFFF00',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <FiCheck style={{ fontSize: '12px' }} />
                  </div>
                  <span
                    style={{
                      fontStyle: 'italic',
                      lineHeight: '1.4'
                    }}
                  >
                    "{starter}"
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className='pdf-section'
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '25px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div
                style={{
                  background: '#A3E635',
                  color: '#6C2BD9',
                  width: '45px',
                  height: '45px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}
              >
                <FiHeart />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    margin: '0',
                    color: '#A3E635'
                  }}
                >
                  REMEMBER
                </h3>
                <p
                  style={{
                    margin: '5px 0 0 0',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem'
                  }}
                >
                  You are not alone in this
                </p>
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
              {safetyReminders.map((reminder, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <div
                    style={{
                      color: '#8634E3',
                      background: '#AFFF00',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <FiCheck style={{ fontSize: '12px' }} />
                  </div>
                  <span
                    style={{
                      lineHeight: '1.4'
                    }}
                  >
                    {reminder}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Resources */}
        {emergencyResources && (
          <div
            className='pdf-section'
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              marginTop: 20,
              padding: '30px',
              marginBottom: '30px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '20px'
              }}
            >
              <div
                style={{
                  background: '#A3E635',
                  color: '#6C2BD9',
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}
              >
                <FiPhone />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    margin: '0',
                    color: '#A3E635'
                  }}
                >
                  NEED MORE HELP?
                </h3>
                <p
                  style={{
                    margin: '5px 0 0 0',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem'
                  }}
                >
                  Support available
                </p>
              </div>
            </div>

            <div
              style={{
                fontSize: '0.95em',
                color: 'rgba(255,255,255,0.9)',
                whiteSpace: 'pre-line'
              }}
            >
              {emergencyResources.map((resource, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '25px',
                    paddingBottom: '20px',
                    borderBottom:
                      index < emergencyResources.length - 1
                        ? '1px solid rgba(255,255,255,0.1)'
                        : 'none'
                  }}
                >
                  <h4
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      marginBottom: '12px',
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}
                  >
                    {resource.name}
                  </h4>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '8px'
                    }}
                  >
                    <FiPhone style={{ color: '#A3E635', fontSize: '1rem' }} />
                    <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                      {resource.contact}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >
                    <FiGlobe
                      style={{
                        color: '#A3E635',
                        fontSize: '1rem',
                        marginTop: '2px',
                        flexShrink: 0
                      }}
                    />
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {resource.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className='pdf-section'
          style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            marginBottom: '30px'
          }}
        >
          {/* <button style={{
                        background: '#A3E635',
                        color: '#6C2BD9',
                        border: 'none',
                        borderRadius: '25px',
                        padding: '15px 30px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'transform 0.2s',
                        minWidth: '150px',
                        justifyContent: 'center'
                    }}>
                        <FiPhone /> Get Help Now
                    </button>
                    <button style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '25px',
                        padding: '15px 30px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'transform 0.2s',
                        minWidth: '150px',
                        justifyContent: 'center'
                    }}>
                        <FiDownload /> Download Report
                    </button> */}
        </div>

        {/* Footer */}
        <div
          className='pdf-section'
          style={{
            textAlign: 'center',
            marginTop: '30px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.85em'
          }}
        >
          <p
            style={{
              margin: '0 0 10px 0',
              fontSize: '0.8rem',
              lineHeight: '1.4'
            }}
          >
            Legal Disclaimer: This document is for educational and informational
            purposes only and does not constitute professional advice of any
            kind. Digipalz does not provide legal, medical, emergency,
            counseling, or investigative services and makes no representations
            regarding the accuracy, completeness, or reliability of any
            information provided.
          </p>
          <p
            style={{
              margin: '0 0 10px 0',
              fontSize: '0.8rem',
              lineHeight: '1.4'
            }}
          >
            This tool is a substitute for professional intervention or emergency
            services. Users are solely responsible for their actions and
            decisions based on this information. To the fullest extent permitted
            by law, Digipalz disclaims all liability for any harm, loss, or
            damages arising from use of this guide.
          </p>
          <p
            style={{
              margin: '0 0 20px 0',
              fontSize: '0.8rem',
              lineHeight: '1.4'
            }}
          >
            All safety concerns must be immediately reported to trusted adults,
            school officials, or appropriate authorities.
          </p>
          <p style={{ margin: '0', fontWeight: '600' }}>
            Digipalz © 2025. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PersonalProtectionPlan
