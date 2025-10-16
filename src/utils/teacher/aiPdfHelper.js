// utils/teacher/aiPdfHelper.js

/**
 * Enhanced PDF processor for student data extraction
 * Fixes worker configuration issues and improves extraction reliability
 */

// Import PDF.js library - using your existing version
import * as pdfjsLib from 'pdfjs-dist'
import { capitalizeName } from './nameUtils'
import initPdfWorker from '../pdfWorkerInit'

// Configure PDF.js worker properly for stable version
const configurePdfWorker = () => {
  return initPdfWorker()
}

/**
 * Process PDF files with enhanced reliability
 */
export const processPdfDocument = async (file) => {
  try {
    console.log('Starting PDF processing for file:', file.name)

    // Configure PDF.js worker
    const workerConfigured = configurePdfWorker()
    if (!workerConfigured) {
      throw new Error('Failed to configure PDF.js worker')
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file)

    try {
      // Load PDF using stable version of PDF.js
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true
      })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('PDF loading timeout')), 5000)
      )

      const pdfDocument = await Promise.race([
        loadingTask.promise,
        timeoutPromise
      ])
      console.log(`PDF loaded successfully with ${pdfDocument.numPages} pages`)

      // Extract text
      const textContents = []

      for (let i = 1; i <= Math.min(pdfDocument.numPages, 10); i++) {
        try {
          const page = await pdfDocument.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map((item) => item.str).join(' ')
          textContents.push(pageText)
          console.log(`Extracted ${pageText.length} characters from page ${i}`)
        } catch (pageError) {
          console.warn(`Error extracting text from page ${i}:`, pageError)
        }
      }

      const extractedText = textContents.join('\n\n')

      if (extractedText && extractedText.trim().length > 100) {
        console.log(
          `Successfully extracted ${extractedText.length} characters using PDF.js`
        )
        return extractedText
      }
    } catch (pdfJsError) {
      console.error('PDF.js extraction failed:', pdfJsError)
    }

    // If PDF.js extraction fails, try using direct extraction method
    try {
      console.log('Attempting direct PDF text extraction')
      const directText = await extractPdfTextRaw(file)

      if (directText && directText.length > 100) {
        console.log(
          `Successfully extracted ${directText.length} characters directly from PDF`
        )
        return directText
      }
    } catch (directError) {
      console.warn('Direct extraction failed:', directError)
    }
    // If all attempts fail, use the fallback mechanism
    return handlePdfFallback(file)
  } catch (error) {
    console.error('Error in PDF document processing:', error)
    return handlePdfFallback(file)
  }
}

/**
 * Direct PDF text extraction attempt - last resort
 */
const extractPdfTextRaw = async (file) => {
  // Try to read file as text and find PDF text objects directly
  const rawText = await readFileAsText(file)

  // Look for text objects in PDF syntax
  const textObjects = []
  let match

  // Extract text from BT...ET blocks (Basic Text objects in PDF)
  const textRegex = /BT\s*([^]*?)\s*ET/g
  while ((match = textRegex.exec(rawText)) !== null) {
    if (match[1] && match[1].length > 0) {
      // Clean up PDF text object syntax
      const cleanedText = match[1]
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\(\d{3})/g, (m, code) =>
          String.fromCharCode(parseInt(code, 8))
        )
        .replace(/\[(.*?)\]/g, '$1')
        .replace(/Tj|TJ|\*|Td|TD|Tm|T\*|'/g, ' ')
        .replace(/</g, '')
        .replace(/>/g, '')
        .replace(/\s+/g, ' ')

      textObjects.push(cleanedText)
    }
  }

  // Look for student data patterns in raw text
  const studentPatterns = {
    names: rawText.match(/student\s*name|name\s*:/gi),
    ids: rawText.match(/student\s*id|id\s*:/gi),
    emails: rawText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g)
  }

  // Also try to extract information from PDF streams
  let streams = []
  const streamRegex = /stream\s([\s\S]*?)endstream/g
  while ((match = streamRegex.exec(rawText)) !== null) {
    if (match[1] && match[1].length > 0) {
      const streamContent = match[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\t/g, ' ')
        .replace(/\\\\/g, '\\')

      // Look for ASCII text in the stream
      const textMatch = streamContent.match(
        /[A-Za-z0-9\s.,;:'"()[\]{}@!?#$%^&*+=_\\|-]{20,}/g
      )
      if (textMatch) {
        streams = streams.concat(textMatch)
      }
    }
  }

  // Extract text from object definitions (sometimes contains student data)
  const objectTexts = []
  const objRegex = /\d+\s+\d+\s+obj\s+([\s\S]*?)endobj/g
  while ((match = objRegex.exec(rawText)) !== null) {
    if (match[1] && match[1].length > 0) {
      // Look for strings in object
      const stringMatches = match[1].match(/\((.*?)\)/g)
      if (stringMatches) {
        for (const str of stringMatches) {
          // Only include longer strings that might be meaningful
          if (str.length > 6) {
            const cleaned = str.replace(/^\(|\)$/g, '')
            objectTexts.push(cleaned)
          }
        }
      }
    }
  }

  // Combine all extracted text sources
  let extractedText = [...textObjects, ...streams, ...objectTexts].join('\n')

  // If we have student patterns but not much text content, include the raw sections
  if (
    (studentPatterns.names || studentPatterns.ids || studentPatterns.emails) &&
    extractedText.length < 100
  ) {
    // Try to extract regions around student data
    if (studentPatterns.names) {
      studentPatterns.names.forEach((match) => {
        const startIdx = Math.max(0, rawText.indexOf(match) - 100)
        const endIdx = Math.min(rawText.length, rawText.indexOf(match) + 500)
        extractedText += '\n' + rawText.substring(startIdx, endIdx)
      })
    }

    if (studentPatterns.ids) {
      studentPatterns.ids.forEach((match) => {
        const startIdx = Math.max(0, rawText.indexOf(match) - 100)
        const endIdx = Math.min(rawText.length, rawText.indexOf(match) + 500)
        extractedText += '\n' + rawText.substring(startIdx, endIdx)
      })
    }

    if (studentPatterns.emails && studentPatterns.emails.length > 0) {
      extractedText += '\n' + studentPatterns.emails.join('\n')
    }
  }

  return extractedText.trim()
}

