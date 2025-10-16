import { missionIcons } from '@/config/images'

const missionsList = [
  {
    id: 1,
    title: 'Cyberbullying',
    icon: missionIcons.mission1,
    discription:
      'Learn to spot, stop, and report harmful online behaviors while supporting peers.',
    isLocked: false,
    headerClass: 'cyberbullying',
    pdfLocation: 'assets/pdf/mission1.pdf'
  },
  {
    id: 2,
    title: 'IP Addresses & Digital Footprints',
    icon: missionIcons.mission2,
    discription:
      'Discover how IP addresses and digital footprints track actions and shape reputation.',
    isLocked: false,
    headerClass: 'ip-digital',
    pdfLocation: 'assets/pdf/mission2.pdf'
  },
  {
    id: 3,
    title: 'Passwords & Device Safety',
    icon: missionIcons.mission3,
    discription:
      'Practice strong password habits, device safety, and multi-factor authentication.',
    isLocked: false,
    headerClass: 'passwords',
    pdfLocation: 'assets/pdf/mission3.pdf'
  },
  {
    id: 4,
    title: 'Personal & Private Information',
    icon: missionIcons.mission4,
    discription:
      'Explore safe sharing, geotags, and consent to protect privacy and respect boundaries.',
    isLocked: true,
    headerClass: 'info-identity',
    pdfLocation: 'assets/pdf/mission4.pdf'
  },
  {
    id: 5,
    title: 'Identity Theft & Phishing',
    icon: missionIcons.mission5,
    discription:
      'Investigate scams and protect personal data from phishing and fraud.',
    isLocked: true,
    headerClass: 'phishing',
    pdfLocation: 'assets/pdf/mission5.pdf'
  },
  {
    id: 6,
    title: 'Online Scams',
    discription:
      'Detect fake prizes, jobs, and charity scams while learning safe responses.',
    icon: missionIcons.mission6,
    isLocked: true,
    headerClass: 'scam',
    pdfLocation: 'assets/pdf/mission6.pdf'
  },
  {
    id: 7,
    title: 'Malware',
    icon: missionIcons.mission7,
    discription:
      ' Identify viruses, worms, and ransomware, and practice prevention with safe habits.',
    isLocked: true,
    headerClass: 'malware',
    pdfLocation: 'assets/pdf/mission7.pdf'
  },
  {
    id: 8,
    title: 'Catfishing & Fake Profiles',
    icon: missionIcons.mission8,
    discription:
      'Spot red flags in fake accounts and practice safe online interactions.',
    isLocked: true,
    headerClass: 'catfishing',
    pdfLocation: 'assets/pdf/mission8.pdf'
  },
  {
    id: 9,
    title: 'Grooming & Online Predators',
    icon: missionIcons.mission9,
    discription:
      'Recognize grooming tactics, set boundaries, and follow Stop-Save-Tell.',
    isLocked: true,
    headerClass: 'grooming',
    pdfLocation: 'assets/pdf/mission9.pdf'
  },
  {
    id: 10,
    title: 'Social Engineering',
    icon: missionIcons.mission10,
    discription:
      'Learn how hackers use tricks and pressure, and how to resist and report them.',
    isLocked: true,
    headerClass: 'social-engineering',
    pdfLocation: 'assets/pdf/mission10.pdf'
  },
  {
    id: 11,
    title: 'Extortion',
    icon: missionIcons.mission11,
    discription:
      'Identify threats, refuse demands, and support peers facing online pressure.',
    isLocked: true,
    headerClass: 'extortion',
    pdfLocation: 'assets/pdf/mission11.pdf'
  },
  {
    id: 12,
    title: 'Artificial Intelligence & Deepfakes',
    icon: missionIcons.mission12,
    discription:
      'Understand AI, spot deepfake clues, and practice safe ways to verify content.',
    isLocked: true,
    headerClass: 'ai',
    pdfLocation: 'assets/pdf/mission12.pdf'
  }
]

export const getAllMissions = () => {
  return missionsList
}
