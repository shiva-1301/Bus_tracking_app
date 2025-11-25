import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Add this import

@Component({
  selector: 'app-map-search',
  standalone: true, // ✅ required for standalone components
  imports: [CommonModule], // ✅ add this line
  templateUrl: './map-search.html',
  styleUrls: ['./map-search.css']
})
export class MapSearchComponent {
  latitude: number | null = null;
  longitude: number | null = null;

  constructor() {
    this.getLocation();
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }
}
