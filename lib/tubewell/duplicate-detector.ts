// lib/tubewell/duplicate-detector.ts
/**
 * Detect potential duplicate tube wells based on proximity
 */

import { prisma } from '@/lib/prisma';

interface NearbyTubeWell {
  id: string;
  assetId: string;
  tubeWellNumber: string;
  distance: number; // in meters
  functionalStatus: string;
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

/**
 * Find nearby tube wells within a specified radius
 * @param latitude - Latitude of the new tube well
 * @param longitude - Longitude of the new tube well
 * @param radiusMeters - Search radius in meters (default 30m)
 * @returns Array of nearby tube wells
 */
export async function findNearbyTubeWells(
  latitude: number,
  longitude: number,
  radiusMeters: number = 30
): Promise<NearbyTubeWell[]> {
  // Get all tube wells with valid coordinates
  const tubeWells = await prisma.tubeWell.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      isDeleted: false,
    },
    select: {
      id: true,
      assetId: true,
      tubeWellNumber: true,
      latitude: true,
      longitude: true,
      functionalStatus: true,
    },
  });

  const nearby: NearbyTubeWell[] = [];

  for (const tw of tubeWells) {
    if (tw.latitude !== null && tw.longitude !== null) {
      const distance = calculateDistance(latitude, longitude, tw.latitude, tw.longitude);
      if (distance > 0 && distance <= radiusMeters) {
        nearby.push({
          id: tw.id,
          assetId: tw.assetId,
          tubeWellNumber: tw.tubeWellNumber,
          distance: Math.round(distance),
          functionalStatus: tw.functionalStatus,
        });
      }
    }
  }

  // Sort by distance
  return nearby.sort((a, b) => a.distance - b.distance);
}
