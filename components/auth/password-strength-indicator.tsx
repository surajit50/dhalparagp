'use client'

import { cn } from "@/lib/utils"

interface PasswordStrengthIndicatorProps {
  strength: number
}

export const PasswordStrengthIndicator = ({ strength }: PasswordStrengthIndicatorProps) => {
  return (
    <div className="w-full mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              i <= strength ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {strength < 2 && "Very weak"}
        {strength === 2 && "Weak"}
        {strength === 3 && "Moderate"}
        {strength === 4 && "Strong"}
        {strength === 5 && "Very strong"}
      </p>
    </div>
  )
}
