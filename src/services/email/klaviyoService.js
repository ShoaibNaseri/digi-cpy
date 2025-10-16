// src/services/klaviyoService.js

/**
 * Sends a student invitation email by calling a backend service.
 * @param {string} to_email - The recipient's email address.
 * @param {string} studentName - The name of the student.
 * @param {string} invitationLink - The unique invitation link for the student.
 * @returns {Promise<Object>} The response from the backend service.
 */
export async function sendKlaviyoInvitation({
  to_email,
  studentName,
  invitationLink
}) {
  try {
    // Make a request to your backend function/API endpoint
    const response = await fetch('/api/sendKlaviyoInvitation', {
      // Or your Firebase Function URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to_email,
        studentName,
        invitationLink
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to send Klaviyo invitation via backend'
      )
    }

    return data
  } catch (error) {
    console.error('Error sending Klaviyo invitation:', error)
    throw error
  }
}
