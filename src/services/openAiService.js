import openApi from '../config/openApi'
import {
  saveIncidentReport,
  saveLawEnforcementReport
} from '@/services/incidentReportService'
import { isEmpty } from 'lodash'
import {
  systemPrompt,
  systemPrompt1,
  personalProtectionPlanPrompt,
  lawEnforcementReportPrompt
} from '@/utils/systemPrompt'

const requiredFields = [
  'location',
  'platform',
  'perpetrator',
  'perpetratorDetails',
  'incidentType',
  'ongoing',
  'sourceOfIntel',
  'timeframeSpecific',
  'timelineStart',
  'offlineToo',
  'emotionalImpact',
  'physicalSafety',
  'screenshotsRequested'
]

const checkMissingFields = (dataObj) => {
  console.log('here', {dataObj})
  if (!dataObj || !dataObj.dataObj) return requiredFields
  const data = dataObj.dataObj
  // Check if all required fields have non-null values and log missing ones
  const missingFields = []
  for (const field of requiredFields) {
    const value = data[field]
    if (value === null || value === 'null' || value === undefined) {
      missingFields.push(field)
    }
  }
  console.log({missingFields})
  return missingFields
}

export async function checkOpenAIConnection() {
  try {
    const response = await fetch(openApi.url + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openApi.apiKey}`
      },
      body: JSON.stringify({
        model: openApi.model,
        messages: [
          {
            role: 'system',
            content: 'Hello'
          }
        ],
        max_tokens: 5
      })
    })

    if (!response.ok) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking OpenAI connection:', error)
    return false
  }
}

export async function sendMessageToOpenAI(
  userData,
  message,
  images = null,
  conversationHistory = [],
  updatedDataObj,
  missingFields
) {
  try {
    const { trustedAdults, name } = userData

    const trustedAdultsString = isEmpty(trustedAdults)
      ? "I'm here for you, you can talk to me about anything"
      : trustedAdults
    const age = 13

    // Generate timestamp for the prompt
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    // Calculate missing fields if not provided
    const calculatedMissingFields = checkMissingFields(updatedDataObj)
    console.log('4', {calculatedMissingFields})

    // Determine which system prompt to use
    const shouldUseThreatPrompt =
      updatedDataObj && updatedDataObj.threatDetected === true
    const selectedSystemPrompt = shouldUseThreatPrompt
      ? () => {
        console.log("SECOND")
          return systemPrompt1(
            age,
            trustedAdultsString,
            name,
            updatedDataObj,
            calculatedMissingFields,
            conversationHistory
          )
        }
      : () => {
        console.log("INITIAL", {
          age,
          trustedAdultsString,
          name,
          updatedDataObj,
          calculatedMissingFields,
          conversationHistory
        })
          return systemPrompt(
            age,
            trustedAdultsString,
            name,
            updatedDataObj,
            calculatedMissingFields,
            conversationHistory
          )
        }

    const messages = [
      {
        role: 'system',
        content: selectedSystemPrompt()
      }
    ]

    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-25)

      recentHistory.forEach((msg, i) => {
        if (
          msg.sender === 'User' &&
          typeof msg.message === 'string' &&
          msg.message.trim() !== ''
        ) {
          messages.push({
            role: 'user',
            content:
              msg.message +
              ` ${shouldUseThreatPrompt ? `Your next response should help fill a null value in ${updatedDataObj} here are the missing fields; calculatedMissingFields: ${calculatedMissingFields}. If calculatedMissingFields is empty then set hasEnoughEvidence to TRUE.` : "You should read the content of the messages and return threatDetected: true if you detect abuse."}`
          })
        } else if (msg.sender === 'AI') {
          const aiResponse =
            typeof msg.message === 'object' && msg.message.aiResponse
              ? msg.message.aiResponse
              : msg.message
          if (typeof aiResponse === 'string' && aiResponse.trim() !== '') {
            messages.push({
              role: 'assistant',
              content: aiResponse
            })
          }
        }
      })
    }

    // Determine model based on whether images are provided
    const hasImages =
      images &&
      ((Array.isArray(images) && images.length > 0) ||
        (typeof images === 'string' && images.includes('base64')))
    const model = hasImages ? 'gpt-4o' : openApi.model

    // Handle different image formats
    if (hasImages) {
      const userContent = []

      // Add text content
      userContent.push({
        type: 'text',
        text:
          message ||
          `Here are pictures related to the following conversation: ${conversationHistory}`
      })

      // Handle images
      if (Array.isArray(images)) {
        // Multiple image URLs
        images.forEach((imageUrl, index) => {
          userContent.push({
            type: 'image_url',
            image_url: {
              url: imageUrl
            }
          })
        })
      } else if (typeof images === 'string') {
        // Single base64 image (backward compatibility)
        userContent.push({
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${images}`
          }
        })
      }

      messages.push({
        role: 'user',
        content: userContent
      })
    } else if (message && message.trim()) {
      // Text only message
      messages.push({
        role: 'user',
        content: message
      })
    }

    const response = await fetch(openApi.url + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openApi.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: hasImages ? 3000 : 1100,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API Error:', errorData)
      throw new Error(
        errorData.error?.message || 'Failed to get response from OpenAI'
      )
    }

    const data = await response.json()
    const resp = data.choices[0].message.content;
    console.log({ resp })
    return resp
  } catch (error) {
    console.error('Error calling OpenAI API 1:', error)
    return {
      aiResponse:
        "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
      incidentReport: null,
      bullyingDetected: false
    }
  }
}

