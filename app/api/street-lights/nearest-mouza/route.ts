import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Normalize text for fuzzy matching
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") ?? "");
    const lng = parseFloat(searchParams.get("lng") ?? "");

    if (!isFinite(lat) || !isFinite(lng)) {
      return NextResponse.json(
        { error: "Valid lat and lng query params are required" },
        { status: 400 }
      );
    }

    // Step 1: Check existing street lights for proximity matching
    const recent = await db.streetLight.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        mouzaId: true,
        latitude: true,
        longitude: true,
        mouza: {
          select: {
            id: true,
            mouzaName: true,
            mouzaCode: true,
            sansadCode: true,
            gramSansad: true,
          },
        },
      },
      take: 3000,
      orderBy: { updatedAt: "desc" },
    });

    let bestFromAsset: {
      mouzaId: string;
      distance: number;
      mouza: {
        id: string;
        mouzaName: string;
        mouzaCode: string;
        sansadCode?: string | null;
        gramSansad: string;
      };
    } | null = null;

    for (const row of recent) {
      if (row.latitude == null || row.longitude == null) continue;
      const d = haversineKm(lat, lng, row.latitude, row.longitude);
      if (!bestFromAsset || d < bestFromAsset.distance) {
        bestFromAsset = { mouzaId: row.mouzaId, distance: d, mouza: row.mouza };
      }
    }

    // Step 2: Try reverse geocoding via OpenStreetMap Nominatim
    let detectedLocationName: string | null = null;
    let suggestedLandmark: string | null = null;
    let matchedMouzaFromGeo: {
      id: string;
      mouzaName: string;
      mouzaCode: string;
      sansadCode?: string | null;
      gramSansad: string;
    } | null = null;

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "DhalparaGP-StreetLightSurvey/1.0",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(3500),
        }
      );

      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const address = geoData.address || {};
        const village = address.village || address.hamlet || address.suburb || address.neighbourhood;
        const road = address.road;
        const landmark = address.amenity || address.shop || address.building || address.leisure;

        if (village) {
          detectedLocationName = village;
        } else if (road) {
          detectedLocationName = road;
        }

        if (landmark && road) {
          suggestedLandmark = `Near ${landmark}, ${road}`;
        } else if (landmark) {
          suggestedLandmark = `Near ${landmark}`;
        } else if (road) {
          suggestedLandmark = `On ${road}`;
        }

        // Match with MouzaMaster records in DB
        const allMouzas = await db.mouzaMaster.findMany({
          select: {
            id: true,
            mouzaName: true,
            mouzaCode: true,
            sansadCode: true,
            gramSansad: true,
          },
        });

        if (village) {
          const normVillage = normalizeText(village);
          const matched = allMouzas.find(
            (m) =>
              normalizeText(m.mouzaName).includes(normVillage) ||
              normVillage.includes(normalizeText(m.mouzaName)) ||
              normalizeText(m.gramSansad).includes(normVillage)
          );
          if (matched) {
            matchedMouzaFromGeo = matched;
          }
        }
      }
    } catch {
      // Nominatim lookup timed out or failed; silently continue
    }

    // Determine final choice
    // If we have a very close asset (< 1.5 km), prefer that
    if (bestFromAsset && bestFromAsset.distance <= 1.5) {
      return NextResponse.json({
        mouza: bestFromAsset.mouza,
        mouzaId: bestFromAsset.mouzaId,
        distanceKm: Number(bestFromAsset.distance.toFixed(3)),
        detectedLocationName: detectedLocationName || bestFromAsset.mouza.mouzaName,
        suggestedLandmark,
        source: "nearest_asset",
        sampleCount: recent.length,
      });
    }

    // If reverse geocoding found an exact Mouza match
    if (matchedMouzaFromGeo) {
      return NextResponse.json({
        mouza: matchedMouzaFromGeo,
        mouzaId: matchedMouzaFromGeo.id,
        distanceKm: bestFromAsset ? Number(bestFromAsset.distance.toFixed(3)) : null,
        detectedLocationName: detectedLocationName || matchedMouzaFromGeo.mouzaName,
        suggestedLandmark,
        source: "reverse_geocode",
        sampleCount: recent.length,
      });
    }

    // If we have an asset match at any distance
    if (bestFromAsset) {
      return NextResponse.json({
        mouza: bestFromAsset.mouza,
        mouzaId: bestFromAsset.mouzaId,
        distanceKm: Number(bestFromAsset.distance.toFixed(3)),
        detectedLocationName: detectedLocationName || bestFromAsset.mouza.mouzaName,
        suggestedLandmark,
        source: "nearest_asset_approximate",
        sampleCount: recent.length,
      });
    }

    // Fallback: Return first Mouza in DB if available
    const firstMouza = await db.mouzaMaster.findFirst({
      select: {
        id: true,
        mouzaName: true,
        mouzaCode: true,
        sansadCode: true,
        gramSansad: true,
      },
      orderBy: { mouzaName: "asc" },
    });

    if (firstMouza) {
      return NextResponse.json({
        mouza: firstMouza,
        mouzaId: firstMouza.id,
        distanceKm: null,
        detectedLocationName,
        suggestedLandmark,
        source: "default",
        sampleCount: 0,
      });
    }

    return NextResponse.json({
      mouza: null,
      mouzaId: null,
      distanceKm: null,
      detectedLocationName,
      suggestedLandmark,
      source: "none",
    });
  } catch (error) {
    console.error("GET /api/street-lights/nearest-mouza error:", error);
    return NextResponse.json(
      { error: "Failed to resolve mouza" },
      { status: 500 }
    );
  }
}
