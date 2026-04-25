'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import { useSession } from "next-auth/react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { renewSession } from '@/action/session'

const SESSION_DURATION = 15 * 60
const WARNING_THRESHOLD = 5 * 60

export default function HeaderCountdown() {
  const { data: session, update } = useSession()
  const [remainingTime, setRemainingTime] = useState(0)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!session?.expires) return

    const updateRemaining = () => {
      const now = Date.now()
      const expiresAt = new Date(session.expires).getTime()
      const timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000))
      setRemainingTime(timeLeft)
    }

    updateRemaining()
    const interval = setInterval(updateRemaining, 1000)

    return () => clearInterval(interval)
  }, [session?.expires])

  const minutes = Math.floor(remainingTime / 60)
  const seconds = remainingTime % 60

  const isExpired = remainingTime === 0
  const isExpiringSoon = remainingTime <= WARNING_THRESHOLD && !isExpired

  const progressValue = useMemo(() => {
    return (remainingTime / SESSION_DURATION) * 100
  }, [remainingTime])

  const handleRenewSession = () => {
    startTransition(async () => {
      const result = await renewSession()
      if (result.success) {
        await update() // 🔁 triggers jwt update
      }
    })
  }

  if (!session) return null

  return (
    <div className="flex items-center gap-3 text-sm">

      <span
        className={`font-semibold ${
          isExpired
            ? 'text-red-500'
            : isExpiringSoon
            ? 'text-yellow-500'
            : 'text-green-500'
        }`}
        aria-live="polite"
      >
        {isExpired
          ? 'Expired'
          : `${minutes.toString().padStart(2, '0')}:${seconds
              .toString()
              .padStart(2, '0')}`}
      </span>

      <div className="w-24">
        <Progress value={progressValue} />
      </div>

      {(isExpiringSoon || isExpired) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRenewSession}
          disabled={isPending}
          aria-label="Renew session"
        >
          <RefreshCw
            className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
          />
        </Button>
      )}
    </div>
  )
}
