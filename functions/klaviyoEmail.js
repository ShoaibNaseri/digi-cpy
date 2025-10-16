const functions = require('firebase-functions')
require('dotenv').config()
/**
 * Sends a student invitation email using Klaviyo.
 * This function is intended to be called from the frontend.
 * The Klaviyo API key should be stored securely as a Firebase environment variable.
 *
 * @param {Object} data - The data passed from the frontend.
 * @param {string} data.to_email - The recipient's email address.
 * @param {string} data.studentName - The name of the student.
 * @param {string} data.invitationLink - The unique invitation link for the student.
 * @returns {Promise<Object>} A success message or an error.
 */
exports.sendKlaviyoInvitation = functions.https.onCall(
  async (data, context) => {
    const klaviyoApiKey = process.env.KLAVIYO_API_KEY
    const klaviyoInvitationTemplateId =
      process.env.KLAVIYO_INVITATION_TEMPLATE_ID

    if (!klaviyoApiKey || !klaviyoInvitationTemplateId) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Klaviyo API key or template ID not configured.'
      )
    }

    const { to_email, studentName, invitationLink } = data

    if (!to_email || !studentName || !invitationLink) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required invitation data (to_email, studentName, invitationLink).'
      )
    }

    try {
      // --- START: Replace with actual Klaviyo API call ---
      // You'll need to install a Klaviyo SDK for Node.js or use a library like 'axios' or 'node-fetch'
      // to make an HTTP POST request to the Klaviyo API.

      // Example using node-fetch (you would need to `npm install node-fetch` in your functions directory)
      // const fetch = require('node-fetch');
      // const KLAVIYO_API_ENDPOINT = 'https://a.klaviyo.com/api/v2/email/send'; // Verify Klaviyo's current API endpoint

      const response = await fetch(KLAVIYO_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Klaviyo-API-Key ${klaviyoApiKey}`
        },
        body: JSON.stringify({
          template_id: klaviyoInvitationTemplateId,
          recipient: { email: to_email },
          profile_properties: {
            student_name: studentName,
            invitation_link: invitationLink
          }
          // Add any other Klaviyo-specific parameters here (e.g., from_email, subject, campaign_id)
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Klaviyo API Error:', result)
        throw new functions.https.HttpsError(
          'internal',
          result.message || 'Failed to send Klaviyo email via API.'
        )
      }

      // --- END: Replace with actual Klaviyo API call ---

      console.log(
        `Klaviyo invitation (placeholder) processed for ${to_email} with link: ${invitationLink}`
      )
      // Simulate a successful response from Klaviyo
      return {
        success: true,
        message: 'Klaviyo invitation processed successfully.'
      }
    } catch (error) {
      console.error('Error in sendKlaviyoInvitation:', error)
      throw new functions.https.HttpsError(
        'internal',
        'Failed to send Klaviyo invitation.',
        error.message
      )
    }
  }
)