/**
 * Improved PDF fallback handling without using PDF.js
 */
const handlePdfFallback = async (file) => {
  console.log('Using improved PDF fallback processing')

  try {
    // Extract potential student data directly from the raw file
    const rawText = await readFileAsText(file)

    // Look for student data patterns in the raw text
    const studentPatterns = {
      names: rawText.match(/student\s*name|name\s*:|full\s*name/gi),
      ids: rawText.match(/student\s*id|id\s*:|id\s*number/gi),
      emails: rawText.match(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
      )
    }

    // If we found any student data patterns, extract them
    if (
      studentPatterns.names ||
      studentPatterns.ids ||
      studentPatterns.emails
    ) {
      console.log('Found potential student data patterns in raw file')

      // Extract context around the patterns
      let extractedContext = ''

      // Extract names context
      if (studentPatterns.names) {
        studentPatterns.names.forEach((match) => {
          const idx = rawText.indexOf(match)
          if (idx >= 0) {
            const start = Math.max(0, idx - 100)
            const end = Math.min(rawText.length, idx + 500)
            extractedContext += rawText.substring(start, end) + '\n\n'
          }
        })
      }

      // Extract IDs context
      if (studentPatterns.ids) {
        studentPatterns.ids.forEach((match) => {
          const idx = rawText.indexOf(match)
          if (idx >= 0) {
            const start = Math.max(0, idx - 100)
            const end = Math.min(rawText.length, idx + 500)
            extractedContext += rawText.substring(start, end) + '\n\n'
          }
        })
      }

      // Add emails if found
      if (studentPatterns.emails) {
        extractedContext +=
          'Emails found: ' + studentPatterns.emails.join(', ') + '\n\n'
      }

      if (extractedContext.length > 100) {
        return extractedContext
      }
    }

    // Check if this looks like a PDF file
    const isPdfLike =
      rawText.includes('%PDF') ||
      file.name.toLowerCase().endsWith('.pdf') ||
      file.type === 'application/pdf'

    if (isPdfLike) {
      // This is likely a PDF, but we couldn't extract structured text
      console.log(
        'File appears to be a PDF, but text extraction failed - might be a scanned document'
      )

      // Return helpful metadata for AI processing
      return (
        `This appears to be a PDF document named "${file.name}" with size ${(
          file.size / 1024
        ).toFixed(2)} KB. ` +
        `The document might be scanned or contain image-based content that could not be extracted. ` +
        `${
          studentPatterns.emails
            ? 'Email addresses found: ' + studentPatterns.emails.join(', ')
            : ''
        } ` +
        `Please analyze it for any student information that might be present.`
      )
    } else {
      // Not a valid PDF or corrupted
      return `The file "${file.name}" could not be processed as a valid PDF. Please check the file integrity or try another format.`
    }
  } catch (fallbackError) {
    console.error('PDF fallback processing error:', fallbackError)
    return `Unable to process this PDF file. The file may be corrupted or in an unsupported format.`
  }
}

