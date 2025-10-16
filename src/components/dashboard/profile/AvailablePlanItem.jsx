import './AvailablePlanItem.css'

const AvailablePlanItem = ({ name, price, sale, description }) => {
  return (
    <div className='plan__container'>
      <div className='plan__header'>
        <div className='plan__header-sale'>
          <p>{name}</p>
          {sale && <p className='plan__sale'>SAVE {sale}%</p>}
        </div>
        <p className='plan__description'>{description}</p>
      </div>
      <p>{price}</p>
    </div>
  )
}

export default AvailablePlanItem
