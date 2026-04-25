"use client"

import { AdUnit, useAdSense } from "./adsense-provider"

type AdBannerProps = {
  slot: string
  title?: string
  className?: string
}

export const AdBanner = ({ slot, title, className }: AdBannerProps) => {
  const { isLoaded } = useAdSense()

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      {title && <p className="text-sm text-muted-foreground mb-2 text-center">{title}</p>}

      {!isLoaded && (
        <div className="flex items-center justify-center h-64 bg-muted rounded">
          <p className="text-muted-foreground">Loading ad...</p>
        </div>
      )}

      <AdUnit slot={slot} format="auto" responsive={true} className={!isLoaded ? "hidden" : ""} />
    </div>
  )
}
