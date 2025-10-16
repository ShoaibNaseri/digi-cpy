import { PROFANITY_LIST } from './PROFANITY_LIST'

export const maskCurseWords = (text, maskChar = '*') => {
  if (!text) return text

  let moderatedText = text

  PROFANITY_LIST.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')

    moderatedText = moderatedText.replace(regex, (match) =>
      maskChar.repeat(match.length)
    )
  })

  return moderatedText
}
