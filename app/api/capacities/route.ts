// app/api/capacities/route.ts
import { NextResponse } from 'next/server'
import {db} from '@/lib/db'

export async function GET() {
  try {
    // Fetch all service capacities from the database
    const capacities = await db.serviceAvailability.groupBy({
      by: ['serviceType'],
      _max: {
        capacity: true
      }
    })

    // Create a map of serviceType to capacity
    const capacityMap = capacities.reduce((acc, item) => {
      acc[item.serviceType] = item._max.capacity || 3 // Fallback to 3 if null
      return acc
    }, {} as Record<string, number>)

    // Ensure both service types are present
    const result = {
      [ServiceType.WATER_TANKER]: capacityMap[ServiceType.WATER_TANKER] || 3,
      [ServiceType.DUSTBIN_VAN]: capacityMap[ServiceType.DUSTBIN_VAN] || 3
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch service capacities:', error)
    return NextResponse.json(
      {
        [ServiceType.WATER_TANKER]: 3,
        [ServiceType.DUSTBIN_VAN]: 3
      },
      { status: 200 } // Still return default values even on error
    )
  }
}

// Define the ServiceType enum locally for type safety
enum ServiceType {
  WATER_TANKER = 'WATER_TANKER',
  DUSTBIN_VAN = 'DUSTBIN_VAN'
}
