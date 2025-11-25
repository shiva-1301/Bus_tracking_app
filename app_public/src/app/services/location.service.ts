import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, catchError, of, tap } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

export interface LocationData {
  busNumber: string;
  driverId: string;
  latitude: number;
  longitude: number;
  startLocation: string;
  endLocation: string;
  timestamp: Date;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/api/locations';
  private coordinatesUrl = 'http://localhost:3000/api/coordinates';
  private currentLocation = new BehaviorSubject<LocationData | null>(null);
  private trackingActive = false;
  private updateInterval = 60000; // Update every minute
  private locationUpdateSubscription: any;

  constructor(private http: HttpClient) { }

  // Start tracking location for a trip
  startTracking(tripData: {
    busNumber: string;
    driverId: string;
    startLocation: string;
    endLocation: string;
    latitude: number;
    longitude: number;
  }): Observable<LocationData> {
    this.trackingActive = true;
    
    console.log('Starting trip tracking with data:', tripData);
    
    // Send initial location to backend
    return this.http.post<LocationData>(`${this.apiUrl}/start`, tripData).pipe(
      switchMap(location => {
        console.log('Trip started successfully:', location);
        this.currentLocation.next(location);
        
        // Set up periodic updates
        this.locationUpdateSubscription = interval(this.updateInterval).subscribe(() => {
          if (this.trackingActive) {
            this.captureLocation(tripData);
          }
        });
        
        return this.currentLocation.asObservable() as Observable<LocationData>;
      }),
      catchError((error: any) => {
        console.error('Error starting trip tracking:', error);
        const errorMessage = error.error?.error || error.error?.message || error.message || 'Unknown error occurred while starting trip';
        throw new Error(`Failed to start trip: ${errorMessage}`);
      })
    );
  }

  // Stop tracking location
  stopTracking(driverId: string): Observable<any> {
    this.trackingActive = false;
    
    // Unsubscribe from location updates
    if (this.locationUpdateSubscription) {
      this.locationUpdateSubscription.unsubscribe();
    }
    
    // Send end tracking request to backend
    return this.http.post(`${this.apiUrl}/end`, { driverId }).pipe(
      catchError((error: any) => {
        console.error('Error in stopTracking:', error);
        // Return a more detailed error
        const errorMessage = error.error?.error || error.error?.message || error.message || 'Unknown error occurred while ending trip';
        throw new Error(`Failed to end trip: ${errorMessage}`);
      })
    );
  }

  // Get current location and save it
  private captureLocation(tripData: any): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationUpdate = {
            driverId: tripData.driverId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          // Update location in backend
          this.http.put(`${this.apiUrl}/update`, locationUpdate).subscribe(
            (updatedLocation: any) => {
              this.currentLocation.next(updatedLocation);
            },
            (error) => {
              console.error('Error updating location:', error);
            }
          );
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  // This method is no longer needed as we're using the backend API

  // Get all active bus locations
  getAllBusLocations(): Observable<LocationData[]> {
    return this.http.get<LocationData[]>(this.apiUrl);
  }

  // Get locations for a specific bus number
  getBusLocationsByNumber(busNumber: string): Observable<LocationData[]> {
    return this.http.get<LocationData[]>(`${this.apiUrl}/bus/${busNumber}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching bus locations:', error);
        return of([]); // Return empty array on error
      }),
      // Add debugging to see what we're getting
      tap((locations: LocationData[]) => {
        console.log('Received locations for bus', busNumber, ':', locations);
      })
    );
  }
  
  // Mock data is no longer needed

  // Check if tracking is active
  isTrackingActive(): boolean {
    return this.trackingActive;
  }
}