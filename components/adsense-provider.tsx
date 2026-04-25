"use client"

import Script from "next/script"
import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

type AdSenseContextType = {
  isLoaded: boolean
  pId: string
  pushAd: () => void
}

const AdSenseContext = createContext<AdSenseContextType | null>(null)

type AdSenseProviderProps = {
  pId: string
  children: React.ReactNode
  enableAutoAds?: boolean
}

export const AdSenseProvider = ({ pId, children, enableAutoAds = true }: AdSenseProviderProps) => {
  const [isLoaded, setIsLoaded] = useState(false)

  const pushAd = useCallback(() => {
    if (typeof window !== "undefined" && isLoaded) {
      try {
        // Ensure adsbygoogle array exists
        ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
        ;(window as any).adsbygoogle.push({})
      } catch (error) {
        console.error("Error pushing ad:", error)
      }
    }
  }, [isLoaded])

  const handleScriptLoad = () => {
    setIsLoaded(true)

    if (enableAutoAds && typeof window !== "undefined") {
      try {
        ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
        ;(window as any).adsbygoogle.push({
          google_ad_client: `ca-pub-${pId}`,
          enable_page_level_ads: true,
        })
      } catch (error) {
        console.error("Error enabling auto ads:", error)
      }
    }
  }

  return (
    <AdSenseContext.Provider value={{ isLoaded, pId, pushAd }}>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={(error) => {
          console.error("Failed to load AdSense script:", error)
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
  const [adId] = useState(() => `ad-${Math.random().toString(36).substr(2, 9)}`)

  const { isLoaded, pId, pushAd } = context || { isLoaded: false, pId: "", pushAd: undefined }

  useEffect(() => {
    if (isLoaded && context && pushAd) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        pushAd()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isLoaded, pushAd, context])

  const defaultStyle: React.CSSProperties = {
    display: "block",
    minHeight: "250px", // Prevent layout shift
    ...style,
  }

  if (!context) {
    console.error("AdUnit must be used within AdSenseProvider")
    return null
  }

  return (
    <div id={adId} className={className}>
      <ins
        className="adsbygoogle"
        style={defaultStyle}
        data-ad-client={`ca-pub-${pId}`}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  )
}

// Hook to use AdSense context
export const useAdSense = () => {
  const context = useContext(AdSenseContext)
  if (!context) {
    throw new Error("useAdSense must be used within AdSenseProvider")
  }
  return context
}
