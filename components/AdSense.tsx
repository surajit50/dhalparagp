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

const formatPublisherId = (id: string) => {
  if (!id) return "";
  return id.startsWith("ca-pub-") ? id : `ca-pub-${id}`;
};

export const AdSenseProvider = ({ pId, children, enableAutoAds = true }: AdSenseProviderProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const publisherId = formatPublisherId(pId)

  return (
    <AdSenseContext.Provider value={{ isLoaded, setIsLoaded }}>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          setIsLoaded(true)
          if (enableAutoAds) {
            // Enable auto ads
            ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
            ;(window as any).adsbygoogle.push({
              google_ad_client: publisherId,
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

  const clientPId = formatPublisherId(process.env.NEXT_PUBLIC_ADSENSE_PID || "")

  return (
    <ins
      className={`adsbygoogle ${className || ""}`}
      style={defaultStyle}
      data-ad-client={clientPId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive.toString()}
    />
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

// Legacy component for backward compatibility
type AdSenseTypes = {
  pId: string
}

const AdSense = ({ pId }: AdSenseTypes) => {
  const publisherId = formatPublisherId(pId)
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}

export default AdSense
