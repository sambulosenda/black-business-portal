'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { MapPin, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Business {
  id: string;
  businessName: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  services: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  reviews: Array<{
    rating: number;
  }>;
}

interface BusinessMapProps {
  businesses: Business[];
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  selectedBusinessId?: string | null;
  onBusinessSelect?: (businessId: string | null) => void;
}

export function BusinessMap({
  businesses,
  onBoundsChange,
  selectedBusinessId,
  onBusinessSelect,
}: BusinessMapProps) {
  const [viewState, setViewState] = useState({
    longitude: -122.4194, // Default to San Francisco
    latitude: 37.7749,
    zoom: 12,
  });
  const [popupBusiness, setPopupBusiness] = useState<Business | null>(null);
  const mapRef = useRef<any>(null);

  // Get businesses with valid coordinates
  const mappableBusinesses = businesses.filter(
    (b) => b.latitude !== null && b.longitude !== null
  );

  // Calculate average rating
  const getAverageRating = (reviews: Array<{ rating: number }>) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Get lowest price for display
  const getLowestPrice = (services: Array<{ price: number }>) => {
    if (services.length === 0) return 0;
    return Math.min(...services.map((s) => s.price));
  };

  // Center map on businesses when they load
  useEffect(() => {
    if (mappableBusinesses.length > 0 && mapRef.current) {
      const bounds = mappableBusinesses.reduce(
        (acc, business) => {
          return {
            minLng: Math.min(acc.minLng, business.longitude!),
            maxLng: Math.max(acc.maxLng, business.longitude!),
            minLat: Math.min(acc.minLat, business.latitude!),
            maxLat: Math.max(acc.maxLat, business.latitude!),
          };
        },
        {
          minLng: mappableBusinesses[0].longitude!,
          maxLng: mappableBusinesses[0].longitude!,
          minLat: mappableBusinesses[0].latitude!,
          maxLat: mappableBusinesses[0].latitude!,
        }
      );

      // Add padding to bounds
      const padding = 0.01;
      mapRef.current.fitBounds(
        [
          [bounds.minLng - padding, bounds.minLat - padding],
          [bounds.maxLng + padding, bounds.maxLat + padding],
        ],
        { duration: 1000 }
      );
    }
  }, [mappableBusinesses]);

  // Handle map move/zoom
  const handleMoveEnd = useCallback(() => {
    if (mapRef.current && onBoundsChange) {
      const bounds = mapRef.current.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    }
  }, [onBoundsChange]);

  return (
    <div className="h-full w-full relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        reuseMaps
      >
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
        />

        {mappableBusinesses.map((business) => (
          <Marker
            key={business.id}
            longitude={business.longitude!}
            latitude={business.latitude!}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupBusiness(business);
              onBusinessSelect?.(business.id);
            }}
          >
            <div
              className={`bg-white rounded-full px-3 py-1.5 shadow-lg border-2 cursor-pointer transform transition-all hover:scale-110 ${
                selectedBusinessId === business.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 hover:border-primary'
              }`}
            >
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="font-semibold text-sm">
                  ${getLowestPrice(business.services)}
                </span>
              </div>
            </div>
          </Marker>
        ))}

        {popupBusiness && (
          <Popup
            longitude={popupBusiness.longitude!}
            latitude={popupBusiness.latitude!}
            anchor="bottom"
            onClose={() => {
              setPopupBusiness(null);
              onBusinessSelect?.(null);
            }}
            closeButton={true}
            closeOnClick={false}
            className="business-popup"
          >
            <Link href={`/business/${popupBusiness.slug}`}>
              <Card className="w-72 overflow-hidden border-0 shadow-none">
                <div className="relative h-40">
                  <Image
                    src={popupBusiness.images[0] || '/placeholder.jpg'}
                    alt={popupBusiness.businessName}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {getAverageRating(popupBusiness.reviews)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">
                    {popupBusiness.businessName}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {popupBusiness.category}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {popupBusiness.city}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Open now
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      From ${getLowestPrice(popupBusiness.services)}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      View details →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </Popup>
        )}
      </Map>

      {/* Map controls hint */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-muted-foreground">
        <p>Use mouse to pan and zoom • Click markers for details</p>
      </div>

      {/* Results count */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
        <p className="text-sm font-medium">
          {mappableBusinesses.length} business{mappableBusinesses.length !== 1 ? 'es' : ''} in this area
        </p>
      </div>
    </div>
  );
}