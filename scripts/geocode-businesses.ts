import { geocodeAddress } from '../src/lib/geocoding'
import { prisma } from '../src/lib/prisma'

// Test coordinates for businesses without real addresses
const testCoordinates = [
  { lat: 37.7749, lng: -122.4194 }, // San Francisco
  { lat: 37.7849, lng: -122.4094 }, // San Francisco - North
  { lat: 37.7649, lng: -122.4294 }, // San Francisco - South
  { lat: 37.7749, lng: -122.4394 }, // San Francisco - West
  { lat: 37.7749, lng: -122.3994 }, // San Francisco - East
  { lat: 37.7899, lng: -122.4144 }, // San Francisco - NE
  { lat: 37.7599, lng: -122.4244 }, // San Francisco - SW
  { lat: 37.7799, lng: -122.4344 }, // San Francisco - NW
  { lat: 37.7699, lng: -122.4044 }, // San Francisco - SE
]

async function geocodeBusinesses() {
  try {
    console.log('Starting geocoding process...')

    // Get all businesses without coordinates
    const businesses = await prisma.business.findMany({
      where: {
        OR: [{ latitude: null }, { longitude: null }],
      },
    })

    console.log(`Found ${businesses.length} businesses to geocode`)

    let geocoded = 0
    let useTestData = 0

    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i]

      // For development, use test coordinates if geocoding fails
      let latitude: number | null = null
      let longitude: number | null = null

      // Try to geocode the actual address
      if (process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
        const result = await geocodeAddress(
          business.address,
          business.city,
          business.state,
          business.zipCode
        )

        if (result) {
          latitude = result.latitude
          longitude = result.longitude
          geocoded++
          console.log(`✓ Geocoded: ${business.businessName}`)
        }
      }

      // If geocoding failed or no token, use test coordinates
      if (!latitude || !longitude) {
        const testCoord = testCoordinates[i % testCoordinates.length]
        // Add some randomization to spread businesses out
        latitude = testCoord.lat + (Math.random() - 0.5) * 0.01
        longitude = testCoord.lng + (Math.random() - 0.5) * 0.01
        useTestData++
        console.log(`⚠ Using test coordinates for: ${business.businessName}`)
      }

      // Update the business
      await prisma.business.update({
        where: { id: business.id },
        data: {
          latitude,
          longitude,
        },
      })

      // Rate limiting
      if (process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && i < businesses.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    console.log('\n✅ Geocoding complete!')
    console.log(`- Geocoded with real addresses: ${geocoded}`)
    console.log(`- Used test coordinates: ${useTestData}`)
    console.log(`- Total processed: ${businesses.length}`)
  } catch (error) {
    console.error('Error geocoding businesses:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
geocodeBusinesses()
