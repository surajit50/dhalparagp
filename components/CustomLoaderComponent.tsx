"use client"

import { useState, useEffect } from 'react'
import { Loader2, ShieldCheck, Wifi } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export default function CustomLoaderComponent({ isPending }: { isPending: boolean }) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initializing...')

  useEffect(() => {
    if (!isPending) {
      setProgress(100)
      setStatus('Authorization complete')
      return
    }

    const stages = [
      'Establishing secure connection...',
      'Verifying credentials...',
      'Checking permissions...',
      'Finalizing authorization...'
    ]
    let stageIndex = 0

    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer)
          return 100
        }
        const diff = Math.random() * 10
        const newProgress = Math.min(oldProgress + diff, 100)
        
        if (newProgress > (stageIndex + 1) * 25 && stageIndex < stages.length - 1) {
          stageIndex++
          setStatus(stages[stageIndex])
        }
        
        return newProgress
      })
    }, 500)

    return () => {
      clearInterval(timer)
    }
  }, [isPending])

  if (!isPending && progress === 100) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary to-primary-foreground text-primary-foreground p-4">
      <div className="w-full max-w-md">
        <div className="bg-background/10 backdrop-blur-lg rounded-lg shadow-xl p-6 space-y-6">
          <div className="flex justify-center">
            {progress < 100 ? (
              <Loader2 className="h-12 w-12 animate-spin" />
            ) : (
              <ShieldCheck className="h-12 w-12 text-green-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-center">
            {progress < 100 ? "Authorizing" : "Authorization Complete"}
          </h2>
          <p className="text-center text-primary-foreground/80">
            {progress < 100 ? "Please wait while we securely log you in..." : "You're now securely logged in!"}
          </p>
          <Progress value={progress} className="w-full" />
          <div className="flex items-center justify-center space-x-2 text-sm text-primary-foreground/60">
            <Wifi className="h-4 w-4" />
            <p>{status}</p>
          </div>

        </div>
      </div>
    </div>
  )
}