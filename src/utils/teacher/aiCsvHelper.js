// utils/teacher/aiCsvHelper.js

// Import the capitalization utility and name splitting logic
import { capitalizeName, splitCompoundName } from './nameUtils'

/**
 * Utility to help map non-standard CSV headers to expected format using OpenAI
 */
export const mapCsvHeadersWithAI = async (headers, sampleData) => {
  try {
    // Skip if no API key is available
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.warn('OpenAI API key not available, skipping AI header mapping')
      return null
    }

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    const apiUrl =
      import.meta.env.VITE_OPENAI_URL || 'https://api.openai.com/v1'
    const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o'

    // Prepare sample data (first 3 rows) to help AI understand the data
    const sampleRows = sampleData.slice(0, 3)

    // Create prompt for AI - updated to match the expected field names and handle cultural variations
    const prompt = {
      model: model,
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that identifies CSV columns. Map non-standard headers to standard ones, with special attention to cultural naming conventions.'
        },
        {
          role: 'user',
          content: `I have a CSV file with the following headers: ${JSON.stringify(
            headers
          )}. 
          Here are sample rows: ${JSON.stringify(sampleRows)}. 
          
          I need to map these headers to standard fields:
          - "firstName" (for columns containing student first names)
          - "lastName" (for columns containing student last names)
          - "studentId" (for columns containing student IDs)
          - "email" (for columns containing email addresses)
          
          If there is a column with full names (both first and last names), identify it as "fullName".
          
          IMPORTANT CULTURAL NAMING CONSIDERATIONS:
          - Some names have hyphens (e.g., "Meng-Chu")
          - Some cultures use compound surnames with prefixes (e.g., "de la Cruz", "van der Waals")
          - Some names have apostrophes (e.g., "O'Connor", "D'Angelo")
          
          Please return a JSON object mapping the original headers to these standard fields.
          Only include mappings where you are confident (above 70% certainty).
          Format: { "original_header1": "standard_field1", "original_header2": "standard_field2", ... }
          Only respond with the JSON object, nothing else.`
        }
      ],
      temperature: 0.1, // Low temperature for more deterministic responses
      max_tokens: 500
    }

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
      console.error('OpenAI API error:', errorData)
      return null
    }

    const data = await response.json()
    const mappingText = data.choices[0].message.content.trim()

    // Parse the response to get the mapping
    let mapping
    try {
      // Remove any markdown code block syntax if present
      const jsonString = mappingText.replace(/```json|```/g, '').trim()
      mapping = JSON.parse(jsonString)

      // Process fullName mapping if found
      if (mapping.fullName || Object.values(mapping).includes('fullName')) {
        // Find the header that maps to fullName
        const fullNameHeader = Object.keys(mapping).find(
          (key) => mapping[key] === 'fullName'
        )
        if (fullNameHeader) {
          console.log(`Found fullName column: ${fullNameHeader}`)
          // Remove the fullName mapping as we'll handle it specially
          delete mapping[fullNameHeader]

          // Add a special handler for this header
          mapping[fullNameHeader] = '_fullName_special'
        }
      }
    } catch (e) {
      console.error('Error parsing AI response:', e)
      return null
    }

    return mapping
  } catch (error) {
    console.error('Error in AI header mapping:', error)
    return null
  }
}

/**
 * Transform CSV data using AI-generated header mapping
 */
export const transformCsvDataWithMapping = (jsonData, headerMapping) => {
  if (!headerMapping || Object.keys(headerMapping).length === 0) {
    return jsonData // Return original data if no mapping
  }

  // Create reverse mapping for easier lookup
  const reverseMapping = {}
  let fullNameHeader = null

  // Find special fullName handler if exists
  for (const [original, standard] of Object.entries(headerMapping)) {
    if (standard === '_fullName_special') {
      fullNameHeader = original
    } else {
      if (!reverseMapping[standard]) {
        reverseMapping[standard] = []
      }
      reverseMapping[standard].push(original)
    }
  }

  // Transform data
  return jsonData.map((row) => {
    const transformedRow = {}

    // Process fullName specially if it exists - with intelligent splitting and capitalization
    if (fullNameHeader && row[fullNameHeader]) {
      const fullName = row[fullNameHeader].trim()
      // Use improved name splitting function to handle compound surnames
      const nameParts = splitCompoundName(fullName)

      transformedRow.firstName = capitalizeName(nameParts.firstName)
      transformedRow.lastName = capitalizeName(nameParts.lastName)
    }

    // Process each standard field
    for (const [standardField, originalHeaders] of Object.entries(
      reverseMapping
    )) {
      // Skip if we already processed this field via fullName
      if (
        (standardField === 'firstName' || standardField === 'lastName') &&
        transformedRow.hasOwnProperty(standardField)
      ) {
        continue
      }

      // Try each possible original header
      for (const header of originalHeaders) {
        if (row[header] !== undefined) {
          // Apply capitalization to name fields
          if (standardField === 'firstName' || standardField === 'lastName') {
            transformedRow[standardField] = capitalizeName(row[header])
          } else {
            transformedRow[standardField] = row[header]
          }
          break // Use first match
        }
      }
    }

    // Copy any unmatched fields
    for (const [key, value] of Object.entries(row)) {
      // Skip the fullName header as we've already processed it
      if (key !== fullNameHeader && !Object.keys(headerMapping).includes(key)) {
        transformedRow[key] = value
      }
    }

    return transformedRow
  })
}

// Make sure all exports are properly defined
export default {
  mapCsvHeadersWithAI,
  transformCsvDataWithMapping
}
