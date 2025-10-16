export function formatUnixTimestamp(timestamp) {
  if (!timestamp) return 'Invalid timestamp'

  const date = new Date(timestamp * 1000)

  // Return date only, e.g. "August 10, 2025"
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
