import { icons } from '../../../../config/images'
import ChildAssignmentItem from './ChildAssignmentItem'
import './ChildAssignments.css'

const ChildAssignments = () => {
  const assignments = [
    {
      id: 1,
      title: 'Cyberbullying',
      image: icons.cyberbullyingDark,
      due: 'March 15, 2025'
    },
    {
      id: 2,
      title: 'IP Addresses & Digital Footprints',
      image: icons.ipAndFootprintsDark,
      due: 'March 18, 2025'
    },
    {
      id: 3,
      title: 'Online Scams & Password Protection',
      image: icons.scamAndProtectionDark,
      due: 'March 20, 2025'
    },
    {
      id: 4,
      title: 'Personal Information & Identity Theft',
      image: icons.infoAndIdentityDark,
      due: 'March 22, 2025'
    },
    {
      id: 5,
      title: 'Artificial Intelligence & Deepfakes',
      image: icons.aiAndDeepfakesDark,
      due: 'March 25, 2025'
    },
    {
      id: 6,
      title: 'Extortion',
      image: icons.extortionDark,
      due: 'March 28, 2025'
    },
    {
      id: 7,
      title: 'Catfishing & Fake Profiles',
      image: icons.catFishingAndFakeProfilesDark,
      due: 'March 30, 2025'
    },
    {
      id: 8,
      title: 'Grooming',
      image: icons.groomingDark,
      due: 'April 2, 2025'
    },
    {
      id: 9,
      title: 'Online Predators',
      image: icons.onlinePredatorsDark,
      due: 'April 4, 2025'
    },
    {
      id: 10,
      title: 'Social Engineering',
      image: icons.socialEngineeringDark,
      due: 'April 6, 2025'
    }
  ]

  return (
    <div className='assignments__wrapper'>
      <div className='assignments__header'>
        <h1>Assignments Due</h1>
        <p>
          Complete these assignments to advance your digital safety knowledge
        </p>
      </div>
      <div className='assignments__list'>
        {assignments.map((assignment) => (
          <ChildAssignmentItem key={assignment.id} assignment={assignment} />
        ))}
      </div>
    </div>
  )
}

export default ChildAssignments
