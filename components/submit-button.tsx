'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className={`px-4 py-2 rounded-md transition-colors ${className}`}
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? 'Processing...' : children}
    </button>
  )
}
