"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

export interface LocationMapProps {
  /** City name */
  city?: string;
  /** Region/State */
  region?: string;
  /** Country name */
  country?: string;
  /** Latitude for map center */
  latitude?: number;
  /** Longitude for map center */
  longitude?: number;
  /** Optional className for styling */
  className?: string;
}

/**
 * LocationMap - A simple static map visualization for IP location
 *
 * Uses OpenStreetMap static tiles to display a location marker.
 * Falls back to a styled placeholder if coordinates aren't available.
 *
 * @example
 * ```tsx
 * <LocationMap
 *   city="Lisbon"
 *   country="Portugal"
 *   latitude={38.7223}
 *   longitude={-9.1393}
 * />
 * ```
 */
export function LocationMap({
  city,
  region,
  country,
  latitude,
  longitude,
  className,
}: LocationMapProps) {
  const [imageError, setImageError] = useState(false);
  const hasCoordinates = latitude !== undefined && longitude !== undefined;
  const locationText = [city, region, country].filter(Boolean).join(", ");

  // Use staticmapmaker with OpenStreetMap tiles (free, no API key)
  // Alternative: geoapify free tier (requires API key) or MapTiler
  const _zoom = 10;
  const _width = 400;
  const _height = 150;

  // Note: Static map URL construction preserved for future API key integration
  // const mapUrl = hasCoordinates
  //   ? `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=${_width}&height=${_height}&center=lonlat:${longitude},${latitude}&zoom=${_zoom}&marker=lonlat:${longitude},${latitude};color:%23ff0000;size:medium&apiKey=YOUR_KEY`
  //   : null;

  // Fallback styled map visualization
  const FallbackMap = () => (
    <div className="absolute inset-0 bg-linear-to-br from-blue-100 via-blue-50 to-green-50 dark:from-blue-950 dark:via-blue-900 dark:to-green-950">
      {/* Grid lines to simulate map */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
      </div>
      {/* Center marker */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="absolute -inset-4 animate-ping rounded-full bg-red-500/20" />
          <div className="relative rounded-full bg-red-500 p-1.5 shadow-lg">
            <MapPin className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`relative overflow-hidden rounded-box border border-border ${className || ""}`}
    >
      {hasCoordinates ? (
        <>
          {/* Static map image */}
          <div className="relative h-32 w-full bg-muted">
            {!imageError ? (
              <>
                {/* Embed OpenStreetMap iframe as fallback since static image APIs need keys */}
                <iframe
                  title={`Map showing ${locationText}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.15},${latitude - 0.08},${longitude + 0.15},${latitude + 0.08}&layer=mapnik&marker=${latitude},${longitude}`}
                  className="pointer-events-none"
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <FallbackMap />
            )}
          </div>
          {/* Location label */}
          <div className="bg-card/95 px-3 py-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="text-sm">
                <span className="font-medium">
                  {locationText || "Unknown location"}
                </span>
                {hasCoordinates && (
                  <span className="text-muted-foreground ml-2 text-xs">
                    ({latitude.toFixed(2)}°, {longitude.toFixed(2)}°)
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Fallback for no coordinates */
        <div className="flex h-32 items-center justify-center bg-muted/50">
          <div className="text-center">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              {locationText || "Location unavailable"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
