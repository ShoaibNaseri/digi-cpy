const QuizIcon = ({ isActive, ICON_SIZE, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      xmlSpace='preserve'
      width={ICON_SIZE}
      height={ICON_SIZE}
      style={{
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
        imageRendering: 'optimizeQuality',
        fillRule: 'evenodd',
        clipRule: 'evenodd'
      }}
      viewBox='0 0 1707 1707'
      {...props}
    >
      <defs>
        <style>{`.fil0{fill:${isActive ? '#e9f2f2' : '#8b929e'}}`}</style>
      </defs>
      <g id='Layer_x0020_1'>
        <path
          d='M1348 1707H362c-103 0-187-90-187-200V200C175 90 259 0 362 0h780v350c0 39 31 70 70 70h320v1087c0 52-19 102-53 140s-81 60-131 60zm-73-210H418c-13 0-23-11-23-24s10-23 23-23h857c13 0 23 10 23 23s-10 24-23 24zm0-200H418c-13 0-23-11-23-24s10-23 23-23h857c13 0 23 10 23 23s-10 24-23 24zm0-200H418c-13 0-23-11-23-24s10-23 23-23h857c13 0 23 10 23 23s-10 24-23 24zM648 770c-174 0-316-142-316-317 0-174 142-316 316-316 86 0 166 32 226 92 61 59 94 139 94 224s-33 165-94 225c-60 59-140 92-226 92zm0-587c-149 0-270 121-270 270s121 270 270 270c151 0 274-121 274-270S799 183 648 183zm200 237h-40v37c0 13-10 23-23 23s-23-10-23-23v-37h-40c-13 0-24-10-24-23s11-24 24-24h40v-40c0-13 10-23 23-23s23 10 23 23v40h40c13 0 24 11 24 24s-11 23-24 23zM478 603c-3 0-5 0-8-1-12-5-18-19-13-31l38-97v-1c0-6 3-12 7-16l55-139c4-12 18-18 30-13 7 3 13 9 14 16l53 139c2 3 4 7 4 11l39 101c4 12-2 25-14 30-2 1-5 1-8 1-9 0-18-5-22-15l-35-91h-82l-36 92c-4 9-12 14-22 14zm123-153-23-59-23 59h46zm674 447H418c-13 0-23-11-23-24s10-23 23-23h857c13 0 23 10 23 23s-10 24-23 24z'
          className='fil0'
        />
        <path
          d='M1508 373h-296c-13 0-24-10-24-23V23c0-9 6-18 15-21 9-4 20-1 26 6l297 326c6 7 7 17 4 25-4 9-12 14-22 14z'
          className='fil0'
        />
      </g>
    </svg>
  )
}

export default QuizIcon