/**
 * Extract student data from PDF using AI - Completely specialized for PDF documents
 */
export const extractPdfStudentDataWithAI = async (text) => {
  try {
    // Ensure text is not null or undefined
    if (!text) {
      console.warn('No text content provided for PDF AI processing')
      return [{ title: 'Imported Class', students: [] }]
    }

    // Check if API key is available
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.warn('OpenAI API key not available, skipping AI data extraction')
      return [{ title: 'Imported Class', students: [] }]
    }

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    const apiUrl =
      import.meta.env.VITE_OPENAI_URL || 'https://api.openai.com/v1'
    const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o'

    // Log a sample of the original text for debugging
    console.log('Original PDF text sample:', text.substring(0, 200))

    // PDF-specific preprocessing to improve text quality
    let textSample = preprocessPdfText(text)

    // PDF files can be large, so intelligently extract the most relevant portions
    if (textSample.length > 8000) {
      textSample = extractRelevantSegments(textSample, 8000)
      console.log('PDF text was very long, extracted most relevant segments')
    } else if (textSample.length > 4000) {
      textSample = textSample.substring(0, 4000)
      console.log(
        `PDF text truncated from ${textSample.length} to 4000 characters`
      )
    }

    // Check if we only have metadata (from fallback processing for scanned PDFs)
    const isMetadataOnly =
      text.includes('This appears to be a PDF document named') &&
      text.includes('with size') &&
      text.length < 300

    // Look for PDF-specific student data patterns to optimize the prompt
    const hasStudentDataPatterns =
      text.toLowerCase().includes('student name') ||
      text.toLowerCase().includes('student id') ||
      text.toLowerCase().includes('student number') ||
      text.toLowerCase().includes('student email') ||
      text.toLowerCase().includes('student list') ||
      text.toLowerCase().includes('class roster') ||
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(text) || // Email pattern
      /\b(id|student)\s*[:#]\s*\w+/i.test(text) || // ID pattern
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(text) // Name pattern

    // Create PDF-specific prompts based on content analysis
    let systemContent, userContent
    let temperature = 0.1 // Default to low temperature for precision

    if (isMetadataOnly) {
      // If we only have metadata (e.g., for scanned PDFs), create an appropriate prompt
      systemContent =
        'You are an expert in creating student records for classroom systems. When provided with a PDF document description, determine if you need to create sample records.'

      userContent = `${textSample}

The document appears to be a scanned or image-based PDF, and no text could be extracted. Based on the file name and other metadata:

1. If the file name or metadata suggests this is a student list (like 'class roster', 'student list', etc.), create 3-5 sample student records.
2. If the file name does not clearly indicate it contains student data, do NOT create any sample records.

Each student record should include:
- firstName (student's first name)
- lastName (student's last name)
- studentId (student ID number or code)
- email (student email address)

Return ONLY a JSON array. Format: [{"firstName": "...", "lastName": "...", "studentId": "...", "email": "..."}, ...]
If you determine no sample data should be created, return an empty array: []`

      temperature = 0.4 // Moderate temperature
    } else if (hasStudentDataPatterns) {
      // PDF with student data patterns - use PDF-specific extraction strategy
      systemContent = `You are an expert PDF data extraction system specialized in identifying and extracting student information from PDF documents. PDF text extraction often has issues with formatting and layout, so you need to be intelligent about identifying structured data even when it appears unstructured.`

      userContent = `I have a PDF document containing student information. PDFs often have formatting issues when converted to text, so you'll need to be flexible in identifying student records. Here's the content:

${textSample}

Extract ONLY the real student records with these fields:
- firstName (student's first name)
- lastName (student's last name)
- studentId (student ID number or code)
- email (student email address)

IMPORTANT PDF EXTRACTION INSTRUCTIONS:
1. ONLY extract real data that is present in the document
2. PDF layout issues may cause names and IDs to appear on separate lines - match them intelligently
3. If names appear as a single field like "student name: John Smith", split them into firstName and lastName
4. If student ID appears with a prefix like "S" or "ID", include that prefix
5. Be intelligent about identifying columns of data even if they appear as unstructured text
6. Look for patterns that might indicate student records (consecutive names, IDs, emails)
7. Include ALL students found in the document, even if information is partial

ONLY RESPOND WITH A JSON ARRAY OF STUDENTS. NO ADDITIONAL TEXT, NOTES OR EXPLANATIONS.
Format: [{"firstName": "...", "lastName": "...", "studentId": "...", "email": "..."}, ...]`

      temperature = 0.1 // Very low temperature for precise results
    } else {
      // Standard prompt but PDF-optimized
      systemContent = `You are an expert PDF data extraction system specialized in identifying and extracting student information from PDF documents. PDF text extraction often has layout issues, so you must be clever about detecting structured data.`

      userContent = `I have a PDF document containing potential student information. The PDF text extraction may have introduced formatting issues. Here's the content:

${textSample}

Please extract ONLY the student records that actually exist in this document. Extract these fields:
- firstName (student's first name)
- lastName (student's last name)
- studentId (student ID number or code)
- email (student email address)

IMPORTANT PDF EXTRACTION CONTEXT:
1. Look for common PDF structural indicators like headings, form fields, or tabular data
2. Consecutive lines may represent related data (name on one line, ID on the next)
3. ONLY extract real data from the document, NEVER create any placeholder or sample data if none exists
4. Be thorough - PDFs often contain data in unexpected formats
5. If absolutely no student data is found, return an empty array

Return ONLY a JSON array. NO additional text, notes or explanations.
Format: [{"firstName": "...", "lastName": "...", "studentId": "...", "email": "..."}, ...]`
    }

    // Construct PDF-optimized prompt
    const prompt = {
      model: model,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent }
      ],
      temperature: temperature,
      max_tokens: 2000
    }

    console.log(
      `Sending PDF-optimized ${
        isMetadataOnly
          ? 'metadata-based'
          : hasStudentDataPatterns
          ? 'student-data-based'
          : 'content-based'
      } prompt to OpenAI`
    )

    // Call OpenAI API
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(prompt)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error for PDF processing:', errorData)
      return [{ title: 'Imported from PDF', students: [] }]
    }

    const data = await response.json()
    const extractedText = data.choices[0].message.content.trim()

    console.log(
      'Received PDF extraction response from OpenAI:',
      extractedText.substring(0, 200) + '...'
    )

    // Parse response with PDF-specific error handling
    let extractedStudents = await parseAIResponse(extractedText, text)

    // PDF-specific post-processing: clean and normalize data with capitalization
    const cleanedStudents = extractedStudents
      .map((student) => ({
        firstName: capitalizeName((student.firstName || '').trim()),
        lastName: capitalizeName((student.lastName || '').trim()),
        studentId: (student.studentId || '').trim(),
        email: (student.email || '').trim()
      }))
      .filter(
        (student) =>
          // Ensure at least name and ID are present
          (student.firstName || student.lastName) && student.studentId
      )

    // If no students after filtering, use original unfiltered data
    const finalStudents =
      cleanedStudents.length > 0 ? cleanedStudents : extractedStudents

    // Format as class data structure
    const classData = [
      {
        title: `Imported from PDF`,
        students: finalStudents
      }
    ]

    return classData
  } catch (error) {
    console.error('Error in AI data extraction for PDF:', error)
    // Return valid but empty data structure
    return [{ title: 'Imported from PDF', students: [] }]
  }
}

