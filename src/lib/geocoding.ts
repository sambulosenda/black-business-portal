// Geocoding service using Mapbox API
// Converts addresses to latitude/longitude coordinates

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<GeocodingResult | null> {
  if (!MAPBOX_ACCESS_TOKEN) {
    console.error('Mapbox access token is not configured');
    return null;
  }

  const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
  const encodedAddress = encodeURIComponent(fullAddress);
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.center;
      
      return {
        latitude,
        longitude,
        formattedAddress: feature.place_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Batch geocode multiple addresses (useful for initial setup)
export async function batchGeocodeAddresses(
  businesses: Array<{
    id: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }>
): Promise<Map<string, GeocodingResult | null>> {
  const results = new Map<string, GeocodingResult | null>();
  
  // Process in batches to respect rate limits
  const batchSize = 5;
  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    
    const promises = batch.map(async (business) => {
      const result = await geocodeAddress(
        business.address,
        business.city,
        business.state,
        business.zipCode
      );
      results.set(business.id, result);
    });
    
    await Promise.all(promises);
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < businesses.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // Distance in kilometers
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Get bounding box for a given center point and radius
export function getBoundingBox(
  latitude: number,
  longitude: number,
  radiusKm: number
): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  const latRadian = toRad(latitude);
  
  // Earth's radius in km
  const R = 6371;
  
  // Angular distance in radians
  const radDist = radiusKm / R;
  
  const minLat = latitude - toDeg(radDist);
  const maxLat = latitude + toDeg(radDist);
  
  const deltaLng = Math.asin(Math.sin(radDist) / Math.cos(latRadian));
  const minLng = longitude - toDeg(deltaLng);
  const maxLng = longitude + toDeg(deltaLng);
  
  return { minLat, maxLat, minLng, maxLng };
}

function toDeg(radians: number): number {
  return radians * (180 / Math.PI);
}