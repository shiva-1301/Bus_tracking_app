// Production config. API calls go to the same origin (/api) unless apiUrl is set.
// NOTE: Google Maps keys are always visible in the browser. Restrict this key
// to your domain (HTTP referrer restriction) in Google Cloud Console.
export const environment = {
  production: true,
  apiUrl: '/api',
  googleMapsApiKey: '',
};