/**
 * Enhanced parsing of AI response with multiple fallback strategies
 */
const parseAIResponse = async (extractedText, originalText) => {
  try {
    // Try to parse the response as JSON
    // First, try to find JSON array in the response
    const jsonMatch = extractedText.match(/\[\s*\{.*\}\s*\]/s)

    if (jsonMatch) {
      // If JSON array pattern found, parse only that part
      const extractedStudents = JSON.parse(jsonMatch[0])
      console.log(
        `Successfully extracted ${extractedStudents.length} student records`
      )
      return extractedStudents
    } else {
      // Try to parse the entire response
      // Remove any markdown code block syntax
      const jsonString = extractedText.replace(/```json|```/g, '').trim()
      const extractedStudents = JSON.parse(jsonString)

      // Validate data format
      if (!Array.isArray(extractedStudents)) {
        console.warn('API returned non-array response:', extractedText)
        throw new Error('Expected array of student records')
      }

      console.log(
        `Successfully extracted ${extractedStudents.length} student records`
      )
      return extractedStudents
    }
  } catch (e) {
    console.error(
      'Error parsing AI response:',
      e,
      'Response was:',
      extractedText
    )

    // Try backup parsing methods if initial parse fails
    try {
      // Try to find array start and end positions
      const startIdx = extractedText.indexOf('[')
      const endIdx = extractedText.lastIndexOf(']') + 1

      if (startIdx >= 0 && endIdx > startIdx) {
        // Extract just the JSON part
        const jsonPart = extractedText.substring(startIdx, endIdx)
        const extractedStudents = JSON.parse(jsonPart)
        console.log(
          `Advanced parsing successful, extracted ${extractedStudents.length} student records`
        )
        return extractedStudents
      }
    } catch (backupError) {
      console.error('Backup parsing failed:', backupError)
    }

    // Last resort: extract data patterns from the original text
    return extractStudentDataPatterns(originalText)
  }
}

