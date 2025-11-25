import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { Subscription, interval, Observable } from 'rxjs';

@Component({
  selector: 'app-start-trip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <div class="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-blue-700 mb-6">Start Trip</h1>
        
        <div class="mb-6">
          <p class="text-gray-700">Driver ID: <span class="font-semibold">{{driverId}}</span></p>
        </div>
        
        <div *ngIf="!isTracking">
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">Bus Number</label>
            <input 
              [(ngModel)]="busNumber" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter bus number"
            />
          </div>
          
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">Start Location</label>
            <input 
              [(ngModel)]="startLocation" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter start location"
            />
          </div>
          
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">End Location</label>
            <input 
              [(ngModel)]="endLocation" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter end location"
            />
          </div>
          
          <div class="flex justify-center">
            <button 
              (click)="startTrip()" 
              [disabled]="!startLocation || !endLocation"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Trip Now
            </button>
          </div>
        </div>
        
        <div *ngIf="isTracking" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 class="text-xl font-semibold text-green-700 mb-3">Trip in Progress</h2>
          
          <div class="mb-4">
            <p><strong>From:</strong> {{startLocation}}</p>
            <p><strong>To:</strong> {{endLocation}}</p>
          </div>
          
          <div class="mb-4 p-3 bg-white rounded-lg">
            <p><strong>Timer:</strong> {{timerValue}} seconds</p>
          </div>
          
          <div *ngIf="currentCoordinate" class="mb-4 p-3 bg-white rounded-lg border">
            <p class="font-semibold">Latest Update</p>
            <p>Latitude: {{currentCoordinate.latitude}}</p>
            <p>Longitude: {{currentCoordinate.longitude}}</p>
            <p class="text-sm text-gray-500">Timestamp: {{currentCoordinate.timestamp | date:'medium'}}</p>
          </div>
          
          <button 
            (click)="endTrip()" 
            class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition transform hover:scale-[1.02]"
          >
            End Trip
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class StartTripComponent implements OnInit, OnDestroy {
  busNumber: string = '';
  driverId: string = '';
  startLocation: string = '';
  endLocation: string = '';
  isTracking: boolean = false;
  currentLocation: any = null;
  timerValue: number = 0;
  currentCoordinate: any = null;
  
  private locationSubscription?: Subscription;
  private coordinateSubscription?: Subscription;
  private timerSubscription?: Subscription;
  private visibilityChangeHandler?: () => void;
  private beforeUnloadHandler?: () => void;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService, 
    private router: Router,
    private locationService: LocationService
  ) {}
  
  ngOnInit(): void {
    // In a real app, you would fetch the driver's details from the backend
    // For now, we'll just check if the user is a driver
    if (!this.authService.isDriver()) {
      this.router.navigate(['/']);
    }
    
    // Get driver information from auth service
    // In a real app, you would get this from the backend
    this.driverId = this.authService.getDriverId(); // This should be the actual driver ID
    
    // Try to restore trip state from localStorage
    this.restoreTripState();
    
    // Restore form data if available
    this.restoreFormData();
    
    // Validate that the restored trip is still valid
    if (this.isTracking) {
      this.validateActiveTrip();
    }
    
    // Set up page visibility handler
    this.setupVisibilityHandler();
    
    // Set up before unload handler
    this.setupBeforeUnloadHandler();
  }
  
  startTrip(): void {
    if (!this.busNumber || !this.startLocation || !this.endLocation) {
      alert('Please enter bus number, start location, and end location');
      return;
    }
    
    // Check if there's already an active trip
    if (this.isTracking) {
      if (confirm('You already have an active trip. Do you want to start a new trip? This will end the current trip.')) {
        // End the current trip first
        this.endTrip();
        // Wait a bit for the trip to end before starting a new one
        setTimeout(() => {
          this.proceedWithStartTrip();
        }, 1000);
      }
      return;
    }
    
    this.proceedWithStartTrip();
  }
  
  private proceedWithStartTrip(): void {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Save form data
          this.saveFormData();
          
          // Start location tracking with current location
          this.locationSubscription = this.locationService.startTracking({
            busNumber: this.busNumber,
            driverId: this.driverId,
            startLocation: this.startLocation,
            endLocation: this.endLocation,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }).subscribe({
            next: (location) => {
              this.currentLocation = location;
              this.isTracking = true;
              
              // Save trip state
              this.saveTripState();
              
              // Start periodic coordinate updates every minute
              this.startCoordinateUpdates();
              
              // Start the 60-second timer
              this.startTimer();
              
              // Initialize with current coordinates
              this.getCurrentCoordinates();
            },
            error: (error) => {
              console.error('Error starting trip:', error);
              const errorMessage = error.error?.error || error.error?.message || error.message || 'Please try again.';
              alert('Error starting trip: ' + errorMessage);
            }
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get current location. Please try again.');
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      alert('Geolocation is not supported by your browser.');
    }
  }
  
  endTrip(): void {
    // Stop coordinate updates
    if (this.coordinateSubscription) {
      this.coordinateSubscription.unsubscribe();
    }
    
    // Stop timer
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    // Delete all coordinates for this driver from the database
    this.deleteDriverCoordinates().subscribe({
      next: (response) => {
        console.log('Coordinates deleted successfully:', response);
        
        // Now stop tracking after coordinates are deleted
        this.locationService.stopTracking(this.driverId).subscribe(
          () => {
            this.isTracking = false;
            this.clearFormData();
            this.currentCoordinate = null;
            this.timerValue = 0;
            
            // Clear trip state from localStorage
            this.clearTripState();
            
            // Remove event handlers
            this.removeVisibilityHandler();
            this.removeBeforeUnloadHandler();
            
            alert('Trip ended successfully! All your location data has been removed from the system.');
          },
          (error) => {
            console.error('Error stopping tracking:', error);
            const errorMessage = error.error?.error || error.error?.message || error.message || 'Please try again.';
            // Even if there's an error, clear the local state
            this.isTracking = false;
            this.clearFormData();
            this.currentCoordinate = null;
            this.timerValue = 0;
            this.clearTripState();
            alert('Trip ended successfully! Note: There was an issue with the server. Error: ' + errorMessage);
          }
        );
      },
      error: (error) => {
        console.error('Error deleting coordinates:', error);
        // Still try to stop tracking even if coordinate deletion fails
        this.locationService.stopTracking(this.driverId).subscribe(
          () => {
            this.isTracking = false;
            this.clearFormData();
            this.currentCoordinate = null;
            this.timerValue = 0;
            
            // Clear trip state from localStorage
            this.clearTripState();
            
            // Remove event handlers
            this.removeVisibilityHandler();
            this.removeBeforeUnloadHandler();
            
            alert('Trip ended successfully! Note: There was an issue removing your location data from the system. Error: ' + 
                  (error.error?.message || error.message || 'Unknown error'));
          },
          (stopError) => {
            console.error('Error stopping tracking:', stopError);
            const errorMessage = stopError.error?.error || stopError.error?.message || stopError.message || 'Please try again.';
            // Even if there's an error, clear the local state
            this.isTracking = false;
            this.clearFormData();
            this.currentCoordinate = null;
            this.timerValue = 0;
            this.clearTripState();
            alert('Trip ended with issues: ' + errorMessage);
          }
        );
      }
    });
  }
  
  private deleteDriverCoordinates(): Observable<any> {
    // Get the auth token
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    // Send request to delete all coordinates for this driver
    return this.http.post('http://localhost:3000/api/coordinates/delete', { 
      driverId: this.driverId 
    }, { headers });
  }
  
  private saveFormData(): void {
    localStorage.setItem('tripData', JSON.stringify({
      startLocation: this.startLocation,
      endLocation: this.endLocation
    }));
  }

  private restoreFormData(): void {
    const savedData = localStorage.getItem('tripData');
    if (savedData) {
      const data = JSON.parse(savedData);
      this.startLocation = data.startLocation || '';
      this.endLocation = data.endLocation || '';
    }
  }

  private clearFormData(): void {
    localStorage.removeItem('tripData');
  }
  
  // Save trip state to localStorage
  private saveTripState(): void {
    const tripState = {
      isTracking: this.isTracking,
      busNumber: this.busNumber,
      startLocation: this.startLocation,
      endLocation: this.endLocation,
      currentCoordinate: this.currentCoordinate,
      timerValue: this.timerValue,
      lastUpdate: Date.now()
    };
    localStorage.setItem('tripState', JSON.stringify(tripState));
  }
  
  // Restore trip state from localStorage
  private restoreTripState(): void {
    const savedState = localStorage.getItem('tripState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        // Only restore tracking state if it's reasonably recent (less than 1 hour old)
        if (state.lastUpdate && (Date.now() - state.lastUpdate) < 3600000) {
          this.isTracking = state.isTracking || false;
          this.busNumber = state.busNumber || '';
          this.startLocation = state.startLocation || '';
          this.endLocation = state.endLocation || '';
          this.currentCoordinate = state.currentCoordinate || null;
          this.timerValue = state.timerValue || 0;
          
          // Adjust timer based on time elapsed since last update
          if (state.lastUpdate) {
            const elapsed = Math.floor((Date.now() - state.lastUpdate) / 1000);
            this.timerValue = Math.min(this.timerValue + elapsed, 60);
          }
        } else {
          // Clear old state
          this.clearTripState();
        }
      } catch (e) {
        console.error('Error parsing trip state:', e);
        this.clearTripState();
      }
    }
  }
  
  // Clear trip state from localStorage
  private clearTripState(): void {
    localStorage.removeItem('tripState');
  }
  
  // Set up page visibility handler
  private setupVisibilityHandler(): void {
    this.visibilityChangeHandler = () => {
      if (document.hidden) {
        // Page is hidden, save the current state
        this.saveTripState();
      } else {
        // Page is visible again, restore state and continue timer
        this.restoreTripState();
        if (this.isTracking) {
          this.startTimer();
        }
      }
    };
    
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }
  
  // Remove page visibility handler
  private removeVisibilityHandler(): void {
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = undefined;
    }
  }
  
  // Set up before unload handler
  private setupBeforeUnloadHandler(): void {
    this.beforeUnloadHandler = () => {
      // Save state before page unload
      this.saveTripState();
    };
    
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }
  
  // Remove before unload handler
  private removeBeforeUnloadHandler(): void {
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      this.beforeUnloadHandler = undefined;
    }
  }
  
  // Start the 60-second timer
  private startTimer(): void {
    // If timer is already running, stop it first
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timerValue++;
      
      // Save the updated timer value
      this.saveTripState();
      
      if (this.timerValue >= 60) {
        this.timerValue = 0;
        this.getCurrentCoordinates();
        // Save state after getting new coordinates
        this.saveTripState();
      }
    });
  }
  
  // Get current coordinates and replace the displayed coordinate
  private getCurrentCoordinates(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date()
          };
          
          // Replace the current coordinate with the new one
          this.currentCoordinate = newCoordinate;
          
          // Save the updated coordinate
          this.saveTripState();
          
          // Send coordinates to the coordinates API
          this.sendCoordinatesToAPI(newCoordinate);
        },
        (error) => {
          console.error('Error getting current coordinates:', error);
        }
      );
    }
  }
  
  // Send coordinates to the coordinates API
  private sendCoordinatesToAPI(coordinate: any): void {
    const coordinatesData = {
      driverId: this.driverId,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude
    };
    
    // Get the auth token
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    this.http.put('http://localhost:3000/api/coordinates', coordinatesData, { headers }).subscribe(
      response => {
        console.log('Coordinates updated successfully:', response);
      },
      error => {
        console.error('Error updating coordinates:', error);
      }
    );
  }
  
  // Start periodic coordinate updates every minute (60000 milliseconds)
  private startCoordinateUpdates(): void {
    // If coordinate updates are already running, stop them first
    if (this.coordinateSubscription) {
      this.coordinateSubscription.unsubscribe();
    }
    
    this.coordinateSubscription = interval(60000).subscribe(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Send coordinates to the coordinates API
            const coordinatesData = {
              driverId: this.driverId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            
            // Get the auth token
            const token = this.authService.getToken();
            const headers = new HttpHeaders({
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            });
            
            this.http.put('http://localhost:3000/api/coordinates', coordinatesData, { headers }).subscribe(
              response => {
                console.log('Coordinates updated successfully:', response);
              },
              error => {
                console.error('Error updating coordinates:', error);
              }
            );
          },
          (error) => {
            console.error('Error getting location for coordinate update:', error);
          }
        );
      }
    });
  }
  
  // Validate that the restored trip is still active
  private validateActiveTrip(): void {
    // Send a request to the backend to check if the trip is still active
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    // Make a request to check if the trip is still active
    this.http.get(`http://localhost:3000/api/locations/check`, { headers }).subscribe(
      (response: any) => {
        console.log('Trip validation response:', response);
        if (response.activeTrip) {
          // If trip is still active, restart the timer and coordinate updates
          this.startTimer();
          this.startCoordinateUpdates();
        } else {
          // Reset the tracking state if the trip is not active
          this.isTracking = false;
          this.currentCoordinate = null;
          this.timerValue = 0;
          this.clearTripState();
        }
      },
      (error) => {
        console.error('Error validating trip status:', error);
        // If there's an error checking the trip status, assume it's not active
        this.isTracking = false;
        this.currentCoordinate = null;
        this.timerValue = 0;
        this.clearTripState();
      }
    );
  }
  
  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
    if (this.coordinateSubscription) {
      this.coordinateSubscription.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    // Remove event handlers
    this.removeVisibilityHandler();
    this.removeBeforeUnloadHandler();
  }
}