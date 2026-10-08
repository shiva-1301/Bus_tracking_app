import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-search.html'
})
export class MapSearchComponent {
  latitude: number | null = null;
  longitude: number | null = null;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.getLocation();
  }

  get mapsUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${this.latitude},${this.longitude}`;
  }

  getLocation() {
    this.errorMessage = '';

    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      this.errorMessage = 'Your browser does not support location services.';
      return;
    }

    this.isLoading = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error getting location:', error);
        this.isLoading = false;
        this.errorMessage = error.code === 1
          ? 'Location permission was denied. Allow location access for this site in your browser settings, then try again.'
          : 'We could not determine your location. Please check that location services are on and try again.';
      }
    );
  }
}
