export function extractFirstJsonObject(str) {
  // Check if input is a string
  if (typeof str !== 'string') {
    return null
  }

  const match = str.match(/\{[\s\S]*\}/)
  if (match) {
    try {
      return JSON.parse(match[0])
    } catch (e) {
      return null
    }
  }
  return null
}