/**
 * Extract student data patterns directly from text as last resort
 */
const extractStudentDataPatterns = (text) => {
  console.log('Attempting pattern-based extraction as last resort')
  const potentialStudents = []

  // Look for common email and student ID patterns
  const emailMatches =
    text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g) || []
  const idMatches = text.match(/\b([A-Z]\d{3,}|\d{5,}|[A-Z]{2}\d{3,})\b/g) || []

  // Try to build student records from these patterns
  for (let i = 0; i < Math.max(emailMatches.length, idMatches.length); i++) {
    const email = emailMatches[i] || ''
    const studentId = idMatches[i] || ''

    if (email || studentId) {
      // Try to extract name from email
      let firstName = '',
        lastName = ''
      if (email) {
        const namePart = email.split('@')[0]
        // Try to extract first and last name from email
        const nameParts = namePart.split(/[._]/)
        if (nameParts.length >= 2) {
          firstName = nameParts[0]
          lastName = nameParts[1]
        } else {
          firstName = namePart
        }
      }

      potentialStudents.push({
        firstName: capitalizeName(firstName),
        lastName: capitalizeName(lastName),
        studentId: studentId,
        email: email
      })
    }
  }

  if (potentialStudents.length > 0) {
    console.log(
      `Pattern extraction found ${potentialStudents.length} potential student records`
    )
    return potentialStudents
  }

  console.log('No patterns found, returning empty array')
  return []
}

/**
 * Preprocess PDF text to improve extraction quality
 */
const preprocessPdfText = (text) => {
  // Basic text cleaning
  let cleanedText = text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\r\n|\r|\n/g, '\n') // Normalize line breaks
    .replace(/\f/g, '\n\n') // Form feeds to paragraph breaks
    .trim()

  // Fix PDF structural markers that can interfere with text extraction
  cleanedText = cleanedText
    .replace(/obj|endobj|stream|endstream/g, ' ')
    .replace(/<<.*?>>/g, ' ')
    .replace(/%[^\n]*/g, '')

  // Try to restore structure
  const potentialLines = cleanedText.split(/\n|\. /)
  const enhancedLines = []

  for (const line of potentialLines) {
    const trimmed = line.trim()
    if (trimmed.length > 0) {
      enhancedLines.push(trimmed)
    }
  }

  return enhancedLines.join('\n')
}

/**
 * Extract most relevant segments from long text
 */
const extractRelevantSegments = (text, maxLength) => {
  // Split text into lines
  const lines = text.split(/\r?\n/)

  // Find lines that might contain student data
  const relevanceScores = lines.map((line) => {
    let score = 0

    // Check for student data patterns
    if (/student|name|id|email/i.test(line)) score += 5
    if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(line))
      score += 10 // Email
    if (/\b([A-Z]\d{3,}|\d{5,}|[A-Z]{2}\d{3,})\b/.test(line)) score += 8 // Student ID
    if (/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(line)) score += 3 // Possible name

    return { line, score }
  })

  // Sort by relevance score
  relevanceScores.sort((a, b) => b.score - a.score)

  // Take top scoring lines first
  let result = ''
  const highRelevanceLines = relevanceScores
    .filter((item) => item.score > 0)
    .map((item) => item.line)

  // Add high relevance lines first
  result += highRelevanceLines.join('\n')

  // If we still have space, add beginning of document
  if (result.length < maxLength * 0.7) {
    const remainingSpace = maxLength - result.length
    result = text.substring(0, remainingSpace) + '\n\n' + result
  }

  // Trim to max length
  if (result.length > maxLength) {
    result = result.substring(0, maxLength)
  }

  return result
}

/**
 * Read file as ArrayBuffer
 */
const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Read file as text
 */
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Read a chunk of a file (for checking PDF signature)
 */
const readFileChunk = (file, start, length) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(new Error('Failed to read file chunk'))

    const blob = file.slice(start, start + length)
    reader.readAsText(blob)
  })
}
