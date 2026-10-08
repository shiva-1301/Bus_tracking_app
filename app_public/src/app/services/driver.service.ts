import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';

export interface Driver {
  _id: string;
  email: string;
  busNumber: string;
  driverId: string; // Add this field
  currentLocation: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Search for drivers by bus number
  searchDriversByBusNumber(busNumber: string): Observable<Driver[]> {
    console.log('Searching for drivers with bus number:', busNumber);
    return this.http.get<Driver[]>(`${this.apiUrl}/search/bus/${busNumber}`).pipe(
      catchError((error: any) => {
        console.error('Error searching drivers by bus number:', error);
        throw error;
      }),
      // Add debugging to see what we're getting
      tap((drivers: Driver[]) => {
        console.log('Received drivers for bus', busNumber, ':', drivers);
      })
    );
  }
  
  // Add a bus to tracking
  addBusToTracking(driver: Driver): void {
    const trackedBuses = JSON.parse(localStorage.getItem('trackedBuses') || '[]');
    // Use the driver's driverId field, not _id
    const existingIndex = trackedBuses.findIndex((bus: any) => bus.driverId === driver.driverId);
    
    console.log('Adding bus to tracking. Driver data:', driver);
    console.log('Existing tracked buses:', trackedBuses);
    console.log('Existing index:', existingIndex);
    
    if (existingIndex !== -1) {
      trackedBuses[existingIndex] = {
        driverId: driver.driverId, // Use driverId, not _id
        email: driver.email,
        busNumber: driver.busNumber,
        latitude: driver.currentLocation?.lat || 0,
        longitude: driver.currentLocation?.lng || 0,
        timestamp: driver.currentLocation?.timestamp || new Date(),
        tripExpired: false
      };
    } else {
      trackedBuses.push({
        driverId: driver.driverId, // Use driverId, not _id
        email: driver.email,
        busNumber: driver.busNumber,
        latitude: driver.currentLocation?.lat || 0,
        longitude: driver.currentLocation?.lng || 0,
        timestamp: driver.currentLocation?.timestamp || new Date(),
        tripExpired: false
      });
    }
    
    console.log('Tracked buses after adding:', trackedBuses);
    localStorage.setItem('trackedBuses', JSON.stringify(trackedBuses));
  }
}