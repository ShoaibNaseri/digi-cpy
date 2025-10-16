import { sendMessageToOpenAI } from './openAiService'
import {
  saveIncidentReport,
  generateProtectionPlan,
  updateIncidentReport
} from './incidentReportService'
import { getTrustedAdults } from './userService'
import { updateFollowUpResponse } from './followUpService'
import app from '@/config/app'
import { parseRelativeDate } from '@/utils/relativeDate'
import { generatePersonalizedAdvice } from '@/utils/generateAdvice'
import { createLog } from './logService'
import { auth } from '@/firebase/config'

const BULLYING_INDICATORS = {
  keywords: [
    'bully',
    'bullied',
    'bullying',
    'harass',
    'harassed',
    'harassment',
    'threat',
    'threatened',
    'threatening',
    'scared',
    'afraid',
    'fear',
    'hurt',
    'hurting',
    'hurtful',
    'mean',
    'cruel',
    'nasty',
    'hate',
    'hated',
    'hating',
    'exclude',
    'excluded',
    'excluding',
    'ignore',
    'ignored',
    'ignoring',
    'tease',
    'teased',
    'teasing',
    'embarrass',
    'embarrassed',
    'embarrassing',
    'rumor',
    'rumors',
    'gossip',
    'spread',
    'spreading',
    'spread rumors',
    'cyberbully',
    'cyberbullied',
    'cyberbullying',
    'online bully',
    'online bullying',
    'social media bully',
    'social media bullying',
    'text bully',
    'text bullying',
    'message bully',
    'message bullying'
  ],
  patterns: [
    /(?:someone|they|he|she|them) (?:is|are|was|were) (?:being|getting) (?:mean|rude|cruel|nasty)/i,
    /(?:i|we) (?:feel|felt|am|are|was|were) (?:scared|afraid|threatened|unsafe)/i,
    /(?:i|we) (?:don't|do not) (?:feel|felt) (?:safe|comfortable|okay)/i,
    /(?:i|we) (?:am|are|was|were) (?:getting|being) (?:bullied|harassed|threatened)/i,
    /(?:someone|they|he|she|them) (?:keeps|kept|is|are) (?:sending|sending me|texting|texting me) (?:mean|rude|cruel|nasty) (?:messages|texts|pictures|photos)/i,
    /(?:i|we) (?:am|are|was|were) (?:excluded|left out|ignored|teased|made fun of)/i
  ]
}

function checkForBullyingIndicators(message) {
  const lowerMessage = message.toLowerCase()
  const matchedKeywords = BULLYING_INDICATORS.keywords.filter((keyword) =>
    lowerMessage.includes(keyword.toLowerCase())
  )

  const matchedPatterns = BULLYING_INDICATORS.patterns.filter((pattern) =>
    pattern.test(message)
  )

  return {
    isBullyingDetected:
      matchedKeywords.length > 0 || matchedPatterns.length > 0,
    matchedKeywords,
    matchedPatterns: matchedPatterns.map((pattern) => pattern.toString())
  }
}

const INCIDENT_FOLLOWUP_QUESTIONS = [
  {
    key: 'whatHappened',
    question: 'What happened? (Example: Someone sent mean messages)'
  },
  {
    key: 'where',
    question:
      'Where did it happen? (Example: TikTok, Instagram, School chat, etc.)'
  },
  {
    key: 'when',
    question: 'When did it happen? (Day and time, if you remember)'
  },
  { key: 'who', question: 'Who was involved? (Username or nickname)' },
  {
    key: 'pictureProof',
    question:
      'Do you have any picture proof or screenshots? (You can describe or upload later)'
  },
  {
    key: 'howFelt',
    question: 'How did you feel? (Example: Sad, Nervous, Confused)'
  },
  {
    key: 'howAreYouFeeling',
    question: 'And how are you feeling right now?'
  }
]
