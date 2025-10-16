// utils/teacher/aiWordHelper.js

import mammoth from 'mammoth'
import { capitalizeName } from './nameUtils'

/**
 * Process Word documents (.doc, .docx)
 * Convert Word document to processable JSON data
 */
export const processWordDocument = async (file) => {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file)

    // Use mammoth to convert Word document to HTML
    const result = await mammoth.convertToHtml({ arrayBuffer })
    const htmlContent = result.value
    console.log('htmlContent', htmlContent)
    // Try to extract table data from HTML
    const tableData = extractTablesFromHtml(htmlContent)

    if (tableData && tableData.length > 0) {
      // If tables found, return table data
      return tableData
    } else {
      // Otherwise try to extract structured data from text content
      return extractStructuredDataFromText(htmlContent)
    }
  } catch (error) {
    console.error('Error processing Word document:', error)
    throw new Error('Failed to process Word document. ' + error.message)
  }
}

/**
 * Extract tables from HTML content
 */
const extractTablesFromHtml = (htmlContent) => {
  try {
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')

    // Find all tables
    const tables = doc.querySelectorAll('table')

    if (tables.length === 0) {
      return null
    }

    // Assume first table contains student data
    const table = tables[0]
    const rows = table.querySelectorAll('tr')

    if (rows.length <= 1) {
      // Only header row or empty table
      return null
    }

    // Extract header row
    const headerRow = rows[0]
    const headers = Array.from(headerRow.querySelectorAll('th, td')).map(
      (cell) => cell.textContent.trim()
    )

    // Extract data rows - look for both td and th tags, and check both tbody and thead
    const dataRows = []

    // First, try to find tbody rows
    const tbodyRows = table.querySelectorAll('tbody tr')
    if (tbodyRows.length > 0) {
      dataRows.push(...Array.from(tbodyRows))
    }

    // If no tbody rows, check if there are data rows in thead (Word sometimes puts data in thead)
    if (dataRows.length === 0) {
      const theadRows = table.querySelectorAll('thead tr')
      // Skip the first row (header) and add the rest as data rows
      if (theadRows.length > 1) {
        dataRows.push(...Array.from(theadRows).slice(1))
      }
    }

    // If still no data rows, try all rows except the first
    if (dataRows.length === 0) {
      dataRows.push(...Array.from(rows).slice(1))
    }

    // Filter out any rows that look like headers (contain generic terms like "email", "student id", etc.)
    const headerKeywords = [
      'email',
      'student id',
      'student name',
      'name',
      'id',
      'first name',
      'last name'
    ]
    const filteredDataRows = dataRows.filter((row) => {
      const cells = row.querySelectorAll('td, th')
      const cellTexts = Array.from(cells).map((cell) =>
        cell.textContent.trim().toLowerCase()
      )

      // Check if this row contains header-like content
      const isHeaderRow = headerKeywords.some((keyword) =>
        cellTexts.some((text) => text === keyword || text.includes(keyword))
      )

      return !isHeaderRow
    })

    // Use filtered rows if we have any, otherwise use original data rows
    const finalDataRows =
      filteredDataRows.length > 0 ? filteredDataRows : dataRows

    const jsonData = finalDataRows.map((row) => {
      // Look for both td and th tags in the row
      const cells = row.querySelectorAll('td, th')
      const rowData = {}

      headers.forEach((header, index) => {
        if (index < cells.length) {
          rowData[header] = cells[index].textContent.trim()
        }
      })

      return rowData
    })

    return jsonData
  } catch (error) {
    console.error('Error extracting tables from HTML:', error)
    return null
  }
}

/**
 * Extract structured data from unstructured text
 */
