import type React from "react"

interface BilingualLabelProps {
  english: string
  bengali: string
}

export const BilingualLabel: React.FC<BilingualLabelProps> = ({ english, bengali }) => (
  <span>
    {english} <span className="text-muted-foreground">/ {bengali}</span>
  </span>
)

