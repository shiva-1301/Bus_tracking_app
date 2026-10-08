import { environment } from '../../environments/environment';

/** Static map thumbnail URL, or '' when no Maps API key is configured. */
export function staticMapUrl(lat: number, lng: number, width = 400, height = 200): string {
  const key = environment.googleMapsApiKey;
  if (!key || !isFinite(lat) || !isFinite(lng)) return '';
  const pos = `${lat},${lng}`;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${pos}&zoom=15&size=${width}x${height}&scale=2&markers=color:red%7C${pos}&key=${encodeURIComponent(key)}`;
}

/** Link that opens the position in Google Maps (no API key needed). */
export function mapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/** A driver/bus has a usable live position (0,0 is the backend's "no trip" marker). */
export function hasPosition(lat?: number | null, lng?: number | null): boolean {
  return typeof lat === 'number' && typeof lng === 'number' && (lat !== 0 || lng !== 0);
}
