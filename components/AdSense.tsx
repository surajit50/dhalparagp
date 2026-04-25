"use client"

import Script from "next/script"
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type AdSenseContextType = {
  isLoaded: boolean
  setIsLoaded: (loaded: boolean) => void
}

const AdSenseContext = createContext<AdSenseContextType | null>(null)

type AdSenseProviderProps = {
  pId: string
  children: React.ReactNode
  enableAutoAds?: boolean
}

export const AdSenseProvider = ({ pId, children, enableAutoAds = true }: AdSenseProviderProps) => {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <AdSenseContext.Provider value={{ isLoaded, setIsLoaded }}>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          setIsLoaded(true)
          if (enableAutoAds) {
            // Enable auto ads
            ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
            ;(window as any).adsbygoogle.push({
              google_ad_client: `ca-pub-${pId}`,
              enable_page_level_ads: true,
            })
          }
        }}
        onError={() => {
          console.error("Failed to load AdSense script")
        }}
      />
      {children}
    </AdSenseContext.Provider>
  )
}

type AdUnitProps = {
  slot: string
  format?: "auto" | "rectangle" | "vertical" | "horizontal"
  responsive?: boolean
  style?: React.CSSProperties
  className?: string
}

export const AdUnit = ({ slot, format = "auto", responsive = true, style, className }: AdUnitProps) => {
  const context = useContext(AdSenseContext)
  const [adLoaded, setAdLoaded] = useState(false)
  const { isLoaded } = context || { isLoaded: false } // Provide a default value

  useEffect(() => {
    if (!context) {
      console.error("AdUnit must be used within AdSenseProvider")
      return
    }

    if (isLoaded && !adLoaded) {
      try {
        ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
        ;(window as any).adsbygoogle.push({})
        setAdLoaded(true)
      } catch (error) {
        console.error("Error loading ad:", error)
      }
    }
  }, [isLoaded, adLoaded, context])

  const defaultStyle: React.CSSProperties = {
    display: "block",
    ...style,
  }

  return (
    <ins
      className={`adsbygoogle ${className || ""}`}
      style={defaultStyle}
      data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_PID}`}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive.toString()}
    />
  )
}

// Legacy component for backward compatibility
type AdSenseTypes = {
  pId: string
}

const AdSense = ({ pId }: AdSenseTypes) => {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}

export default AdSense
