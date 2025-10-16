import * as pdfjsLib from 'pdfjs-dist'

// Initialize PDF.js worker
const initPdfWorker = () => {
  try {
    const workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url
    ).href
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
    return true
  } catch (error) {
    console.error('Failed to initialize PDF.js worker:', error)
    return false
  }
}

export default initPdfWorker
