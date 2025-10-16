import { sendEmail } from './emailService';

/**
 * Send class notification emails to students
 * @param {Object} formData - Class form data
 * @param {string} classId - Class ID
 * @returns {Promise<Object>} Email sending results
 */
export const sendClassNotifications = async (formData, classId) => {
  try {
    // Only process students with valid emails
    const studentsWithEmails = formData.students.filter(student => 
      student.email && student.email.includes('@')
    );
    
    if (studentsWithEmails.length === 0) {
      console.log('No valid student emails found for notifications');
      return { sent: 0, failed: 0, total: 0 };
    }
    
    console.log(`Sending email notifications to ${studentsWithEmails.length} students`);
    
    // Get formatted class details for email
    const classTitle = formData.grade ? 
      `${formData.className} - Grade ${formData.grade}` : 
      formData.className;
    
    const selectedDays = Object.keys(formData.classDays).filter(day => formData.classDays[day]);
    const dayNames = {
      Mon: 'Monday',
      Tue: 'Tuesday',
      Wed: 'Wednesday',
      Thu: 'Thursday',
      Fri: 'Friday',
      Sat: 'Saturday',
      Sun: 'Sunday'
    };
    const classDays = selectedDays.map(day => dayNames[day]).join(', ');
    
    // Format frequency display
    let frequencyText = '';
    switch(formData.frequency) {
      case 'weekly':
        frequencyText = 'Weekly';
        break;
      case 'biweekly':
        frequencyText = 'Every two weeks';
        break;
      case 'monthly':
        frequencyText = 'Monthly';
        break;
      default:
        frequencyText = formData.frequency;
    }
    
    // Format start date
    let formattedStartDate = '';
    if (formData.startDate) {
      const date = new Date(formData.startDate);
      date.setHours(12, 0, 0, 0);
      formattedStartDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // Define the login URL
    const loginUrl = 'http://localhost:5173/login';
    
    // Track email success/failure
    let sentCount = 0;
    let failedCount = 0;
    
    // Send emails to each student
    const emailPromises = studentsWithEmails.map(async (student) => {
      try {
        const studentName = student.name || 'Student';
        
        // Create email message with login URL
        const message = `
          Hello ${studentName},
          
          You have been enrolled in the class: ${classTitle}
          
          Class Schedule:
          - Days: ${classDays}
          - Frequency: ${frequencyText}
          - Start Date: ${formattedStartDate}
          - Time: ${formData.scheduleTime}
          
          You'll receive updates about upcoming missions and activities for this class.
          
          Please click the link below to create your account and access your class:
          ${loginUrl}
          
          Thank you!
        `;
        
        // Use existing sendEmail function
        await sendEmail({
          supportType: 'class notification', 
          to_email: student.email,
          subject: `Welcome to ${classTitle}`,
          message: message
        });
        
        sentCount++;
        return { success: true, email: student.email };
      } catch (error) {
        console.error(`Failed to send email to ${student.email}:`, error);
        failedCount++;
        return { success: false, email: student.email, error: error.message };
      }
    });
    
    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);
    
    console.log(`Email notification results: ${sentCount} successful, ${failedCount} failed`);
    
    return {
      sent: sentCount,
      failed: failedCount,
      total: studentsWithEmails.length,
      results: results
    };
  } catch (error) {
    console.error('Error in email notification process:', error);
    return { 
      sent: 0, 
      failed: formData.students.filter(s => s.email && s.email.includes('@')).length,
      total: formData.students.filter(s => s.email && s.email.includes('@')).length,
      error: error.message
    };
  }
};