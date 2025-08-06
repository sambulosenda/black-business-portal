'use client'

import { AlertCircle, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function BusinessMapFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-50 p-8">
      <Card className="w-full max-w-md p-6 text-center">
        <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <MapPin className="text-primary h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Map View Unavailable</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          To use the map view, you need to configure a Mapbox access token.
        </p>
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-amber-800">Setup Instructions:</p>
              <ol className="mt-2 space-y-1 text-sm text-amber-700">
                <li>
                  1. Create a free account at{' '}
                  <a
                    href="https://mapbox.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    mapbox.com
                  </a>
                </li>
                <li>2. Copy your default public token</li>
                <li>3. Add it to your .env file as NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</li>
                <li>4. Restart your development server</li>
              </ol>
            </div>
          </div>
        </div>
        <a
          href="https://account.mapbox.com/access-tokens/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            Get Access Token →
          </Button>
        </a>
      </Card>
    </div>
  )
}
