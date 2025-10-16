export function generatePersonalizedAdvice(incidentDraft) {
  const advice = {
    generalTips: [
      'Remember that what happened is not your fault',
      'Continue to document any further incidents with screenshots or recordings',
      "Don't respond to negative messages or posts, as this can escalate the situation",
      "Take breaks from social media if it's causing you stress",
      'Focus on positive activities and people who support you'
    ],
    platformSpecificTips: {},
    emotionalSupportTips: [],
    nextSteps: []
  }

  const platform =
    typeof incidentDraft.where === 'string'
      ? incidentDraft.where.toLowerCase()
      : ''
  if (platform.includes('instagram') || platform.includes('meta')) {
    advice.platformSpecificTips.instagram = [
      'Use Instagram\'s "Restrict" feature to limit interaction without unfollowing',
      'Use the "Hide Story From" feature to prevent specific users from seeing your content',
      "Report harmful content using Instagram's reporting tools",
      'Consider making your account private temporarily'
    ]
  }
  if (platform.includes('tiktok')) {
    advice.platformSpecificTips.tiktok = [
      'Use TikTok\'s "Filter Comments" feature to block certain keywords',
      'Use the "Who Can Duet With Me" privacy setting to control interactions',
      'Block accounts that are sending harmful content',
      "Report videos or comments that violate TikTok's community guidelines"
    ]
  }
  if (platform.includes('snapchat')) {
    advice.platformSpecificTips.snapchat = [
      'Change your privacy settings to only allow messages from friends',
      'Block the person sending harmful content',
      'Save screenshots of inappropriate content before it disappears (they will be notified)'
    ]
  }
  if (
    platform.includes('whatsapp') ||
    platform.includes('messaging') ||
    platform.includes('text')
  ) {
    advice.platformSpecificTips.messaging = [
      'Use the block feature to prevent further messages',
      'Save screenshots of inappropriate messages as evidence',
      'Report the conversation to the platform if it violates their terms',
      'Consider changing your phone number if the harassment continues'
    ]
  }
  if (
    platform.includes('game') ||
    platform.includes('gaming') ||
    platform.includes('minecraft') ||
    platform.includes('roblox') ||
    platform.includes('fortnite')
  ) {
    advice.platformSpecificTips.gaming = [
      'Mute or block players who are being disruptive or harmful',
      'Adjust your privacy settings to limit who can message you',
      "Report players who violate the game's code of conduct",
      'Take breaks from games where harassment is occurring'
    ]
  }
  if (platform.includes('school') || platform.includes('class')) {
    advice.platformSpecificTips.school = [
      "Talk to a teacher or counselor about what's happening",
      'Keep evidence of any digital harassment',
      "Ask about your school's policies on cyberbullying",
      "Consider speaking with the school principal if the situation doesn't improve"
    ]
  }

  const emotions =
    typeof incidentDraft.howFelt === 'string'
      ? incidentDraft.howFelt.toLowerCase()
      : ''
  if (
    emotions.includes('sad') ||
    emotions.includes('hurt') ||
    emotions.includes('upset')
  ) {
    advice.emotionalSupportTips.push(
      'Remember that your feelings are valid and important'
    )
    advice.emotionalSupportTips.push(
      'Try talking about your feelings with someone you trust'
    )
    advice.emotionalSupportTips.push(
      'Engage in activities that usually make you happy'
    )
    advice.emotionalSupportTips.push(
      'Practice self-care routines that help you feel better'
    )
  }
  if (
    emotions.includes('angry') ||
    emotions.includes('mad') ||
    emotions.includes('frustrated')
  ) {
    advice.emotionalSupportTips.push(
      'Find healthy ways to express your feelings, like writing or exercise'
    )
    advice.emotionalSupportTips.push(
      'Take deep breaths when you feel overwhelmed'
    )
    advice.emotionalSupportTips.push(
      'Remember that responding when angry might make things worse'
    )
    advice.emotionalSupportTips.push(
      'Channel your energy into positive activities'
    )
  }
  if (
    emotions.includes('scared') ||
    emotions.includes('afraid') ||
    emotions.includes('anxious') ||
    emotions.includes('worried')
  ) {
    advice.emotionalSupportTips.push(
      "Remember that you're not alone in facing this situation"
    )
    advice.emotionalSupportTips.push(
      'Try relaxation techniques like deep breathing when feeling anxious'
    )
    advice.emotionalSupportTips.push(
      'Focus on aspects of your life where you feel safe and supported'
    )
    advice.emotionalSupportTips.push(
      'Consider talking to a counselor about strategies to manage anxiety'
    )
  }
  if (
    emotions.includes('embarrassed') ||
    emotions.includes('humiliated') ||
    emotions.includes('ashamed')
  ) {
    advice.emotionalSupportTips.push(
      'Remember that everyone experiences embarrassment at times'
    )
    advice.emotionalSupportTips.push(
      'Talk to someone you trust about your feelings'
    )
    advice.emotionalSupportTips.push(
      'Focus on your positive qualities and accomplishments'
    )
    advice.emotionalSupportTips.push(
      'Consider that most people are less focused on others than we think'
    )
  }

  advice.nextSteps = [
    'Talk to a trusted adult about what happened',
    'Save any evidence of the incident',
    "Use the personalized protection plan we've created for you",
    'Consider taking a break from the platform where the incident occurred',
    'Check in with a school counselor if you continue to feel upset'
  ]

  if (incidentDraft.pictureProof) {
    advice.nextSteps.push(
      'Keep the screenshots or images you shared as evidence'
    )
  }

  return advice
}