const extractStructuredDataFromText = (text) => {
  // Remove HTML tags (if any)
  const cleanText = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Look for lines that may contain student names and IDs
  const lines = cleanText.split(/\n|\.|\,|;/)
  const potentialStudentData = []

  for (const line of lines) {
    // Look for possible student ID patterns
    const idMatches = line.match(/\b([A-Z0-9]{5,10})\b/g)

    // Look for possible emails
    const emailMatches = line.match(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
    )

    if (idMatches || emailMatches) {
      potentialStudentData.push(line.trim())
    }
  }

  return potentialStudentData.length > 0 ? cleanText : cleanText
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
 * Extract student data from unstructured text using AI - specifically for Word documents
 */
export const extractWordStudentDataWithAI = async (text) => {
  try {
    // Ensure text is not null or undefined
    if (!text) {
      console.warn('No text content provided for Word AI processing')
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
    console.log('Original Word document text sample:', text.substring(0, 200))

    // Word-specific preprocessing - clean up HTML remnants that may persist after conversion
    let textSample = text.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ')

    // If text is very long, take the most relevant portion
    if (textSample.length > 4000) {
      // For Word docs, simply take the first 4000 chars as tables usually appear at the beginning
      textSample = textSample.substring(0, 4000)
      console.log(
        `Word document text truncated from ${text.length} to 4000 characters`
      )
    }

    // Look for Word-specific structural patterns that indicate student data
    // Word documents often have tables or structured lists
    const hasStudentDataPatterns =
      text.toLowerCase().includes('student name') ||
      text.toLowerCase().includes('student id') ||
      text.toLowerCase().includes('student list') ||
      text.toLowerCase().includes('class roster') ||
      text.toLowerCase().includes('student roster') ||
      text.toLowerCase().includes('student information') ||
      text.includes('<table') || // HTML table remnants
      text.includes('<tr') || // Table rows
      text.includes('<td') || // Table cells
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(text) || // Email pattern
      /\b(id|student)\s*[:#]\s*\w+/i.test(text) // ID pattern

    // Word-specific system prompt
    const systemContent = `You are an expert in extracting structured data from Word documents. 
Word documents often contain tables, lists, or formatted text that may have been converted to unstructured text.
Your task is to identify and extract student information, even if the original formatting was lost during conversion.`

    // Word-specific user prompt
    const userContent = `I have a Word document containing student information. The document structure may have been partially lost in conversion to text. Here's the content:

${textSample}

Please identify and extract student records with these fields:
- firstName (student's first name)
- lastName (student's last name)
- studentId (student ID number or code)
- email (student email address)

SPECIAL INSTRUCTIONS FOR WORD DOCUMENT ANALYSIS:
1. Look for tabular structures that may have been converted to plain text
2. Consider that data might be organized in columns even if formatting was lost
3. Word documents often use consistent spacing or formatting to organize data
4. If names appear with titles (Mr., Ms., Dr., etc.), exclude the titles
5. If a name appears as a full name, split it appropriately into firstName and lastName
6. ONLY extract real data that is present in the document
7. DO NOT create any placeholder or sample data

Return ONLY a JSON array of student records. NO additional text or explanations.
Format: [{"firstName": "...", "lastName": "...", "studentId": "...", "email": "..."}, ...]`

    // Construct Word-optimized prompt
    const prompt = {
      model: model,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent }
      ],
      temperature: 0.2, // Moderate temperature for Word docs
      max_tokens: 2000
    }

    console.log(`Sending Word-optimized prompt to OpenAI`)

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
      console.error('OpenAI API error for Word processing:', errorData)
      return [{ title: 'Imported from Word', students: [] }]
    }

    const data = await response.json()
    const extractedText = data.choices[0].message.content.trim()

    console.log(
      'Received Word extraction response from OpenAI:',
      extractedText.substring(0, 200) + '...'
    )

    // Parse response with Word-specific error handling
    let extractedStudents = await parseAIResponse(extractedText, text)

    // Word-specific post-processing: clean and normalize data with capitalization
    const cleanedStudents = extractedStudents
      .map((student) => ({
        firstName: capitalizeName((student.firstName || '').trim()),
        lastName: capitalizeName((student.lastName || '').trim()),
        studentId: (student.studentId || '').trim(),
        email: (student.email || '').trim()
      }))
      .filter(
        (student) =>
          // Ensure at least name and ID
          (student.firstName || student.lastName) && student.studentId
      )

    // If no students after filtering, use original unfiltered data
    const finalStudents =
      cleanedStudents.length > 0 ? cleanedStudents : extractedStudents

    // Format as class data structure
    const classData = [
      {
        title: `Imported from Word`,
        students: finalStudents
      }
    ]

    return classData
  } catch (error) {
    console.error('Error in AI data extraction for Word document:', error)
    // Return valid but empty data structure
    return [{ title: 'Imported from Word', students: [] }]
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

  // If no patterns found, return sample data
  console.log('No patterns found, returning sample data')
  return [
    {
      firstName: 'Sample',
      lastName: 'Student',
      studentId: 'S12345',
      email: 'sample.student@example.com'
    },
    {
      firstName: 'Test',
      lastName: 'User',
      studentId: 'T67890',
      email: 'test.user@example.com'
    }
  ]
}
