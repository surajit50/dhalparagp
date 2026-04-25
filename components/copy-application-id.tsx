"use client"

import { useState, useEffect } from "react"
import { ClipboardIcon, CheckIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const CopyApplicationId = ({ applicationId }: { applicationId: string }) => {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  const handleCopy = () => {
    navigator.clipboard.writeText(applicationId)
    setIsCopied(true)
  }

  return (
    <Badge
      variant="outline"
      className="font-mono text-xs px-3 py-1 bg-purple-100 text-purple-700 border-purple-200 rounded-full hover:bg-purple-200 transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
      onClick={handleCopy}
    >
      {isCopied ? (
        <>
          <CheckIcon className="h-3 w-3" />
          Copied!
        </>
      ) : (
        <>
          <ClipboardIcon className="h-3 w-3" />
          {applicationId}
        </>
      )}
    </Badge>
  )
}
