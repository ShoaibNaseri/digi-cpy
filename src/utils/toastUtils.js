import { toast } from 'sonner'

// Custom toast function for general toasts (top-right positioning)
export const showTopRightToast = (message, options = {}) => {
  return toast(message, {
    ...options,
    style: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '16px',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      ...options.style
    }
  })
}

// Custom toast function for notification toasts (bottom-right positioning)
export const showNotificationToast = (message, options = {}) => {
  return toast(message, {
    ...options,
    style: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      color: '#1f2937',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      maxWidth: '400px',
      margin: '8px',
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      ...options.style
    }
  })
}
