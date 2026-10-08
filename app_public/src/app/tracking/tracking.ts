import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocationService } from '../services/location.service';
import { staticMapUrl, mapsLink, hasPosition } from '../shared/maps';

interface TrackedBus {
  driverId: string;
  email: string;
  busNumber: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  tripExpired: boolean;
}

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  template: `
    <section class="page">
      <header class="page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="page-title flex items-center gap-3">
            Tracked buses
            <span class="badge-brand" [attr.aria-label]="trackedBuses.length + ' tracked buses'">{{ trackedBuses.length }}</span>
          </h1>
          <p class="page-subtitle">Live positions refresh automatically every 30 seconds.</p>
        </div>
        @if (trackedBuses.length > 0) {
          <div class="flex flex-col items-stretch gap-1 sm:items-end">
            <button type="button" class="btn-secondary" (click)="checkBusStatus()" [disabled]="pendingChecks > 0">
              @if (pendingChecks > 0) {
                <span class="spinner h-4 w-4" aria-hidden="true"></span>
                Refreshing…
              } @else {
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m0 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                Refresh now
              }
            </button>
            @if (lastChecked) {
              <p class="text-center text-xs text-slate-500 sm:text-right">Last checked {{ lastChecked | date: 'HH:mm:ss' }}</p>
            }
          </div>
        }
      </header>

      <div aria-live="polite">
        @if (trackedBuses.length === 0) {
          <div class="empty-state">
            <svg class="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
            </svg>
            <h2 class="mt-4 text-lg font-semibold text-slate-900">You're not tracking any buses yet</h2>
            <p class="mt-1 max-w-sm text-sm text-slate-500">
              Find a bus by its number or by your route, then choose "Track this bus" to follow it here.
            </p>
            <div class="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <a routerLink="/find-by-number" class="btn-primary">Find by bus number</a>
              <a routerLink="/find-by-registration" class="btn-secondary">Find by route</a>
            </div>
          </div>
        } @else {
          <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (bus of trackedBuses; track bus.driverId) {
              <li class="card flex flex-col" [class.opacity-80]="bus.tripExpired">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Bus</p>
                    <h2 class="text-2xl font-bold" [class.text-brand-700]="!bus.tripExpired" [class.text-slate-500]="bus.tripExpired">{{ bus.busNumber }}</h2>
                  </div>
                  @if (bus.tripExpired) {
                    <span class="badge-danger">Trip ended</span>
                  } @else {
                    <span class="badge-success">
                      <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
                      Live
                    </span>
                  }
                </div>
                <p class="mt-2 truncate text-sm text-slate-700" [title]="bus.email">{{ bus.email }}</p>
                @if (bus.timestamp) {
                  <p class="text-xs text-slate-500">Updated {{ bus.timestamp | date: 'medium' }}</p>
                }

                @if (!bus.tripExpired) {
                  @if (hasPos(bus.latitude, bus.longitude)) {
                    <p class="mt-1 font-mono text-xs text-slate-400">
                      {{ bus.latitude | number: '1.5-5' }}, {{ bus.longitude | number: '1.5-5' }}
                    </p>
                  }
                  <div class="mt-4 overflow-hidden rounded-xl border border-slate-200">
                    @if (mapUrl(bus.latitude, bus.longitude); as src) {
                      <img [src]="src" [alt]="'Map showing the location of bus ' + bus.busNumber" class="h-36 w-full object-cover" loading="lazy" />
                    } @else {
                      <div class="flex h-36 w-full flex-col items-center justify-center gap-1 bg-slate-100 text-slate-400">
                        <svg class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
                        </svg>
                        <span class="text-xs">Map preview unavailable</span>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    This trip has ended — the driver has finished their route. You can remove it from your list.
                  </p>
                }

                <div class="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  @if (!bus.tripExpired && hasPos(bus.latitude, bus.longitude)) {
                    <a [href]="mapsHref(bus.latitude, bus.longitude)" target="_blank" rel="noopener noreferrer" class="btn-ghost btn-sm">
                      Open in Google Maps
                      <span class="sr-only">(opens in a new tab)</span>
                    </a>
                  } @else {
                    <span class="hidden sm:block"></span>
                  }
                  <button type="button" class="btn-ghost btn-sm text-red-600 hover:bg-red-50 hover:text-red-700" (click)="removeBus(bus.driverId)">
                    Remove<span class="sr-only"> bus {{ bus.busNumber }}</span>
                  </button>
                </div>
              </li>
            }
          </ul>
        }
      </div>
    </section>
  `
})
export class TrackingComponent implements OnInit, OnDestroy {
  trackedBuses: TrackedBus[] = [];
  lastChecked: Date | null = null;
  pendingChecks = 0;

  readonly mapUrl = (lat: number, lng: number) => staticMapUrl(lat, lng);
  readonly mapsHref = (lat: number, lng: number) => mapsLink(lat, lng);
  readonly hasPos = (lat: number, lng: number) => hasPosition(lat, lng);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.loadTrackedBuses();
    this.checkBusStatus();

    // Check bus status every 30 seconds
    this.intervalId = setInterval(() => this.checkBusStatus(), 30000);
  }

  ngOnDestroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  loadTrackedBuses(): void {
    try {
      const tracked = localStorage.getItem('trackedBuses');
      const parsed = tracked ? JSON.parse(tracked) : [];
      this.trackedBuses = Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Could not read tracked buses from storage:', err);
      this.trackedBuses = [];
    }
  }

  saveTrackedBuses(): void {
    try {
      localStorage.setItem('trackedBuses', JSON.stringify(this.trackedBuses));
    } catch (err) {
      console.error('Could not save tracked buses:', err);
    }
  }

  removeBus(driverId: string): void {
    this.trackedBuses = this.trackedBuses.filter((bus) => bus.driverId !== driverId);
    this.saveTrackedBuses();
  }

  checkBusStatus(): void {
    this.lastChecked = new Date();
    // For each tracked bus, check whether the trip is still active
    this.trackedBuses.forEach((bus) => {
      if (bus.tripExpired) return;

      this.pendingChecks++;
      this.locationService.getBusLocationsByNumber(bus.busNumber).subscribe({
        next: (locations) => {
          // Find this specific driver (driverId may be top-level or nested under userId)
          const driverLocation = locations.find((loc: any) => {
            const locationDriverId = loc.driverId || (loc.userId && loc.userId.driverId);
            return locationDriverId === bus.driverId;
          });

          if (!driverLocation) {
            // Driver is no longer active
            bus.tripExpired = true;
          } else {
            bus.latitude = driverLocation.latitude;
            bus.longitude = driverLocation.longitude;
            bus.timestamp = driverLocation.timestamp;
          }
          this.saveTrackedBuses();
          this.pendingChecks = Math.max(0, this.pendingChecks - 1);
        },
        error: (error) => {
          console.error('Error checking bus status:', error);
          this.pendingChecks = Math.max(0, this.pendingChecks - 1);
        }
      });
    });
  }
}
