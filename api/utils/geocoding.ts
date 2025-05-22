/**
 * Geocoding utilities for location-based job matching
 * Provides functions to convert addresses to coordinates and calculate distances
 */

// Coordinates interface for storing latitude and longitude
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @param point1 First coordinate point
 * @param point2 Second coordinate point
 * @returns Distance in kilometers
 */
export const calculateDistance = (point1: Coordinates, point2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  
  // Convert latitude and longitude from degrees to radians
  const lat1Rad = (point1.latitude * Math.PI) / 180;
  const lon1Rad = (point1.longitude * Math.PI) / 180;
  const lat2Rad = (point2.latitude * Math.PI) / 180;
  const lon2Rad = (point2.longitude * Math.PI) / 180;
  
  // Haversine formula
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convert kilometers to miles
 * @param kilometers Distance in kilometers
 * @returns Distance in miles
 */
export const kilometersToMiles = (kilometers: number): number => {
  return kilometers * 0.621371;
};

/**
 * Calculate location match score based on distance
 * @param distance Distance in kilometers
 * @param maxDistance Maximum acceptable distance in kilometers
 * @returns Score between 0 and 1, where 1 is perfect match (same location)
 */
export const calculateLocationMatchScore = (
  distance: number, 
  maxDistance: number = 50
): number => {
  if (distance <= 0) return 1; // Same location
  if (distance >= maxDistance) return 0; // Too far
  
  // Linear score: closer = higher score
  return 1 - (distance / maxDistance);
};

/**
 * Mock geocoding function - in a production environment, this would call a real geocoding API
 * @param address Address or location string to geocode
 * @returns Coordinates or null if geocoding failed
 */
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  // This is a mock implementation with some common locations
  // In production, you would use a real geocoding API like Google Maps, Mapbox, etc.
  const geocodingMock: Record<string, Coordinates> = {
    // Major cities
    'london': { latitude: 51.5074, longitude: -0.1278 },
    'manchester': { latitude: 53.4808, longitude: -2.2426 },
    'birmingham': { latitude: 52.4862, longitude: -1.8904 },
    'leeds': { latitude: 53.8008, longitude: -1.5491 },
    'liverpool': { latitude: 53.4084, longitude: -2.9916 },
    'newcastle': { latitude: 54.9783, longitude: -1.6178 },
    'sheffield': { latitude: 53.3811, longitude: -1.4701 },
    'bristol': { latitude: 51.4545, longitude: -2.5879 },
    'cardiff': { latitude: 51.4816, longitude: -3.1791 },
    'edinburgh': { latitude: 55.9533, longitude: -3.1883 },
    'glasgow': { latitude: 55.8642, longitude: -4.2518 },
    'belfast': { latitude: 54.5973, longitude: -5.9301 },
    'dublin': { latitude: 53.3498, longitude: -6.2603 },
    
    // Add more locations as needed
  };
  
  // Normalize the address for lookup
  const normalizedAddress = address.toLowerCase().trim();
  
  // Check for exact matches
  if (geocodingMock[normalizedAddress]) {
    return geocodingMock[normalizedAddress];
  }
  
  // Check for partial matches
  for (const [key, coords] of Object.entries(geocodingMock)) {
    if (normalizedAddress.includes(key) || key.includes(normalizedAddress)) {
      return coords;
    }
  }
  
  // No match found
  console.log(`Could not geocode address: ${address}`);
  return null;
};
