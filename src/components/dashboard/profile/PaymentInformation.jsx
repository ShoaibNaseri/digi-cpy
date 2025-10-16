import './PaymentInformation.css'
import useManagePlan from './hooks/useManagePlan'
import ManagePlanModal from './ManagePlanModal'
import { FaRegCreditCard } from 'react-icons/fa6'

const PaymentInformation = () => {
  const { isOpen, handleOpen, handleClose } = useManagePlan()

  return (
    <>
      <div className='information'>
        <div className='information__header'>
          <h1>Payment Information</h1>
          <button onClick={handleOpen}>Manage Plan</button>
        </div>
        <div className='information__content'>
          <div className='information__content-info'>
            <FaRegCreditCard size={24} />
            {/* <img src={icons.creditCardIcon} alt='credit-card' /> */}
            <div className='information__content-number-container'>
              <p className='information__content-number'>•••• •••• •••• 4242</p>
              <p className='information__content-expires'>Expires 08/2025</p>
            </div>
          </div>
          <button className='information__content-update'>Update</button>
        </div>
      </div>
      <ManagePlanModal isOpen={isOpen} onClose={handleClose} />
    </>
  )
}

export default PaymentInformation
