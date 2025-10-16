import React, { useEffect, useRef, useState } from 'react'
import './OTPInput.css'

const OTPInput = ({ length = 6, onChange, onComplete, autoFocus = true }) => {
  const [values, setValues] = useState(Array.from({ length }, () => ''))
  const inputsRef = useRef([])

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus()
    }
  }, [autoFocus])

  const emitChange = (nextValues) => {
    const code = nextValues.join('')
    onChange && onChange(code, nextValues)
    if (code.length === length && !nextValues.includes('')) {
      onComplete && onComplete(code)
    }
  }

  const handleInput = (index, e) => {
    const raw = e.target.value
    if (!raw) return
    const char = raw.replace(/\D/g, '').slice(-1)
    if (!char) return
    const nextValues = [...values]
    nextValues[index] = char
    setValues(nextValues)
    emitChange(nextValues)
    const next = inputsRef.current[index + 1]
    if (next) next.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const nextValues = [...values]
      if (nextValues[index]) {
        nextValues[index] = ''
        setValues(nextValues)
        emitChange(nextValues)
      } else if (index > 0) {
        const prev = inputsRef.current[index - 1]
        prev && prev.focus()
        nextValues[index - 1] = ''
        setValues(nextValues)
        emitChange(nextValues)
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const nextValues = Array.from({ length }, (_, i) => pasted[i] || '')
    setValues(nextValues)
    emitChange(nextValues)
    const targetIndex = Math.min(pasted.length, length - 1)
    inputsRef.current[targetIndex]?.focus()
  }

  return (
    <div className='otp-inputs' onPaste={handlePaste}>
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type='text'
          inputMode='numeric'
          pattern='[0-9]*'
          maxLength={1}
          className='otp-input login-form-control'
          value={val}
          onChange={(e) => handleInput(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  )
}

export default OTPInput


