import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { Subscription, interval, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-start-trip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page max-w-2xl">
      <header class="page-header flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="page-title">{{ isTracking ? 'Trip in progress' : 'Start a trip' }}</h1>
          <p class="page-subtitle">
            {{ isTracking
              ? 'Passengers can see your bus on the map. Keep this page open while driving.'
              : 'Enter your trip details. Your location will be shared with passengers every minute.' }}
          </p>
        </div>
        <span class="badge-neutral" [attr.title]="'Driver ID ' + (driverId || 'unknown')">
          Driver ID: <span class="font-mono">{{ driverId || '—' }}</span>
        </span>
      </header>

      <!-- Feedback -->
      <div aria-live="polite" class="mb-6 space-y-3 empty:mb-0">
        <div *ngIf="errorMessage" class="alert-error" role="alert">
          <span aria-hidden="true" class="font-bold">!</span>
          <span class="flex-1">{{ errorMessage }}</span>
          <button type="button" class="btn-ghost btn-sm -my-1 px-2" (click)="errorMessage = ''" aria-label="Dismiss error">&times;</button>
        </div>
        <div *ngIf="successMessage" class="alert-success" role="status">
          <span aria-hidden="true">✓</span>
          <span class="flex-1">{{ successMessage }}</span>
          <button type="button" class="btn-ghost btn-sm -my-1 px-2" (click)="successMessage = ''" aria-label="Dismiss message">&times;</button>
        </div>
      </div>

      <!-- Start form -->
      <form *ngIf="!isTracking" class="card space-y-5" (ngSubmit)="startTrip()" novalidate>
        <div>
          <label for="trip-bus" class="form-label">Bus number <span aria-hidden="true" class="text-red-600">*</span></label>
          <input
            id="trip-bus"
            name="busNumber"
            [(ngModel)]="busNumber"
            class="form-input"
            placeholder="e.g. 10K"
            autocomplete="off"
            required
            [attr.aria-invalid]="submitted && !busNumber.trim()"
            aria-describedby="trip-bus-error"
          />
          <p id="trip-bus-error" *ngIf="submitted && !busNumber.trim()" class="form-error">Bus number is required.</p>
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label for="trip-start" class="form-label">Start location <span aria-hidden="true" class="text-red-600">*</span></label>
            <input
              id="trip-start"
              name="startLocation"
              [(ngModel)]="startLocation"
              class="form-input"
              placeholder="Where does the trip begin?"
              required
              [attr.aria-invalid]="submitted && !startLocation.trim()"
              aria-describedby="trip-start-error"
            />
            <p id="trip-start-error" *ngIf="submitted && !startLocation.trim()" class="form-error">Start location is required.</p>
          </div>

          <div>
            <label for="trip-end" class="form-label">End location <span aria-hidden="true" class="text-red-600">*</span></label>
            <input
              id="trip-end"
              name="endLocation"
              [(ngModel)]="endLocation"
              class="form-input"
              placeholder="Where does it end?"
              required
              [attr.aria-invalid]="submitted && !endLocation.trim()"
              aria-describedby="trip-end-error"
            />
            <p id="trip-end-error" *ngIf="submitted && !endLocation.trim()" class="form-error">End location is required.</p>
          </div>
        </div>

        <p class="form-hint">Your browser will ask for location access. Please allow it so passengers can track the bus.</p>

        <button type="submit" class="btn-primary btn-lg w-full" [disabled]="isStarting">
          <span *ngIf="isStarting" class="spinner" aria-hidden="true"></span>
          {{ isStarting ? 'Starting trip…' : 'Start trip now' }}
        </button>
      </form>

      <!-- Trip in progress -->
      <div *ngIf="isTracking" class="space-y-5">
        <section class="card border-emerald-200" aria-labelledby="live-status-title">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 id="live-status-title" class="flex items-center gap-3 text-base font-semibold text-emerald-800">
              <span class="relative flex h-3 w-3" aria-hidden="true">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
              Live — sharing location
            </h2>
            <span class="badge-brand">Bus {{ busNumber || '—' }}</span>
          </div>

          <p class="mt-4 flex flex-wrap items-center gap-x-2 text-lg font-semibold text-slate-900">
            <span>{{ startLocation }}</span>
            <span aria-hidden="true" class="text-slate-400">→</span>
            <span class="sr-only">to</span>
            <span>{{ endLocation }}</span>
          </p>

          <div class="mt-5">
            <div class="mb-1.5 flex justify-between text-xs text-slate-600">
              <span id="timer-label">Next location update</span>
              <span>{{ 60 - timerValue }}s</span>
            </div>
            <div
              class="h-2 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-labelledby="timer-label"
              aria-valuemin="0"
              aria-valuemax="60"
              [attr.aria-valuenow]="timerValue"
            >
              <div class="h-full rounded-full bg-emerald-500 transition-[width] duration-1000 ease-linear"
                   [style.width.%]="(timerValue / 60) * 100"></div>
            </div>
          </div>
        </section>

        <section class="card" aria-labelledby="coords-title">
          <h2 id="coords-title" class="section-title text-base sm:text-base">Latest coordinates</h2>
          <dl *ngIf="currentCoordinate; else waitingCoords" class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt class="text-slate-500">Latitude</dt>
              <dd class="font-mono font-semibold text-slate-900">{{ currentCoordinate.latitude | number:'1.5-6' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Longitude</dt>
              <dd class="font-mono font-semibold text-slate-900">{{ currentCoordinate.longitude | number:'1.5-6' }}</dd>
            </div>
            <div class="col-span-2">
              <dt class="text-slate-500">Updated</dt>
              <dd class="text-slate-700">{{ currentCoordinate.timestamp | date:'medium' }}</dd>
            </div>
          </dl>
          <ng-template #waitingCoords>
            <p class="flex items-center gap-2 text-sm text-slate-600" role="status">
              <span class="spinner h-4 w-4 text-brand-600" aria-hidden="true"></span>
              Waiting for the first location fix…
            </p>
          </ng-template>
        </section>

        <button type="button" (click)="endTrip()" class="btn-danger btn-lg w-full" [disabled]="isEnding">
          <span *ngIf="isEnding" class="spinner" aria-hidden="true"></span>
          {{ isEnding ? 'Ending trip…' : 'End trip' }}
        </button>
      </div>
    </section>
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

  // UI state
  submitted = false;
  isStarting = false;
  isEnding = false;
  errorMessage = '';
  successMessage = '';

  private locationSubscription?: Subscription;
  private coordinateSubscription?: Subscription;
  private timerSubscription?: Subscription;
  private visibilityChangeHandler?: () => void;
  private beforeUnloadHandler?: () => void;

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    // Only drivers may use this page
    if (!this.authService.isDriver()) {
      this.router.navigate(['/']);
    }

    // Get driver information from auth service
    this.driverId = this.authService.getDriverId();

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
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.busNumber.trim() || !this.startLocation.trim() || !this.endLocation.trim()) {
      this.errorMessage = 'Please enter bus number, start location, and end location.';
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
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      this.errorMessage = 'Geolocation is not supported by your browser, so the trip cannot be tracked.';
      return;
    }

    this.isStarting = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (!this.isValidCoordinate(latitude, longitude)) {
          this.isStarting = false;
          this.errorMessage = 'Received an invalid location from your device. Please try again.';
          return;
        }

        // Save form data
        this.saveFormData();

        // Start location tracking with current location
        this.locationSubscription = this.locationService.startTracking({
          busNumber: this.busNumber,
          driverId: this.driverId,
          startLocation: this.startLocation,
          endLocation: this.endLocation,
          latitude,
          longitude
        }).subscribe({
          next: (location) => {
            this.currentLocation = location;
            this.isTracking = true;
            this.isStarting = false;
            this.submitted = false;
            this.successMessage = 'Trip started. Your location is now being shared.';

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
            this.isStarting = false;
            const errorMessage = error.error?.error || error.error?.message || error.message || 'Please try again.';
            this.errorMessage = 'Error starting trip: ' + errorMessage;
          }
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        this.isStarting = false;
        this.errorMessage = this.describeGeolocationError(error);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  endTrip(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isEnding = true;

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
      next: () => {
        // Now stop tracking after coordinates are deleted
        this.locationService.stopTracking(this.driverId).subscribe({
          next: () => {
            this.resetAfterTrip(true);
            this.successMessage = 'Trip ended successfully. All your location data has been removed from the system.';
          },
          error: (error) => {
            console.error('Error stopping tracking:', error);
            const errorMessage = error.error?.error || error.error?.message || error.message || 'Please try again.';
            // Even if there's an error, clear the local state
            this.resetAfterTrip(false);
            this.errorMessage = 'Trip ended, but the server reported a problem: ' + errorMessage;
          }
        });
      },
      error: (error) => {
        console.error('Error deleting coordinates:', error);
        // Still try to stop tracking even if coordinate deletion fails
        this.locationService.stopTracking(this.driverId).subscribe({
          next: () => {
            this.resetAfterTrip(true);
            this.errorMessage = 'Trip ended, but there was an issue removing your location data from the system: ' +
              (error.error?.message || error.message || 'Unknown error');
          },
          error: (stopError) => {
            console.error('Error stopping tracking:', stopError);
            const errorMessage = stopError.error?.error || stopError.error?.message || stopError.message || 'Please try again.';
            // Even if there's an error, clear the local state
            this.resetAfterTrip(false);
            this.errorMessage = 'Trip ended with issues: ' + errorMessage;
          }
        });
      }
    });
  }

  /** Clears local trip state after ending. `removeHandlers` mirrors the original success paths. */
  private resetAfterTrip(removeHandlers: boolean): void {
    this.isTracking = false;
    this.isEnding = false;
    this.clearFormData();
    this.currentCoordinate = null;
    this.timerValue = 0;

    // Clear trip state from localStorage
    this.clearTripState();

    if (removeHandlers) {
      // Remove event handlers
      this.removeVisibilityHandler();
      this.removeBeforeUnloadHandler();
    }
  }

  private isValidCoordinate(lat: number, lng: number): boolean {
    return Number.isFinite(lat) && Number.isFinite(lng) &&
      lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  private describeGeolocationError(error: GeolocationPositionError): string {
    switch (error?.code) {
      case 1: // PERMISSION_DENIED
        return 'Location permission was denied. Please allow location access for this site in your browser settings, then try again.';
      case 2: // POSITION_UNAVAILABLE
        return 'Your location is currently unavailable. Check that GPS/location services are turned on and try again.';
      case 3: // TIMEOUT
        return 'Getting your location took too long. Please move to an area with better signal and try again.';
      default:
        return 'Unable to get your current location. Please try again.';
    }
  }

  private deleteDriverCoordinates(): Observable<any> {
    // Send request to delete all coordinates for this driver
    // (Authorization header is added by the auth interceptor.)
    return this.http.post(`${this.apiUrl}/coordinates/delete`, {
      driverId: this.driverId
    });
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
      try {
        const data = JSON.parse(savedData);
        this.startLocation = data.startLocation || '';
        this.endLocation = data.endLocation || '';
      } catch (e) {
        console.error('Error parsing saved trip form data:', e);
        this.clearFormData();
      }
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
          const { latitude, longitude } = position.coords;
          if (!this.isValidCoordinate(latitude, longitude)) {
            console.error('Ignoring invalid coordinates:', latitude, longitude);
            return;
          }

          const newCoordinate = {
            latitude,
            longitude,
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
          if (error.code === 1) {
            this.errorMessage = this.describeGeolocationError(error);
          }
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

    this.http.put(`${this.apiUrl}/coordinates`, coordinatesData).subscribe({
      error: (error) => {
        console.error('Error updating coordinates:', error);
      }
    });
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
            const { latitude, longitude } = position.coords;
            if (!this.isValidCoordinate(latitude, longitude)) {
              console.error('Ignoring invalid coordinates:', latitude, longitude);
              return;
            }

            // Send coordinates to the coordinates API
            const coordinatesData = {
              driverId: this.driverId,
              latitude,
              longitude
            };

            this.http.put(`${this.apiUrl}/coordinates`, coordinatesData).subscribe({
              error: (error) => {
                console.error('Error updating coordinates:', error);
              }
            });
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
    // Make a request to check if the trip is still active
    this.http.get(`${this.apiUrl}/locations/check`).subscribe({
      next: (response: any) => {
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
      error: (error) => {
        console.error('Error validating trip status:', error);
        // If there's an error checking the trip status, assume it's not active
        this.isTracking = false;
        this.currentCoordinate = null;
        this.timerValue = 0;
        this.clearTripState();
      }
    });
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