export async function generatePersonalProtectionPlan(
  userData,
  conversationHistory = [],
  conversationId = null
) {
  try {
    const {
      trustedAdults,
      region = 'Unknown',
      country = 'Unknown',
      userId,
      name,
      schoolId,
      classId
    } = userData

    const evidenceImages = conversationHistory
      .filter((msg) => msg.sender === 'User')
      .reduce((acc, msg) => {
        const msgImages = Array.isArray(msg.images) ? msg.images : []
        return [...acc, ...msgImages]
      }, [])
      .filter((imageUrl) => {
        return (
          typeof imageUrl === 'string' &&
          Boolean(imageUrl) &&
          (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))
        )
      })

    const messages = [
      {
        role: 'system',
        content: personalProtectionPlanPrompt(
          conversationHistory,
          region,
          country,
          trustedAdults
        )
      }
    ]

    const response = await fetch(openApi.url + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openApi.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: 0.2,
        max_tokens: 3000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API Error:', errorData)
      throw new Error(
        errorData.error?.message || 'Failed to get response from OpenAI'
      )
    }

    const data = await response.json()
    const pdfResponse = data.choices[0].message.content
    await saveIncidentReport({
      incidentReport: pdfResponse,
      userId,
      name,
      trustedAdults,
      region,
      country,
      schoolId,
      conversationId,
      classId,
      evidenceImages
    })
    return pdfResponse
  } catch (error) {
    console.error('Error calling OpenAI API 2:', error)
    return {
      aiResponse:
        "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
      incidentReport: null,
      bullyingDetected: false
    }
  }
}

export async function generatePersonalProtectionPlanLawEnforcement(
  userData,
  conversationHistory = [],
  conversationId = null
) {
  try {
    const {
      region = 'Unknown',
      country = 'Unknown',
      userId,
      name,
      schoolId,
      classId
    } = userData

    const evidenceImages = conversationHistory
      .filter((msg) => msg.sender === 'User')
      .reduce((acc, msg) => {
        const msgImages = Array.isArray(msg.images) ? msg.images : []
        return [...acc, ...msgImages]
      }, [])
      .filter((imageUrl) => {
        return (
          typeof imageUrl === 'string' &&
          Boolean(imageUrl) &&
          (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))
        )
      })

    const messages = [
      {
        role: 'system',
        content: lawEnforcementReportPrompt(
          conversationHistory,
          region,
          country
        )
      }
    ]

    const response = await fetch(openApi.url + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openApi.apiKey}`
      },
      body: JSON.stringify({
        model: openApi.model,
        messages,
        temperature: 0.2,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API Error:', errorData)
      throw new Error(
        errorData.error?.message || 'Failed to get response from OpenAI'
      )
    }

    const data = await response.json()
    const pdfResponse = data.choices[0].message.content
    await saveLawEnforcementReport({
      incidentReport: pdfResponse,
      userId,
      name,
      region,
      country,
      schoolId,
      conversationId,
      classId,
      evidenceImages
    })
    return pdfResponse
  } catch (error) {
    console.error('Error calling OpenAI API 2:', error)
    return {
      aiResponse:
        "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
      incidentReport: null,
      bullyingDetected: false
    }
  }
}