'use client'

import React, { useState, useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InfiniteScrollMessageProps {
  message?: string
}

export default function Component({ message = "" }: InfiniteScrollMessageProps) {
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)
  const defaultMessage = "Important: This is a default public announcement. Please stay informed."
  const displayMessage = message.trim() || defaultMessage

  useEffect(() => {
    const container = containerRef.current
    const messageContainer = messageRef.current
    if (!container || !messageContainer) return

    const messageWidth = messageContainer.scrollWidth
    const containerWidth = container.clientWidth

    const animationDuration = Math.max(messageWidth / 50, 20) // Calculate duration based on message width, min 20s

    container.style.animationDuration = `${animationDuration}s`

    const resetAnimation = () => {
      container.style.animation = 'none'
      container.offsetHeight // Trigger reflow
      container.style.animation = ''
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          resetAnimation()
        }
      },
      { threshold: 0 }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [displayMessage])

  return (
    <Alert variant="default" className="overflow-hidden py-2 relative">
      <div
        ref={containerRef}
        className={`flex whitespace-nowrap ${isPaused ? 'pause-animation' : ''}`}
        style={{
          animation: 'scroll linear infinite',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div ref={messageRef} className="flex items-center mr-8">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{displayMessage}</AlertDescription>
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .pause-animation {
          animation-play-state: paused;
        }
      `}</style>
    </Alert>
  )
}
