const missionList = [
  { id: 'cyberbullying', label: 'Cyberbullying' },
  {
    id: 'ip-addresses-and-digital-footprints',
    label: 'IP Addresses & Digital Footprints'
  },
  {
    id: 'online-scams-and-password-protection',
    label: 'Online Scams & Password Protection'
  },
  {
    id: 'personal-information-and-identity-theft',
    label: 'Personal Information & Identity Theft'
  },
  {
    id: 'artificial-intelligence-and-deepfakes',
    label: 'Artificial Intelligence and Deepfakes'
  },
  { id: 'extortion', label: 'Extortion' },
  { id: 'catfishing-and-fake-profiles', label: 'Catfishing & Fake Profiles' },
  { id: 'grooming', label: 'Grooming' },
  { id: 'online-predators', label: 'Online Predators' },
  { id: 'social-engineering', label: 'Social Engineering' }
]

const getMissionTitleBySlug = (slug) => {
  const mission = missionList.find((mission) => mission.id === slug)
  return mission?.label
}

export default getMissionTitleBySlug
