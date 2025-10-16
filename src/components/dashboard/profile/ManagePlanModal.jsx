import Modal from '../../common/modal/Modal'
import AvailablePlanItem from './AvailablePlanItem'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import './ManagePlanModal.css'

const ManagePlanModal = ({ isOpen, onClose }) => {
  const plans = [
    {
      id: 1,
      name: 'Monthly Plan',
      price: '$9.99/month',
      sale: null,
      description: 'Perfect for trying out our services'
    },
    {
      id: 2,
      name: 'Annual Plan',
      price: '$99/year',
      sale: 20,
      description: 'Best value for long-term commitment'
    }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Manage Plan'
      footer={
        <div className='plan-modal__footer'>
          <button className='plan-modal__cancel' onClick={onClose}>
            Cancel
          </button>
          <button className='plan-modal__update'>Update Plan</button>
        </div>
      }
    >
      <div className='plan-modal__current'>
        <div className='plan-modal__current-header'>
          <div className='plan-modal__membership'>
            <p className='plan-modal__title'>Current Plan</p>
            <p className='plan-modal__type'>Monthly Membership</p>
          </div>
          <button>Active</button>
        </div>
        <div className='plan-modal__details'>
          <p className='plan-modal__billing-date'>
            Next billing date: Feb 15, 2025
          </p>
          <p className='plan-modal__price'>$9.99/month</p>
        </div>
      </div>
      <h2 className='plan-modal__plans-title'>Available Plans</h2>
      <div className='plan-modal__plans'>
        {plans.map((plan) => (
          <AvailablePlanItem
            key={plan.id}
            name={plan.name}
            price={plan.price}
            sale={plan.sale}
            description={plan.description}
          />
        ))}
      </div>
      <div className='plan-modal__info'>
        <IoMdInformationCircleOutline size={24} />
        <p>
          You can cancel your subscription anytime. Refunds are processed
          according to our policy.
        </p>
      </div>
    </Modal>
  )
}

export default ManagePlanModal
