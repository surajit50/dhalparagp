"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

interface ServiceFee {
  serviceType: string
  amount: number
}

const DEFAULT_FEES = {
  WATER_TANKER: 400,
  DUSTBIN_VAN: 300,
} as const

export const useServiceFees = () => {
  const [fees, setFees] = useState<ServiceFee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/fees")

        if (!response.ok) {
          throw new Error("Failed to fetch service fees")
        }

        const data = await response.json()
        setFees(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching fees:", error)
        toast({
          title: "Warning",
          description: "Using default pricing. Some fees may not be current.",
          variant: "destructive",
        })
        setFees([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFees()
  }, [toast])

  const getServiceFee = (serviceType: keyof typeof DEFAULT_FEES): number => {
    const fee = fees.find((f) => f.serviceType === serviceType)
    return fee?.amount ?? DEFAULT_FEES[serviceType]
  }

  return {
    fees,
    isLoading,
    getServiceFee,
  }
}
