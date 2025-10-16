const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

const email = {
  maxFileSize: MAX_FILE_SIZE,
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,   
  serviceId2: import.meta.env.VITE_EMAILJS_CUSTOMER_SERVICE_ID, 
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  templateId2: import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  classNotificationServiceId: import.meta.env.VITE_EMAILJS_CUSTOMER_SERVICE_ID, 
  classNotificationTemplateId: import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID 
}

export default email

