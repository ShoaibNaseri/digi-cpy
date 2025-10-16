// utils/teacher/nameUtils.js

/**
 * Capitalizes the first letter of each word in a name
 * @param {string} name - The name to capitalize
 * @returns {string} - The capitalized name
 */
export const capitalizeName = (name) => {
  if (!name) return ''

  // Split the name by spaces and capitalize each part
  return name
    .split(' ')
    .map((part) => {
      // Skip empty parts
      if (!part) return ''

      // Handle hyphenated names (e.g., "Smith-Jones", "Meng-Chu")
      if (part.includes('-')) {
        return part
          .split('-')
          .map((hyphenPart) => capitalizeWord(hyphenPart))
          .join('-')
      }

      // Handle apostrophes in names (e.g., "O'Brien")
      if (part.includes("'")) {
        // Special case for names like O'Brien, D'Angelo, etc.
        const apostropheIndex = part.indexOf("'")
        const firstPart = part.substring(0, apostropheIndex + 1)
        const secondPart = part.substring(apostropheIndex + 1)

        if (secondPart) {
          return capitalizeWord(firstPart) + capitalizeWord(secondPart)
        }
      }

      // Default case: just capitalize the word
      return capitalizeWord(part)
    })
    .join(' ')
}

/**
 * Capitalize a single word with special handling for prefixes
 * @param {string} word - The word to capitalize
 * @returns {string} - The capitalized word
 */
const capitalizeWord = (word) => {
  if (!word) return ''

  // Handle specific name prefixes that should be lowercase after first letter
  // Expanded list to include more cultural variations
  const prefixes = [
    'mc',
    'mac', // Scottish/Irish: McDonald, MacArthur
    'van',
    'von',
    'vom', // Dutch/German: van Gogh, von Neumann
    'de',
    'del',
    'della', // Spanish/Italian: de la Cruz, del Río, della Porta
    'la',
    'le',
    'lo', // French/Italian: La Fontaine, Le Carré
    'du',
    'des',
    'di', // French/Italian: du Pont, des Jardins, di Caprio
    'al',
    'el', // Arabic: Al Saud, El Saadawi
    'ter',
    'ten', // Dutch: ter Horst, ten Boom
    'zur',
    'zu', // German: zur Linden, zu Guttenberg
    'da',
    'dos',
    'das' // Portuguese: da Silva, dos Santos
  ]

  for (const prefix of prefixes) {
    if (word.toLowerCase().startsWith(prefix) && word.length > prefix.length) {
      // Check for special case of prefix followed by a space
      // This handles cases like "de la" or "van der"
      if (
        prefix.length + 1 < word.length &&
        word.charAt(prefix.length) === ' '
      ) {
        // For compound prefixes like "de la", keep both parts lowercase
        return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
      }

      // Regular prefix case: capitalize the prefix and then the first letter after it
      return (
        word.charAt(0).toUpperCase() +
        word.substring(1, prefix.length).toLowerCase() +
        word.charAt(prefix.length).toUpperCase() +
        word.substring(prefix.length + 1).toLowerCase()
      )
    }
  }

  // Regular capitalization for non-prefix names
  return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
}

/**
 * Splits a full name into first and last name with improved handling of compound surnames
 * @param {string} fullName - The full name to split
 * @returns {object} - Object with firstName and lastName properties
 */
export const splitCompoundName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') {
    return { firstName: '', lastName: '' }
  }

  const trimmedName = fullName.trim()

  // Handle empty names
  if (trimmedName === '') {
    return { firstName: '', lastName: '' }
  }

  // Split by spaces
  const nameParts = trimmedName.split(/\s+/)

  // If only one part, treat as firstName
  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: '' }
  }

  // Common prefixes that often indicate the start of a compound surname
  const compoundSurnameIndicators = [
    'de',
    'da',
    'del',
    'della',
    'van',
    'von',
    'el',
    'al',
    'la',
    'le',
    'du',
    'dos',
    'das',
    'di',
    'ter',
    'ten'
  ]

  // Find the likely start of the surname by looking for compound surname indicators
  let surnameStartIndex = nameParts.length - 1 // Default: last word is surname

  // Look for compound surname indicators - scan from left to right
  for (let i = 0; i < nameParts.length - 1; i++) {
    const lowerPart = nameParts[i].toLowerCase()
    if (compoundSurnameIndicators.includes(lowerPart)) {
      // Found a prefix, this might be the start of a compound surname
      // Check if the next word looks like a proper name and not another prefix
      const nextPartLower = nameParts[i + 1].toLowerCase()
      if (!compoundSurnameIndicators.includes(nextPartLower)) {
        surnameStartIndex = i
        break
      }
    }
  }

  // Handle Western names (given name first, family name last)
  return {
    firstName: nameParts.slice(0, surnameStartIndex).join(' '),
    lastName: nameParts.slice(surnameStartIndex).join(' ')
  }
}

/**
 * Processes a student object to capitalize names
 * @param {Object} student - The student object with firstName and lastName
 * @returns {Object} - The student object with capitalized names
 */
export const capitalizeStudentNames = (student) => {
  if (!student) return student

  return {
    ...student,
    firstName: capitalizeName(student.firstName),
    lastName: capitalizeName(student.lastName)
  }
}

// Export a default object with all the functions for modules that prefer default imports
export default {
  capitalizeName,
  capitalizeWord,
  splitCompoundName,
  capitalizeStudentNames
}
