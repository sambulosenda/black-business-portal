'use client';

import { MapPin, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function BusinessMapFallback() {
  return (
    <div className="h-full w-full bg-gray-50 flex items-center justify-center p-8">
      <Card className="max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Map View Unavailable</h3>
        <p className="text-sm text-muted-foreground mb-4">
          To use the map view, you need to configure a Mapbox access token.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm text-amber-800 font-medium">Setup Instructions:</p>
              <ol className="text-sm text-amber-700 mt-2 space-y-1">
                <li>1. Create a free account at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a></li>
                <li>2. Copy your default public token</li>
                <li>3. Add it to your .env file as NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</li>
                <li>4. Restart your development server</li>
              </ol>
            </div>
          </div>
        </div>
        <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            Get Access Token →
          </Button>
        </a>
      </Card>
    </div>
  );
}