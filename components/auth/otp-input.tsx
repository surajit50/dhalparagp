"use client"
import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

interface OTPInputProps {
  length: number
  value: string
  onChange: (value: string) => void
}

export interface OTPInputRef {
  focus: () => void
  clear: () => void
}

export const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(({ length, value, onChange }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus()
    },
    clear: () => {
      onChange('')
    },
  }))

  useEffect(() => {
    if (value.length === length) {
      console.log('OTP completed:', value)
    }
  }, [value, length])

  return (
    <InputOTP
      maxLength={length}
      value={value}
      onChange={onChange}
      ref={inputRef}
    >
      <InputOTPGroup>
        {Array.from({ length }).map((_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
})

OTPInput.displayName = 'OTPInput'
